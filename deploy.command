#!/bin/sh
cd -- "$(dirname "$BASH_SOURCE")"

STARTER='🤖 \033[1;36m ===> \033[1;35m'
ENDER='\033[0m\n'
MSG="Hello Nikki! I hope you're having a good day. Please follow my instructions to deploy your changes."
cowsay -f ./robot.cow $MSG | lolcat

# First we check to see if we need to pull
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

if [ $LOCAL = $REMOTE ]; then
	# Upstream and local agree
	printf "${STARTER}Tom hasn't changed anything on Github.${ENDER}"
elif [ $LOCAL = $BASE ]; then
	# Upstream is ahead 
	printf "${STARTER}Tom has changed something on Github, I'm just going to pull those changes.${ENDER}"
	git pull origin master
elif [ $REMOTE = $BASE ]; then
	# Local is ahead
	printf "${STARTER}You've already got committed local changes but they're not all on Github.${ENDER}"
else
	# Diverged
	printf "${STARTER}Your source is too different from Github, sorry I can't carry on.${ENDER}"
	exit 1
fi

printf "${STARTER}I'm just saving your source changes, what's your commit message?${ENDER}"
read commitMsg
git add .
git commit -m "${commitMsg}"
git push origin master

printf "${STARTER}Building your site now, sit tight.${ENDER}"
npm run build

printf "${STARTER}We're going live!${ENDER}"
releaseDate=$(date)
publishRepo=$(cat publish_repo)

cd dist
git init
git add .
git commit -m "Release: $releaseDate"
git remote add origin "$publishRepo"
git push -f origin master
cd ..

printf "${STARTER}All done bud, see you soon!${ENDER}"
