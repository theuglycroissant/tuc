#!/bin/sh
echo "Saving src changes, please provide a commit message:"
read commitMsg
git add .
git commit -m \""${commitMsg}"\"
git push origin master

echo "Building distribution folder"
npm run build

echo "Deploying dist folder to github repo"
cd dist
git init
git add .
releaseDate=$(date)
git commit -m "Release: $releaseDate"
git push -f origin master
cd ..

echo "Release finished"
