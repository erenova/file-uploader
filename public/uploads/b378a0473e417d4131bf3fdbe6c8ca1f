#!/bin/bash

# Check if a parameter is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <starting_number>"
    exit 1
fi

# Use the provided parameter as the starting number
start_number=$1

# Function to ensure unique filenames
get_unique_name() {
    local name="$1"
    local counter=1
    while [ -e "$name" ]; do
        name="${1%.*}_$counter.${1##*.}"
        ((counter++))
    done
    echo "$name"
}

# Check for files matching "2024-*"
files_2024=$(find . -maxdepth 1 -type f -name "2025-*" -printf "%T@ %p\n" | sort -n)

if [ -n "$files_2024" ]; then
    # Rename files matching "2025-*"
    echo "$files_2024" | while IFS= read -r line; do
        # Extract the filename from the line
        file=$(echo "$line" | cut -d' ' -f2-)
        
        # Extract the file extension
        extension="${file##*.}"
        
        # Format the new filename
        new_name="lesson${start_number}.${extension}"
        
        # Ensure the new name is unique
        new_name=$(get_unique_name "$new_name")
        
        # Rename the file
        mv "$file" "$new_name"
        
        # Increment the lesson number
        start_number=$((start_number + 1))
    done
else
    # Check for files matching "lesson*.*"
    files_lesson=$(find . -maxdepth 1 -type f -name "lesson*.*" -printf "%T@ %p\n" | sort -n)

    if [ -n "$files_lesson" ]; then
        echo "$files_lesson" | while IFS= read -r line; do
            # Extract the filename from the line
            file=$(echo "$line" | cut -d' ' -f2-)
            
            # Extract the file extension
            extension="${file##*.}"
            
            # Format the new filename
            new_name="lesson${start_number}.${extension}"
            
            # Ensure the new name is unique
            new_name=$(get_unique_name "$new_name")
            
            # Rename the file
            mv "$file" "$new_name"
            
            # Increment the lesson number
            start_number=$((start_number + 1))
        done
    else
        echo "No matching files found for renaming."
        exit 1
    fi
fi
