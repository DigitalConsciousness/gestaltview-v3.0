#!/usr/bin/env python3
"""
Validates that commands referenced in a handoff or code delivery exist as
executable scripts in the project's package.json or equivalent task runner.

Usage:
    python3 check_scripts.py <directory> [--commands "pnpm run build, pnpm test"]

Checks:
    - Each command maps to a script in package.json
    - Alternative runners: Makefile and justfile
    - Reports missing scripts so the handoff doesn't reference non-existent commands
"""

import json
import os
import re
import shlex
import sys


def parse_package_json(directory: str) -> dict:
    """Parse package.json and return available scripts."""
    pkg_path = os.path.join(directory, "package.json")
    if os.path.isfile(pkg_path):
        with open(pkg_path) as f:
            return json.load(f)
    return {}


def parse_makefile(directory: str) -> list:
    """Extract target names from a Makefile."""
    targets = []
    for fname in ["Makefile", "makefile", "GNUmakefile"]:
        fpath = os.path.join(directory, fname)
        if os.path.isfile(fpath):
            with open(fpath) as f:
                for line in f:
                    match = re.match(r"^([a-zA-Z0-9_\-]+):", line)
                    if match:
                        targets.append(match.group(1))
    return targets


def parse_justfile(directory: str) -> list:
    """Extract recipe names from a justfile."""
    targets = []
    fpath = os.path.join(directory, "justfile")
    if os.path.isfile(fpath):
        with open(fpath) as f:
            for line in f:
                match = re.match(r"^([a-zA-Z0-9_\-]+)\s*:", line)
                if match:
                    targets.append(match.group(1))
    return targets


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


def normalized_command_tokens(command: str) -> list:
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


def classify_command(command: str) -> tuple:
    """Return the task runner and target for a supported command."""
    if contains_unsafe_shell_syntax(command):
        return "unsafe", ""
    parts = normalized_command_tokens(command)
    if not parts:
        return "unsupported", command

    runner = parts[0]
    if runner in {"pnpm", "yarn"}:
        if len(parts) >= 3 and parts[1] == "run" and not parts[2].startswith("-"):
            return "package", parts[2]
        if len(parts) >= 2 and parts[1] in SAFE_PACKAGE_SHORTHANDS:
            return "package", parts[1]
    elif runner == "npm":
        if len(parts) >= 3 and parts[1] == "run" and not parts[2].startswith("-"):
            return "package", parts[2]
        if len(parts) >= 2 and parts[1] in SAFE_PACKAGE_SHORTHANDS:
            return "package", parts[1]
    elif runner == "make" and len(parts) == 2 and not parts[1].startswith("-"):
        return "make", parts[1]
    elif runner == "just" and len(parts) == 2 and not parts[1].startswith("-"):
        return "just", parts[1]
    return "unsupported", command


def check_commands(commands: list, directory: str) -> dict:
    """Full check: do all referenced commands exist in the project's task runner?"""
    result = {
        "directory": directory,
        "commands": [],
        "missing": [],
        "unsafe": [],
        "unsupported": [],
        "available_runners": [],
    }

    pkg = parse_package_json(directory)
    if "scripts" in pkg:
        result["available_runners"].append("package.json")
        for name in sorted(pkg["scripts"].keys()):
            result["commands"].append({"name": name, "command": pkg["scripts"][name], "source": "package.json"})

    makefile_targets = parse_makefile(directory)
    if makefile_targets:
        result["available_runners"].append(f"Makefile ({len(makefile_targets)} targets)")

    justfile_targets = parse_justfile(directory)
    if justfile_targets:
        result["available_runners"].append(f"justfile ({len(justfile_targets)} recipes)")

    package_scripts = set(pkg.get("scripts", {}).keys())
    make_targets = set(makefile_targets)
    just_targets = set(justfile_targets)
    for command in commands:
        runner, target = classify_command(command)
        available = {
            "package": package_scripts,
            "make": make_targets,
            "just": just_targets,
        }.get(runner)
        if runner == "unsafe":
            result["unsafe"].append(command)
        elif available is None:
            result["unsupported"].append(command)
        elif target not in available:
            result["missing"].append(target)

    return result


def print_results(check_result: dict, commands: list):
    """Print a readable summary."""
    print(f"\nDirectory: {check_result['directory']}")
    print(f"Available runners: {', '.join(check_result['available_runners']) or 'None found'}")

    if check_result["commands"]:
        print(f"\nAvailable scripts ({len(check_result['commands'])}):")
        for entry in check_result["commands"][:20]:
            print(f"  • {entry['name']} ({entry['source']})")
        if len(check_result["commands"]) > 20:
            print(f"  ... and {len(check_result['commands']) - 20} more")

    print(f"\nReferenced commands: {len(commands)}")

    if check_result["missing"]:
        print(f"\n⚠ MISSING commands (referenced but not found):")
        for name in check_result["missing"]:
            print(f"  ✗ '{name}' — missing from the selected task runner")
            # Suggest similar scripts
            similar = [c["name"] for c in check_result["commands"]
                       if name.lower() in c["name"].lower() or c["name"].lower() in name.lower()]
            if similar:
                print(f"    Did you mean: {', '.join(similar)}?")
    if check_result["unsupported"]:
        print("\n⚠ Unsupported or unparsed commands:")
        for _command in check_result["unsupported"]:
            print("  ✗ unsupported command (details redacted)")
    if check_result["unsafe"]:
        print("\n⚠ Unsupported or unsafe compound commands:")
        for _command in check_result["unsafe"]:
            print("  ✗ unsafe command (details redacted)")
    if not check_result["missing"] and not check_result["unsupported"] and not check_result["unsafe"]:
        print(f"\n✓ All referenced scripts found")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 check_scripts.py <directory> [--commands 'cmd1, cmd2, ...']")
        print()
        print("Examples:")
        print("  python3 check_scripts.py /path/to/project")
        print('  python3 check_scripts.py . --commands "pnpm run build, pnpm run test, pnpm run type-check"')
        sys.exit(1)

    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Directory not found: {directory}")
        sys.exit(1)

    # Parse --commands flag
    commands = []
    if "--commands" in sys.argv:
        idx = sys.argv.index("--commands")
        if idx + 1 < len(sys.argv):
            commands = [c.strip() for c in sys.argv[idx + 1].split(",") if c.strip()]

    result = check_commands(commands, directory)
    print_results(result, commands)
    sys.exit(1 if result["missing"] or result["unsupported"] or result["unsafe"] else 0)


if __name__ == "__main__":
    main()
