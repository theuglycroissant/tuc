let img_holder, img_wrapper, total_width, viewport_width, items;
let currentItem = 0;
const viewTime = 10000;
const animateTime = 700;
const resolution = 20;
const totalSteps = animateTime/resolution;
let scrollSteps = [];
let keepScrolling = true;

function scrollNext() {
	if(keepScrolling) {
		currentItem = (currentItem + 1) % items;
		scrollTo(currentItem);
		setTimeout(scrollNext, viewTime);
	}
}

function scrollTo(target) {
	targetScroll = target * viewport_width;
	currentScroll = img_holder.scrollLeft;
	difference = targetScroll - currentScroll;
	vector = difference/totalSteps
	scrollSteps = [];
	for(i=1; i< totalSteps; i++) {
		easeIn = -(Math.cos( Math.PI * (i/totalSteps) ) - 1)/2;
		easeIn = easeIn * difference + currentScroll;
		scrollSteps.push(Math.round(easeIn));
	}
	scrollSteps.push(targetScroll);
	setTimeout(animateNextStep, resolution);
}

function animateNextStep() {
	img_holder.scrollLeft = scrollSteps.shift();
	if(scrollSteps.length > 0) {
		setTimeout(animateNextStep, resolution);
	}
}

function setupNavigation() {
}

window.onload = () => {
	img_holder = document.getElementById("recipe_page_image");
	img_wrapper = document.getElementById("recipe_page_image_wrapper");
	total_width = img_holder.scrollWidth;
	viewport_width = img_holder.offsetWidth;
	items = Math.round(total_width / viewport_width);
	if(items > 1) {
		setTimeout(scrollNext, viewTime);
	}
	setupNavigation();
}
