#!/bin/sh

# Check if the commit is signed
# Comment
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "Error: The last commit is not signed."
    echo "Please use 'git commit -S' or 'git commit --gpg-sign' to sign your commits."
    exit 1
fi

# If the commit is signed, exit without any error
exit 0
