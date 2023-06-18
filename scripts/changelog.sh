#!/bin/bash

# Get the latest tag
latest_tag=$(git describe --tags --abbrev=0)
# Get the date of the latest tag
latest_tag_date=$(git log -1 --format=%ai $latest_tag)

# Get the second to last tag
last_tag=$(git describe --tags --abbrev=0 HEAD^1)
# Get the date of the second to last tag
last_tag_date=$(git log -1 --format=%ai $last_tag)


# Get the comments for the latest and last tags
last_tag_comment=$(git tag -n1 $last_tag)
latest_tag_comment=$(git tag -n1 $latest_tag)

# Check if there are any changes since the last tag
if [ "$(git log $latest_tag..HEAD --oneline)" = "" ]; then
  # If there are no changes, report changes up to this tag from the previous tag
  echo "Current Release: $latest_tag_comment" > changelog.txt
  echo "Version Date: $latest_tag_date" >> changelog.txt
  echo "Changes in $latest_tag:" >> changelog.txt
  git log --pretty=format:"%h %s (%ad)" --date=short $last_tag..$latest_tag >> changelog.txt
else
  # If there are changes, report changes since the last tag
  echo "Unversioned changes since $latest_tag_comment:" > changelog.txt
  echo "Previous Version Date: $latest_tag_date" >> changelog.txt
  git log $latest_tag..HEAD --pretty=format:"%h %s (%ad)" >> changelog.txt
fi

echo "\n" >> changelog.txt
echo "Version History:" >> changelog.txt
git for-each-ref --sort=-committerdate refs/tags --format '%(refname) %(subject) %(committerdate)' | sed -e 's-refs/tags/--' >> changelog.txt

