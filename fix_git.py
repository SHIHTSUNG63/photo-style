import os

path = r"d:\Github\photo-style"
files = os.listdir(path)
for f in files:
    if f.startswith(" ") and ".gitignore" in f:
        full_path = os.path.join(path, f)
        print(f"Attempting to delete: '{full_path}'")
        try:
            os.remove(full_path)
            print("Successfully deleted.")
        except Exception as e:
            print(f"Error: {e}")
