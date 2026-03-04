import os

path = r"d:\Github\photo-style"
deleted_any = False

print(f"Scanning {path} for problematic filenames...")

for root, dirs, files in os.walk(path):
    if ".git" in root:
        continue
    
    for name in files + dirs:
        # Check for leading/trailing spaces or empty-ish names
        if name.startswith(" ") or name.endswith(" ") or not name.strip():
            full_path = os.path.join(root, name)
            print(f"FOUND PROBLEM: {repr(name)} at {full_path}")
            try:
                if os.path.isfile(full_path):
                    os.remove(full_path)
                elif os.path.isdir(full_path):
                    os.rmdir(full_path)
                print("DELETED successfully.")
                deleted_any = True
            except Exception as e:
                print(f"FAILED to delete: {e}")

if not deleted_any:
    print("No obviously malformed filenames found by scanning.")
else:
    print("Cleanup complete.")
