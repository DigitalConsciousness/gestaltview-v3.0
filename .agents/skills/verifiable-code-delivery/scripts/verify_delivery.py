#!/usr/bin/env python3
"""
Verifies that a code artifact handoff meets the delivery checklist gates.

Usage:
    python3 verify_delivery.py <handoff_file_or_directory>

Checks:
    1. File paths are exact and exist (or are documented as new)
    2. Verification commands reference scripts that exist in package.json
    3. No hardcoded secrets in delivered code
    4. Delivery structure: Files Changed, Contracts, Verification,
       Regression Risk, and Recovery sections present
"""

import os
import re
import shlex
import sys
import json
from typing import List, Dict, Optional, Tuple


def find_package_json(base_dir: str) -> Tuple[Optional[str], Optional[dict]]:
    """Find and parse the nearest package.json by walking upward."""
    current = os.path.abspath(base_dir)
    while True:
        pkg_path = os.path.join(current, "package.json")
        if os.path.isfile(pkg_path):
            with open(pkg_path) as f:
                return pkg_path, json.load(f)
        parent = os.path.dirname(current)
        if parent == current:
            return None, None
        current = parent


def extract_file_paths(content: str) -> List[str]:
    """Extract backtick-wrapped file paths from handoff content."""
    paths = set()
    # Match `path/to/file.ext` patterns
    for match in re.finditer(r"`([a-zA-Z0-9_/.\-]+\.(?:ts|tsx|js|jsx|py|json|yaml|yml|css|html|sql|sh))`", content):
        paths.add(match.group(1))
    return sorted(paths)


def path_is_documented_as_new(content: str, path: str) -> bool:
    """Return whether a path is explicitly described as a not-yet-created file."""
    marker = re.compile(r"\b(?:new file|will be created|to be created)\b", re.IGNORECASE)
    return any(f"`{path}`" in line and marker.search(line) for line in content.splitlines())


def extract_commands(content: str) -> List[str]:
    """Extract shell commands from bash code blocks."""
    commands = []
    in_block = False
    for line in content.split("\n"):
        if line.strip().startswith("```bash"):
            in_block = True
            continue
        if in_block and line.strip().startswith("```"):
            in_block = False
            continue
        if in_block and line.strip() and not line.strip().startswith("#"):
            cmd = line.strip()
            if cmd:
                commands.append(cmd)
    return commands


REQUIRED_REPORT_SECTIONS = (
    "Files Changed",
    "Contracts",
    "Verification",
    "Regression Risk",
    "Recovery",
)


def report_section_blocks(content: str) -> Dict[str, str]:
    """Extract canonical headings or compact bold report labels."""
    names = "|".join(re.escape(name) for name in REQUIRED_REPORT_SECTIONS)
    marker = re.compile(
        rf"(?im)^(?:#{{2,3}}\s+({names})\s*|\*\*({names})\s*:\*\*)\s*$"
    )
    matches = list(marker.finditer(content))
    blocks = {}
    for index, match in enumerate(matches):
        name = match.group(1) or match.group(2)
        end = matches[index + 1].start() if index + 1 < len(matches) else len(content)
        blocks[name] = content[match.end():end]
    return blocks


SAFE_PACKAGE_SHORTHANDS = {"test", "start", "stop", "restart"}


def contains_unsafe_shell_syntax(command: str) -> bool:
    """Detect shell composition syntax without executing the command."""
    if "\n" in command or "\r" in command or "`" in command or "$(" in command:
        return True
    try:
        lexer = shlex.shlex(command, posix=True, punctuation_chars="&|;<>()")
        lexer.whitespace_split = True
        lexer.commenters = ""
        tokens = list(lexer)
    except ValueError:
        return True
    return any(token and all(char in "&|;<>()" for char in token) for token in tokens)


def normalized_command_tokens(command: str) -> List[str]:
    """Tokenize a command and remove safe environment prefixes."""
    try:
        tokens = shlex.split(command)
    except ValueError:
        return []
    if tokens and tokens[0] == "env":
        tokens = tokens[1:]
    assignment = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*=.*$")
    while tokens and assignment.match(tokens[0]):
        tokens = tokens[1:]
    return tokens


def is_package_command(command: str) -> bool:
    """Return whether the normalized command invokes a package manager."""
    tokens = normalized_command_tokens(command)
    return bool(tokens and tokens[0] in {"npm", "pnpm", "yarn"})


def extract_package_script_name(command: str) -> Optional[str]:
    """Extract a script name without accepting package-management commands."""
    tokens = normalized_command_tokens(command)
    if len(tokens) < 2:
        return None
    runner = tokens[0]
    operation = tokens[1]
    if runner in {"pnpm", "yarn"}:
        if operation == "run":
            return tokens[2] if len(tokens) >= 3 else None
        if operation in SAFE_PACKAGE_SHORTHANDS:
            return operation
    elif runner == "npm":
        if operation == "run":
            return tokens[2] if len(tokens) >= 3 else None
        if operation in SAFE_PACKAGE_SHORTHANDS:
            return operation
    return None


