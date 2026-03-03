# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

import os
import shutil
import sys

def main():
    skill_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    scaffold_dir = os.path.join(skill_dir, "assets", "vault-scaffold")
    vault_root = os.getcwd()
    
    if not os.path.exists(scaffold_dir):
        print(f"Error: Scaffold directory not found at {scaffold_dir}")
        sys.exit(1)
        
    print(f"Initializing Obsidian Creator Vault at: {vault_root}")
    
    # Copy all files from scaffold to vault root
    shutil.copytree(scaffold_dir, vault_root, dirs_exist_ok=True)
    
    print("\n✅ Vault scaffolded successfully!\n")
    print("Next manual steps for the user:")
    print("1. Set Obsidian's 'Default location for new attachments' to the 'Assets' folder.")
    print("2. Set Obsidian's 'Template folder location' to the 'Templates' folder.")

if __name__ == "__main__":
    main()
