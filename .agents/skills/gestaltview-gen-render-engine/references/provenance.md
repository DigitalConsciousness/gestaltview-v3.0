# Package provenance

This record identifies the historical source package and export used to seed this
skill. Package/export identity is provenance, not evidence of live capability.
Nothing in these hashes or the archive inventory proves that a runtime helper,
worker, storage path, database ledger, or render target is deployed or working.

## Original pinned identities

- Original `.skill` commit:
  `f4ee9d03b5ff377488c1aa56973e67d54d14c4af`
- Original `.skill` Git blob: `e9f99687bcb248767eeca6726e72b795b162fd19`
- Original `.skill` SHA-256:
  `fb82f6cc205c59025c4a975453bd7b62e6f84020656ff3697ba9f07f61116e77`
- Source JSON export SHA-256: `616142331d5f27e23de804c21e8a98cdfc67dd6dac5f166cef443d9528f3155e`
- Original archive inventory: exactly one file,
  `gestaltview-gen-render-engine/SKILL.md`, 7,474 uncompressed bytes, dated
  2026-07-14 (archive timestamp 22:06:10).

The commit, blob ID, digest, and inventory above identify the immutable original
archive. The tracked package at the current checkout is mutable and may acquire
runtime helpers when it is regenerated; its current digest must be computed
separately and must not replace or be presented as the original pinned identity.

## Primary verification

Run this Python standard-library verifier from the repository root. It reads the
original bytes from the pinned commit rather than from the mutable working tree:

```python
import hashlib
import io
import subprocess
import zipfile

commit = "f4ee9d03b5ff377488c1aa56973e67d54d14c4af"
path = ".agents/skills/gestaltview-gen-render-engine/gestaltview-gen-render-engine.skill"
expected_blob = "e9f99687bcb248767eeca6726e72b795b162fd19"
expected_sha256 = "fb82f6cc205c59025c4a975453bd7b62e6f84020656ff3697ba9f07f61116e77"

blob = subprocess.run(
    ["git", "rev-parse", f"{commit}:{path}"],
    check=True,
    stdout=subprocess.PIPE,
).stdout.decode().strip()
archive = subprocess.run(
    ["git", "show", f"{commit}:{path}"],
    check=True,
    stdout=subprocess.PIPE,
).stdout
digest = hashlib.sha256(archive).hexdigest()
assert blob == expected_blob, (blob, expected_blob)
assert digest == expected_sha256, (digest, expected_sha256)
print("blob", blob)
print("sha256", digest)
with zipfile.ZipFile(io.BytesIO(archive)) as package:
    for member in package.infolist():
        print(member.filename, member.file_size, member.date_time)
```

Expected inventory output is the single 7,474-byte `SKILL.md` member dated
2026-07-14. This verifies package provenance only, not live capability.

## Secondary current-checkout commands

Run from the repository root:

```sh
sha256sum .agents/skills/gestaltview-gen-render-engine/gestaltview-gen-render-engine.skill
unzip -l .agents/skills/gestaltview-gen-render-engine/gestaltview-gen-render-engine.skill
unzip -Z -v .agents/skills/gestaltview-gen-render-engine/gestaltview-gen-render-engine.skill
sha256sum .agents/skills/gestaltview-gen-render-engine/skill-gestaltview-gen-render-engine-v2.0.0.json
```

At the time of this record, the mutable tracked archive command also returned
`fb82…` and one 7,474-byte `SKILL.md` entry dated 2026-07-14. The last command
returned the recorded source JSON export identity
`616142331d5f27e23de804c21e8a98cdfc67dd6dac5f166cef443d9528f3155e`.
