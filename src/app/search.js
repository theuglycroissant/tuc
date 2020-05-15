let tagData = {};
let tags = [];
let searchParams = {
	tags: []
}
let recipeCards = Array.from(document.getElementsByClassName('recipe_card'));

fetch("/tags.json")
	.then(res => res.json())
	.then(res => {
		tagData = res; 
		tags = Object.keys(tagData);
	})
	.then( () => displayTagData() )
	.catch(err => console.log(err));

function displayTagData() {
	// Make tag list
	let tagList = "<div>"
	tags.forEach( tag => {
		tagList += `<input type="checkbox" name="__${tag}" onclick="updateTag(this,'${tag}')">`;
		tagList += `<label for="__${tag}">${tag}</label>`;
	});
	tagList += "</div>";
	document.getElementById("tagList").innerHTML = tagList;
}

function updateTag(elem, tag) {
	if( elem.checked ) {
		if( searchParams.tags.indexOf(tag) == -1 ) {
			searchParams.tags.push(tag);
		}
	} else {
		let index = searchParams.tags.indexOf(tag);
		if ( index > -1 ) {
			searchParams.tags.splice(index, 1);
		}
	}
	filterSearchResults();
}

function filterSearchResults() {
	let linksToShow = [];
	if ( searchParams.tags.length == 0 ) {
		// No tag filter provided so show everything
		recipeCards.forEach( card => showCard(card) );
	} else {
		// Show all cards
		recipeCards.forEach( card => hideCard(card) );
		// Create a big list of ids for recipes which have the right tag
		searchParams.tags.forEach( tag => {
			linksToShow = linksToShow.concat(tagData[tag]);
		})
		// Show those elements
		linksToShow.forEach( link => {
			showCard(document.getElementById(link));
		})
	}
}

function showCard(elem) {
	elem.classList.remove('hidden');
}

function hideCard(elem) {
	elem.classList.add('hidden');
}
