import io
import stat
import unittest
import zipfile
from collections import Counter
from pathlib import Path
from pathlib import PurePosixPath
from pathlib import PureWindowsPath


SKILL_ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = SKILL_ROOT / "gestaltview-gen-render-engine.skill"
PACKAGE_ROOT = "gestaltview-gen-render-engine"
SKILL_MEMBER = f"{PACKAGE_ROOT}/SKILL.md"
PLANNED_HELPERS = {
    f"{PACKAGE_ROOT}/scripts/gestaltview_render_validate_scene_graph.py",
    f"{PACKAGE_ROOT}/scripts/gestaltview_render_build_mindmap.py",
    f"{PACKAGE_ROOT}/scripts/gestaltview_render_submit_job.py",
}


def archive_member_type_errors(entries: list[zipfile.ZipInfo]) -> list[str]:
    errors = []
    for entry in entries:
        mode = entry.external_attr >> 16
        expected_type = stat.S_ISDIR if entry.is_dir() else stat.S_ISREG
        if not expected_type(mode):
            errors.append(entry.filename)
    return errors


class PackageProvenanceTest(unittest.TestCase):
    def test_archive_rejects_symlink_outside_scripts(self) -> None:
        member = zipfile.ZipInfo(SKILL_MEMBER)
        member.create_system = 3
        member.external_attr = (stat.S_IFLNK | 0o777) << 16
        archive = io.BytesIO()
        with zipfile.ZipFile(archive, "w") as package:
            package.writestr(member, "target")
        archive.seek(0)

        with zipfile.ZipFile(archive) as package:
            errors = archive_member_type_errors(package.infolist())

        self.assertEqual([SKILL_MEMBER], errors)

    def test_archive_contains_safe_complete_runtime_package(self) -> None:
        with zipfile.ZipFile(ARCHIVE) as package:
            entries = package.infolist()

        names = [entry.filename for entry in entries]
        duplicates = sorted(
            name for name, count in Counter(names).items() if count > 1
        )
        self.assertEqual([], duplicates, f"archive has duplicate members: {duplicates}")

        unsafe_names = [
            name
            for name in names
            if "\\" in name
            or PurePosixPath(name).is_absolute()
            or PureWindowsPath(name).is_absolute()
            or ".." in PurePosixPath(name).parts
        ]
        self.assertEqual([], unsafe_names, f"archive has unsafe members: {unsafe_names}")
        type_errors = archive_member_type_errors(entries)
        self.assertEqual(
            [], type_errors, f"archive has non-regular members: {type_errors}"
        )

        self.assertIn(SKILL_MEMBER, names)

        helper_entries = [
            entry
            for entry in entries
            if entry.filename.startswith(f"{PACKAGE_ROOT}/scripts/")
            and not entry.is_dir()
        ]
        helper_names = {entry.filename for entry in helper_entries}
        self.assertEqual(
            PLANNED_HELPERS,
            helper_names,
            "tracked .skill archive must contain exactly the three planned "
            "Python runtime helpers",
        )

        for entry in helper_entries:
            mode = entry.external_attr >> 16
            self.assertTrue(
                stat.S_IMODE(mode) & 0o111,
                f"runtime helper is not executable: {entry.filename}",
            )


if __name__ == "__main__":
    unittest.main()