def check_command_scripts_exist(commands: List[str], pkg: Optional[dict]) -> List[Tuple[str, bool]]:
    """Check if package.json scripts referenced in commands exist."""
    results = []
    if not pkg or "scripts" not in pkg:
        return results

    script_names = set(pkg["scripts"].keys())
    for command in commands:
        script_name = extract_package_script_name(command)
        if script_name:
            results.append((script_name, script_name in script_names))
    return results


def check_for_secrets(content: str) -> List[str]:
    """Scan for hardcoded secrets and credentials."""
    issues = []

    # Supabase anon/public keys with actual values
    supabase_patterns = [
        (r"VITE_SUPABASE_URL\s*=\s*['\"]https?://[^'\"]+['\"]", "Hardcoded Supabase URL"),
        (r"VITE_SUPABASE_ANON_KEY\s*=\s*['\"][A-Za-z0-9._\-]{20,}['\"]", "Hardcoded Supabase anon key"),
        (r"SUPABASE_SERVICE_ROLE_KEY\s*=\s*['\"][A-Za-z0-9._\-]{20,}['\"]", "Hardcoded service role key"),
    ]

    # Generic patterns
    generic_patterns = [
        (r"(?:password|passwd|secret|token|api_key|apikey|private_key)\s*[:=]\s*['\"][^'\"]{8,}['\"]",
         "Potential hardcoded credential"),
    ]

    all_patterns = supabase_patterns + generic_patterns
    for pattern, label in all_patterns:
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            # Mask the value in output
            line_num = content[:match.start()].count("\n") + 1
            issues.append(f"Line {line_num}: {label}")

    return issues


def check_hardcoded_secrets_in_files(base_dir: str) -> List[str]:
    """Scan source files for hardcoded secrets."""
    issues = []
    dangerous_extensions = {".ts", ".tsx", ".js", ".jsx", ".py", ".json", ".yaml", ".yml", ".env"}

    for root, dirs, files in os.walk(base_dir):
        # Skip node_modules, .git, dist
        dirs[:] = [d for d in dirs if d not in {"node_modules", ".git", "dist", ".next", "build"}]

        for fname in files:
            ext = os.path.splitext(fname)[1].lower()
            if ext not in dangerous_extensions:
                continue

            fpath = os.path.join(root, fname)
            try:
                with open(fpath, errors="ignore") as f:
                    content = f.read()
            except Exception:
                continue

            file_issues = check_for_secrets(content)
            for issue in file_issues:
                issues.append(f"{fpath}: {issue}")

    return issues


def check_delivery_sections(content: str) -> Dict[str, bool]:
    """Check for required delivery sections."""
    blocks = report_section_blocks(content)
    return {name: name in blocks for name in REQUIRED_REPORT_SECTIONS}


def check_hygiene_in_handoff(content: str) -> List[str]:
    """Check handoff content for common hygiene issues."""
    issues = []

    # Debug artifacts
    if re.search(r"console\.log\(", content):
        issues.append("Contains console.log() calls — remove debug logging")
    if re.search(r"# TODO|// TODO|FIXME|HACK", content):
        issues.append("Contains TODO/FIXME/HACK comments — resolve or document as known debt")

    return issues


