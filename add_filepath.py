import os
import re

def should_process_file(filename):
    """Check if file should be processed based on extension."""
    extensions = {'.ts', '.html', '.css'}
    return any(filename.endswith(ext) for ext in extensions)

def has_path_comment(content, filepath):
    """Check if file already has path comment."""
    first_line = content.split('\n')[0] if content else ''
    return filepath in first_line or '// Path:' in first_line or '<!-- Path:' in first_line

def create_path_comment(filepath, file_ext):
    """Create appropriate path comment based on file type."""
    if file_ext == '.html':
        return f'<!-- Path: {filepath} -->\n'
    return f'// Path: {filepath}\n'

def process_file(filepath):
    """Process a single file to add path comment."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if has_path_comment(content, filepath):
            print(f"Path comment already exists in {filepath}")
            return
            
        file_ext = os.path.splitext(filepath)[1]
        path_comment = create_path_comment(filepath, file_ext)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(path_comment + content)
            
        print(f"Added path comment to {filepath}")
            
    except Exception as e:
        print(f"Error processing {filepath}: {str(e)}")

def main():
    """Main function to process all files in the project."""
    src_dir = 'src'
    
    for root, _, files in os.walk(src_dir):
        for file in files:
            if should_process_file(file):
                filepath = os.path.join(root, file)
                # Convert Windows paths to forward slashes
                filepath = filepath.replace('\\', '/')
                process_file(filepath)

if __name__ == "__main__":
    main()
