import os
import subprocess

path = r"d:\Github\photo-style"

def run_git(args):
    try:
        result = subprocess.run(["git"] + args, cwd=path, capture_output=True, text=True)
        return result
    except Exception as e:
        return str(e)

print("--- Filesystem Check (Raw Bytes) ---")
for root, dirs, files in os.walk(path):
    if ".git" in root: continue
    for name in files + dirs:
        print(f"{repr(name)} : {[ord(c) for c in name]}")

print("\n--- Git Index Check (Raw Output) ---")
# Use -z to get nul-separated output, which is safer for weird names
res = subprocess.run(["git", "ls-files", "-s", "-z"], cwd=path, capture_output=True)
output = res.stdout
parts = output.split(b'\0')
for p in parts:
    if p:
        # Format is "mode hash stage\tname"
        try:
            tab_split = p.split(b'\t', 1)
            if len(tab_split) > 1:
                name = tab_split[1]
                print(f"Index Entry: {repr(name)} : {[b for b in name]}")
        except:
            print(f"Could not parse part: {repr(p)}")
