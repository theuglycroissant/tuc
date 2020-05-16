let recipeData = {};
let tagData = {};
let tags = [];
let searchParams = {
	tags: []
}
let searchKeys = ["title", "description"];
let recipeCards = Array.from(document.getElementsByClassName('recipe_card'));

fetch("/data/tags.json")
	.then(res => res.json())
	.then(res => {
		tagData = res; 
		tags = Object.keys(tagData);
	})
	.then( () => {
		parseURLQueries() 
		displayTagData();
		setupListeners("tagList", tagChange);
		updateTagsTitle();
		filterSearchResults();
	})
	.catch(err => console.log(err));

fetch("/data/directories/recipe.json")
	.then(res => res.json())
	.then(res => { recipeData = res; })
	.then( setupSearchBox )
	.catch(err => console.log(err));

function parseURLQueries() {
	const urlParams = new URLSearchParams(window.location.search);
	searchParams.tags = urlParams.getAll('tag')
}

function displayTagData() {
	// Make tag list
	tagList = "";
	tags.forEach( tag => {
		tagChecked = searchParams.tags.includes(tag) ? "checked" : "";
		tagList += `<div class="multicheck_row" multicheck-value="${tag}">`;
		tagList += `<input type="checkbox" name="multicheck_tags_${tag}" ${tagChecked}>`;
		tagList += `<label for="multicheck_tags_${tag}">${tag}</label>`;
		tagList += "</div>";
	});
	document.getElementById("tagList").innerHTML = tagList;
}


function tagChange(contentsId, tag) {
	let index = searchParams.tags.indexOf(tag)
	if( index == -1 ) {
		searchParams.tags.push(tag);
	} else {
		searchParams.tags.splice(index, 1)
	}
	updateTagsTitle();
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

function updateTagsTitle() {
	let tagTitleElem = document.getElementById("multicheck_title_tags");
	let numTags = searchParams.tags.length;
	let newTitle;
	if( numTags == 0 ) {
		newTitle = "Tags";
	} else if ( numTags == 1 ) {
		newTitle = searchParams.tags[0];
	} else if ( numTags == 2 ) {
		newTitle = `${searchParams.tags[0]}, ${searchParams.tags[1]}`;
	} else {
		newTitle = `${numTags} selected`;
	}
	tagTitleElem.innerHTML = newTitle;
}

function showCard(elem) {
	elem.classList.remove('hidden');
}

function hideCard(elem) {
	elem.classList.add('hidden');
}

function setupSearchBox() {
	const fuse = new Fuse(recipeData, {
		keys: searchKeys,
		threshold: 1.0
	})
	document.getElementById("search_box").addEventListener("input", event => {
		let searchTerm = event.target.value;
		let searchResults = fuse.search(searchTerm);
		let order = 0;
		searchResults.forEach(result => {
			card = document.getElementById(result.item.link)
			card.style.order = order;
			order += 1;
		});
	});
}
