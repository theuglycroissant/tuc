#!/bin/sh
cd -- "$(dirname "$BASH_SOURCE")"

STARTER='🤖 \033[1;36m===> \033[1;35m'
NC='\033[0m'
MSG="Hello Nikki! I hope you're having a good day. Please follow my instructions to deploy your changes"

cowsay -f ./robot.cow $MSG | lolcat

printf "${STARTER}I'm just saving your source changes, what's your commit message?${NC}\n"
read commitMsg
git add .
git commit -m "${commitMsg}"
git push origin master

printf "${STARTER}Building your site now, sit tight${NC}\n"
npm run build

printf "${STARTER}We're going live!!!${NC}\n"
releaseDate=$(date)
publishRepo=$(cat publish_repo)

cd dist
git init
git add .
git commit -m "Release: $releaseDate"
git remote add origin "$publishRepo"
git push -f origin master
cd ..

printf "${STARTER}All done bud, see you soon!${NC}\n"
