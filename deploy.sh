#!/bin/sh
MAGENTA='\033[1;35m'
NC='\033[0m'

printf "${MAGENTA}Saving src changes, please provide a commit message:${NC}\n"
read commitMsg
git add .
git commit -m "${commitMsg}"
git push origin master

echo "${MAGENTA}Building distribution folder${NC}\n"
npm run build

echo "${MAGENTA}Deploying dist folder to github repo${NC}\n"
releaseDate=$(date)
publishRepo=$(cat publish_repo)

cd dist
git init
git add .
git commit -m "Release: $releaseDate"
git remote add origin "$publishRepo"
git push -f origin master
cd ..

echo "${MAGENTA}Release finished${NC}\n"
