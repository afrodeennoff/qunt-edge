#!/bin/bash

# Fetch latest changes and prune deleted branches
git fetch --prune

# Get current branch name
current_branch=$(git rev-parse --abbrev-ref HEAD)

# --- Local Branches ---
echo "--- Local Branches ---"

# Get clean list of local branches
# Use grep -vE to exclude patterns strictly
local_branches=$(git branch --format='%(refname:short)' | grep -v -E "^main$" | grep -v -E "^$current_branch$")

if [ -z "$local_branches" ]; then
  echo "No local branches to delete (excluding main and current branch '$current_branch')."
else
  echo "The following local branches will be deleted:"
  echo "$local_branches"
fi

echo ""

# --- Remote Branches ---
echo "--- Remote Branches ---"

# Get clean list of remote branches
# Use grep -vE for strict matching
# Exclude origin (often HEAD alias), origin/main, origin/HEAD, and origin/current_branch
remote_branches=$(git branch -r --format='%(refname:short)' | grep -v -E "^origin$" | grep -v -E "^origin/main$" | grep -v -E "^origin/HEAD$" | grep -v -E "^origin/$current_branch$")

if [ -z "$remote_branches" ]; then
  echo "No remote branches to delete (excluding origin/main and origin/$current_branch)."
else
  echo "The following remote branches will be deleted:"
  echo "$remote_branches"
fi

echo ""

# Check for dry run
if [[ "$1" == "--dry-run" ]]; then
  echo "Dry run complete."
  exit 0
fi

# Confirmation for Local
if [ -n "$local_branches" ]; then
  read -p "Are you sure you want to delete these local branches? (y/N) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    for branch in $local_branches; do
      echo "Deleting local branch $branch..."
      git branch -D "$branch" || echo "Failed to delete local branch $branch"
    done
  else
    echo "Skipping local branch deletion."
  fi
fi

echo ""

# Confirmation for Remote
if [ -n "$remote_branches" ]; then
  read -p "Are you sure you want to delete these remote branches? (y/N) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    for branch in $remote_branches; do
      # Remove 'origin/' prefix for push command
      branch_name=${branch#origin/}
      echo "Deleting remote branch $branch_name..."
      git push origin --delete "$branch_name" || echo "Failed to delete remote branch $branch_name"
    done
  else
    echo "Skipping remote branch deletion."
  fi
fi

echo "Cleanup complete."
