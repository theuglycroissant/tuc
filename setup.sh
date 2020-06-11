#/bin/sh
# Figure out install verb
if VERB="$( which pacman )" 2> /dev/null; then
	echo "Arch-based install"
	pacman -Syu npm imagemagick
elif VERB="$( which brew )" 2> /dev/null; then
	echo "Mac-based install"
	brew install node imagemagick
else
	echo "Must have pacman or brew installed"
	exit 1;
fi
npm install
