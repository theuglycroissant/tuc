#!/bin/sh
cd -- "$(dirname "$BASH_SOURCE")"

STARTER='\033[1;36m===> \033[1;35m'
NC='\033[0m'

printf "${STARTER}Saving src changes, please provide a commit message:${NC}\n"
read commitMsg
git add .
git commit -m "${commitMsg}"
git push origin master

echo "${STARTER}Building distribution folder${NC}\n"
npm run build

echo "${STARTER}Deploying dist folder to github repo${NC}\n"
releaseDate=$(date)
publishRepo=$(cat publish_repo)

cd dist
git init
git add .
git commit -m "Release: $releaseDate"
git remote add origin "$publishRepo"
git push -f origin master
cd ..

echo "${STARTER}Release finished${NC}\n"
