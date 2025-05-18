#!/bin/bash

# License header text
LICENSE_HEADER="/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the \"Mowment\" project (™). Licensed under the MIT License.
 */

"

# Find all files with specified extensions, excluding node_modules, .git, ios/Pods
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.swift" -o -name "*.m" -o -name "*.h" -o -name "*.md" -o -name "*.mdx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./ios/Pods/*" \
  -not -path "./ios/build/*" | while read file; do
  
  # Check if file exists and is readable
  if [ -r "$file" ]; then
    echo "Processing $file"
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Write license header to temporary file
    echo "$LICENSE_HEADER" > "$temp_file"
    
    # Append original file content
    cat "$file" >> "$temp_file"
    
    # Copy temporary file back to original
    mv "$temp_file" "$file"
    
    echo "Added license header to $file"
  else
    echo "Skipping $file (not readable)"
  fi
done

echo "License headers added to all source files." 