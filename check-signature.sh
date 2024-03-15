#!/bin/sh

output=$(git verify-commit HEAD)

if [ -z "$output" ]; then
    echo "Error: Commit is not signed."
    exit 1
fi
