# G0 storage cleanup

22 November 2026, Africa/Cairo. Free space on the Mac's APFS container rose from **12,836,093,952 bytes** at the start to **22,159,446,016 bytes** before the first Chrome retest and **22,278,987,776 bytes** during the second, after two additional download caches were removed. The measured net gain was **9.44 GB**. Chrome's download will consume some of that space.

| Removed | Verification |
|---|---|
| Unreferenced pnpm packages and metadata | Ran the official store prune command against versions 10 and 11. The version 11 command checked six registered projects and found no global virtual store use. Installed project dependency directories were outside the cleanup scope. |
| Unreferenced uv cache | Ran normal `uv cache prune` with its in-use checks. It reported 318.9 MiB removed. |
| One unfinished Android SDK download | The 769 MB partial ZIP was from September, had no open handle and had no SDK cache reference. Installed NDK and SDK packages were preserved. |
| npm downloads and execution caches | Cleared registry downloads, two idle Lighthouse npx copies, and the incomplete Firebase CLI npx attempt. Preserved the working Firebase CLI and ROACLAW's pinned pnpm launcher. |
| Five Flutter download ZIPs | Verified the matching extracted engine directories were present. The SDK and extracted engines were preserved. |
| Two additional tool downloads | Removed the idle DotSlash React Native DevTools download and the cached Higgsfield Blender update ZIP after confirming the same add-on version was installed. |
| Incomplete duplicate Unity 6000.3.28f1 editor | The partial application had no Info.plist, no registered installation claim and no open handles. A checksum comparison against the working ARM64 editor found one differing generated Burst cache file, which was copied to the gitignored ROACLAW recovery folder and hash-verified before removal. The complete editor and its Android playback module were retained. |

Project files, worktrees, browser profiles, app sessions, and personal files were outside the cleanup. The only browser profile created for the retest belongs to ROACLAW under the gitignored `.local/g0-chrome` path.
