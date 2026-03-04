import os
import subprocess

path = r"d:\Github\photo-style"

def run_git(args):
    try:
        # Try to run git directly
        result = subprocess.run(["git"] + args, cwd=path, capture_output=True, text=True)
        return result
    except Exception as e:
        return str(e)

print("Files on disk (repr):")
for f in os.listdir(path):
    print(f"{repr(f)}")

print("\nGit index files (repr):")
res = run_git(["ls-files", "--stage"])
if isinstance(res, str):
    print(f"Error: {res}")
else:
    print(res.stdout)
