let img_holder, img_nav, total_width, viewport_width, items;
let currentItem = 0;
const viewTime = 10000;
const animateTime = 700;
const resolution = 20;
const totalSteps = animateTime/resolution;
let scrollSteps = [];
let keepScrolling = true;
let stopAnimation = false;

function scrollNext() {
	if(keepScrolling) {
		myScroll( (currentItem + 1) % items );
		setTimeout(scrollNext, viewTime);
	}
}

function myScroll(target) {
	// Figure out where we need to go
	targetScroll = target * viewport_width;
	currentScroll = img_holder.scrollLeft;
	difference = targetScroll - currentScroll;
	vector = difference/totalSteps
	// Clear animation buffer
	scrollSteps = [];
	// Compute animation buffer via sine easeInOut
	for(i=1; i< totalSteps; i++) {
		easeIn = -(Math.cos( Math.PI * (i/totalSteps) ) - 1)/2;
		easeIn = easeIn * difference + currentScroll;
		scrollSteps.push(Math.round(easeIn));
	}
	scrollSteps.push(targetScroll);
	// Change the navigation
	changeNavigation(target);
	// Start the animation
	setTimeout(animateNextStep, resolution);
}

function animateNextStep() {
	if(!stopAnimation) {
		img_holder.scrollLeft = scrollSteps.shift();
		if(scrollSteps.length > 0) {
			setTimeout(animateNextStep, resolution);
		}
	}
}

function changeNavigation(target) {
	// Update log of current item
	currentItem = target;
	if ( items > 0 ) {
		// Remove active from all navballs
		Array.from(document.getElementsByClassName("navball")).forEach( elem => {
			elem.classList.remove("active");
		});
		// Turn target active
		document.getElementById(`img_nav_${target}`).classList.add("active");
	}
}

function setupNavigation() {
	navHTML = ""
	for(var i = 0; i < items; i++) {
		active = i == 0 ? " active" : ""
		navball = `<div class="navball${active}" id="img_nav_${i}" onclick="handleClick(${i})"></div>`;
		navHTML += navball;
	}
	img_nav.innerHTML = navHTML;
}

function handleClick(target) {
	// Have received a click so stop scolling from happening
	keepScrolling = false;
	myScroll(target);
}

function computeWidths() {
	total_width = img_holder.scrollWidth;
	viewport_width = img_holder.offsetWidth;
}

window.onload = () => {
	img_holder = document.getElementById("recipe_page_image");
	img_nav = document.getElementById("recipe_page_image_nav");
	computeWidths();
	items = Math.round(total_width / viewport_width);
	if(items > 1) {
		setTimeout(scrollNext, viewTime);
		setupNavigation();
	}

	window.onresize = () => {
		stopAnimation = true;
		// Recompute relavent widths
		computeWidths();
		// Make sure our image is in the right place
		myScroll(currentItem);
		stopAnimation = false;
	}
}
