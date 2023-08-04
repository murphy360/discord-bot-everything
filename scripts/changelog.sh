#!/bin/bash

change_log_json="changelog.json"
last_tag="e4a858c"
echo $last_tag
json='['

# Iterate through all tags
for tag in $(git tag --sort=taggerdate) 
# Write an entry for each tag to the changelog json object

do
  #echo $tag
  #echo $tag_comment
  # Get the date of the tag
  tag_date=$(git log -1 --format=%ai $tag)
  # Get the comments for the tag
  tag_comment=$(git tag -n1 --format='%(subject)' $tag)

  # Get the changes for the tag
  #echo 'Changes between '$last_tag' and '$tag':'
  tag_changes=$(git log --pretty=format:"%h %s (%ad)" --date=short $last_tag..$tag)

  
  readarray -t changes_array <<< "$tag_changes"
  change_elements='['

  # Print each element of the array
  for change in "${changes_array[@]}"; do
    read -ra change_array <<< "$change"
    hash=${change_array[0]} # first element of the array
    date=${change_array[-1]} # last element of the array
    date=${date//\(/} # remove the opening parenthesis
    date=${date//\)/} # remove the closing parenthesis
    message=${change_array[@]:1:${#change_array[@]}-2} # remove the hash and the date
    message=${message//\"/} # remove the quotes from the message
    # Add the change to the change_elements string
    change_elements+='{"hash": "'$hash'", "message": "'$message'", "date": "'$date'"}'
    # Add a comma if the change is not the last element of the array
    if [ "$change" != "${changes_array[-1]}" ]; then
      change_elements+=','
    fi
  done
  change_elements+=']' # close the array
  last_tag=$tag # set the last tag to the current tag for the next iteration

  # Add the tag to the json string
  if [ "$json" != "[" ]; then
    json+=','
  fi
  json+='{"version": "'$tag'", "tag_date": "'$tag_date'", "version_name": "'$tag_comment'", "changes": '$change_elements'}'

done

# Is last tag on latest commit
if [ "$(git rev-parse "$last_tag")" != "$(git rev-parse HEAD)" ]; then
  # Get the changes for the last tag
  echo 'Changes between '$last_tag' and HEAD:'
  tag_changes=$(git log --pretty=format:"%h %s (%ad)" --date=short $last_tag..HEAD)

  readarray -t changes_array <<< "$tag_changes"
  unversioned_date=""
  change_elements='['

  # Print each element of the array
  for change in "${changes_array[@]}"; do
    read -ra change_array <<< "$change"
    hash=${change_array[0]} # first element of the array
    if [ "$hash" == "" ]; then
      continue
    fi
    date=${change_array[-1]} # last element of the array
    date=${date//\(/} # remove the opening parenthesis
    date=${date//\)/} # remove the closing parenthesis
    message=${change_array[@]:1:${#change_array[@]}-2} # remove the hash and the date
    message=${message//\"/} # remove the quotes from the message
    # Add the change to the change_elements string
    change_elements+='{"hash": "'$hash'", "message": "'$message'", "date": "'$date'"}'
    # Add a comma if the change is not the last element of the array
    if [ "$change" != "${changes_array[-1]}" ]; then
      change_elements+=','
    fi
  done
  change_elements+=']' # close the array

  # Check the size of change_array
  # If it is greater than 1, then there are changes since the last tag
  if [ "${#changes_array[@]}" -gt 1 ]; then
    # Add the tag to the json string
    if [ "$json" != "[" ]; then
      json+=','
    fi
    json+='{"version": "Unversioned", "tag_date": "'$unversioned_date'", "version_name": "Unversioned", "changes": '$change_elements'}'
  fi




else 
  echo "No changes since last tag"
  echo $(git rev-parse HEAD)
  echo $(git rev-parse "$last_tag")

fi

json+=']' # Add the closing bracket to create a valid JSON array
#echo $json

# Use `jq` to format the JSON string
formatted_json=$(echo $json | jq '.')

# Use `echo` to print the formatted JSON string
echo "$formatted_json"

echo "Writing to $change_log_json"

# write the formatted JSON string to the changelog file
echo "$formatted_json" > $change_log_json