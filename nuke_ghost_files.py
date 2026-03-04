import os
import shutil

path = r"d:\Github\photo-style"
problems = []

print(f"--- Deep Scanning {path} ---")

for root, dirs, files in os.walk(path):
    if ".git" in root:
        continue
    
    for name in files + dirs:
        full_path = os.path.join(root, name)
        
        # Check for any character that isn't a standard visible character, number, or common punctuation
        is_bad = False
        if not name.strip(): # Entirely whitespace
            is_bad = True
        elif name.startswith(" ") or name.endswith(" "): # Leading/trailing space
            is_bad = True
        elif any(ord(c) < 32 or ord(c) > 126 for c in name): # Control characters or non-ASCII
            is_bad = True
            
        if is_bad:
            problems.append((full_path, name))
            print(f"IDENTIFIED MALFORMED FILE: {repr(name)} at {full_path}")

if not problems:
    print("No malformed filenames detected by deep scan.")
    print("If Git still fails, please check if your IDE (VS Code) has any 'Ghost' files in the Source Control view.")
else:
    print(f"\nFound {len(problems)} malformed entries. Attempting deletion...")
    for full_path, name in problems:
        try:
            if os.path.isfile(full_path):
                os.remove(full_path)
            elif os.path.isdir(full_path):
                shutil.rmtree(full_path)
            print(f"DELETED: {repr(name)}")
        except Exception as e:
            print(f"COULD NOT DELETE {repr(name)}: {e}")

print("\n--- FINAL GIT RESET ---")
print("Run these commands next:")
print("git init")
print("git add .")
print("git commit -m \"Clean initial commit\"")
