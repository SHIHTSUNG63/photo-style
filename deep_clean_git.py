import os
import subprocess

path = r"d:\Github\photo-style"

def run_git(args):
    try:
        result = subprocess.run(["git"] + args, cwd=path, capture_output=True, text=True)
        print(f"Git {' '.join(args)} output: {result.stdout}")
        if result.stderr:
            print(f"Git {' '.join(args)} error: {result.stderr}")
        return result
    except Exception as e:
        print(f"Failed to run git: {e}")
        return None

# 1. List all files in index to find the culprit
print("Listing files in Git index:")
run_git(["ls-files", "--stage"])

# 2. Filesystem check
print("\nChecking filesystem for files with leading spaces:")
files = os.listdir(path)
for f in files:
    if f.startswith(" "):
        print(f"Found on disk: '{f}'")
        full_path = os.path.join(path, f)
        try:
            os.remove(full_path)
            print(f"Deleted from disk: {f}")
        except Exception as e:
            print(f"Error deleting {f}: {e}")

# 3. Aggressively unstage any file that doesn't look right
# Especially those with spaces
index_files = run_git(["ls-files"])
if index_files and index_files.stdout:
    for line in index_files.stdout.splitlines():
        if line.startswith(" ") or line.endswith(" ") or not line.strip():
            print(f"Found suspicious index entry: '{line}'")
            run_git(["rm", "--cached", line])
            
# 4. Try to reset the index if something is really broken
# run_git(["reset", "HEAD"])