def verify_handoff(handoff_path: str, explicit_project_root: Optional[str] = None) -> Dict:
    """Run all checks against a handoff file."""
    result = {
        "file": handoff_path,
        "gates": {},
        "issues": [],
        "warnings": [],
        "passed": True,
    }

    if not os.path.isfile(handoff_path):
        result["issues"].append(f"File not found: {handoff_path}")
        result["passed"] = False
        return result

    with open(handoff_path) as f:
        content = f.read()

    base_dir = os.path.dirname(os.path.abspath(handoff_path)) if os.path.dirname(handoff_path) else os.getcwd()
    package_search_root = os.path.abspath(explicit_project_root) if explicit_project_root else base_dir
    pkg_path, pkg = find_package_json(package_search_root)
    project_root = (
        os.path.abspath(explicit_project_root)
        if explicit_project_root
        else os.path.dirname(pkg_path) if pkg_path else base_dir
    )

    # Gate 1: File paths are present
    paths = extract_file_paths(content)
    missing_paths = []
    for path in paths:
        resolved_path = path if os.path.isabs(path) else os.path.join(project_root, path)
        if not os.path.exists(resolved_path) and not path_is_documented_as_new(content, path):
            missing_paths.append(path)
    result["gates"]["exact_paths"] = bool(paths) and not missing_paths
    if not paths:
        result["issues"].append("No file paths found in handoff")
    for path in missing_paths:
        result["issues"].append(f"Referenced path not found: {path}")

    # Gate 2: Delivery sections present
    sections = check_delivery_sections(content)
    result["gates"]["delivery_sections"] = sections
    missing = [k for k, v in sections.items() if not v]
    if missing:
        result["issues"].append(f"Missing delivery sections: {', '.join(missing)}")

    # Gate 3: Verification contains executable commands
    verification = report_section_blocks(content).get("Verification", "")
    commands = extract_commands(verification)
    result["gates"]["has_commands"] = len(commands) > 0
    if not commands:
        result["issues"].append(
            "Verification must contain executable commands in a bash block"
        )

    # Gate 4: Commands reference real scripts
    script_checks = check_command_scripts_exist(commands, pkg)
    unsafe_commands = [command for command in commands if contains_unsafe_shell_syntax(command)]
    for _command in unsafe_commands:
        result["issues"].append("Unsupported or unsafe compound validation command")
    package_commands = [
        command for command in commands
        if command not in unsafe_commands and is_package_command(command)
    ]
    if package_commands and pkg is None:
        result["issues"].append("No package.json found for package command validation")
    for command in package_commands:
        if extract_package_script_name(command) is None:
            result["issues"].append(f"Unsupported or unparsed package command: {command}")
    for name, exists in script_checks:
        if not exists:
            result["issues"].append(f"Script '{name}' not found in package.json")
    result["gates"]["valid_scripts"] = script_checks

    # Gate 5: No secrets in handoff
    secret_issues = check_for_secrets(content)
    if secret_issues:
        for issue in secret_issues:
            result["issues"].append(f"Handoff: {issue}")
    result["gates"]["no_secrets"] = len(secret_issues) == 0

    # Gate 6: Hygiene check
    hygiene = check_hygiene_in_handoff(content)
    if hygiene:
        result["warnings"].extend(hygiene)
    result["gates"]["hygiene_clean"] = len(hygiene) == 0

    # Aggregate
    result["passed"] = len(result["issues"]) == 0

    return result


def print_report(result: Dict):
    """Print a human-readable report."""
    print(f"\n{'=' * 60}")
    print(f"Delivery Verification: {result['file']}")
    print(f"{'=' * 60}")

    status = "PASSED" if result["passed"] else "FAILED"
    color = "\033[92m" if result["passed"] else "\033[91m"
    print(f"\nOverall: {color}{status}\033[0m")

    print("\n--- Gates ---")
    for gate, value in result["gates"].items():
        if gate == "delivery_sections":
            for section, present in value.items():
                icon = "✓" if present else "✗"
                print(f"  {icon} {section}")
        elif gate == "valid_scripts":
            for name, exists in value:
                icon = "✓" if exists else "⚠"
                print(f"  {icon} Script '{name}' {'exists' if exists else 'NOT FOUND'}")
        elif isinstance(value, bool):
            icon = "✓" if value else "✗"
            print(f"  {icon} {gate}")
        elif isinstance(value, list):
            icon = "✓" if len(value) > 0 else "✗"
            print(f"  {icon} {gate}: {len(value)} items")

    if result["issues"]:
        print("\n--- Issues ---")
        for issue in result["issues"]:
            print(f"  ✗ {issue}")

    if result["warnings"]:
        print("\n--- Warnings ---")
        for warning in result["warnings"]:
            print(f"  ⚠ {warning}")

    print()


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 verify_delivery.py <handoff_file_or_directory>")
        sys.exit(1)

    target = sys.argv[1]
    explicit_project_root = None
    if "--project-root" in sys.argv:
        index = sys.argv.index("--project-root")
        if index + 1 >= len(sys.argv) or not os.path.isdir(sys.argv[index + 1]):
            print("--project-root must reference an existing directory")
            sys.exit(1)
        explicit_project_root = sys.argv[index + 1]
    if os.path.isfile(target):
        result = verify_handoff(target, explicit_project_root)
        print_report(result)
        sys.exit(0 if result["passed"] else 1)
    elif os.path.isdir(target):
        results = []
        for root, dirs, files in os.walk(target):
            for fname in files:
                if fname.endswith((".md", ".txt")):
                    fpath = os.path.join(root, fname)
                    results.append(verify_handoff(fpath, explicit_project_root))

        issues = check_hardcoded_secrets_in_files(target)
        if not results:
            print(f"Scanning directory '{target}' for code hygiene issues...")
            if issues:
                print(f"Found {len(issues)} potential credential issues:")
                for issue in issues:
                    print(f"  ✗ {issue}")
                sys.exit(1)
            else:
                print("No hardcoded secrets found in source files.")
                sys.exit(0)
        else:
            all_passed = all(r["passed"] for r in results) and not issues
            for r in results:
                print_report(r)
            if issues:
                print(f"Found {len(issues)} potential credential issues:")
                for issue in issues:
                    print(f"  ✗ {issue}")
            print(f"Directory result: {'PASSED' if all_passed else 'FAILED'} "
                  f"({sum(1 for r in results if r['passed'])}/{len(results)} files passed)")
            sys.exit(0 if all_passed else 1)
    else:
        print(f"Path not found: {target}")
        sys.exit(1)


if __name__ == "__main__":
    main()
