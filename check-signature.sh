#!/bin/sh

# get the command output
output=$(git verify-commit HEAD 2>&1)
if [[ -z "$output" || $output == *"error:"* ]]; then
    echo "\033[0;31mError: Commit is not signed or verification failed.\033[0m"
    exit 1
fi
