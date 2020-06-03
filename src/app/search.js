let fuse;
let recipeData = [];
let tagData = {};
let tags = [];
let searchParams = {
	tags: [],
	term: ""
}
let searchKeys = ["title", "description"];
let recipeCards = Array.from(document.getElementsByClassName('recipe_card'));

fetch("/data/taglist.json")
	.then(res => res.json())
	.then(res => {
		tags = res;
	})
	.then( () => {
		parseURLQueries() 
		displayTagData();
		setupListeners("tagList", tagChange);
		updateTagsTitle();
	})
	.catch(err => console.log(err));

fetch("/data/directories/recipe.json")
	.then(res => res.json())
	.then(res => { recipeData = res; })
	.then(() => {
		console.log(recipeData);
		setupSearchBox();
		searchFilter();
	})
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
	searchFilter();
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

function setupSearchBox() {
	fuse = new Fuse(recipeData, {
		keys: searchKeys,
		distance: 500
	})
	document.getElementById("search_box").addEventListener("input", event => {
		searchParams.term = event.target.value
		searchFilter();
	});
}

function searchFilter() {
	// Hide all Ids by default
	let hideIds = recipeData.map( recipe => recipe.link );
	let showIds = [];
	// Get search results (if we have a search term)
	if( searchParams.term.length > 0 ) {
		searchResults = fuse.search(searchParams.term).map( result => result.item );
	} else {
		searchResults = recipeData;
	}
	// Loop through search results and filter by tags
	let order = 0;
	console.log(searchResults);
	searchResults.forEach( result => {
		// Figure out whether we should show this results
		// Assume not to start
		let showResult = false;
		if( searchParams.tags.length == 0 ) {
			// No tags so we should show all results
			showResult = true;
		} else {
			// Check each tag in the search filter
			searchParams.tags.forEach( tag => {
				if(!showResult) {
					if(result.tags.indexOf(tag) !== -1) {
						// This search result has one of the desired tags so we show
						showResult = true;
					}
				}
			})
		}

		if( showResult ) {
			index = hideIds.indexOf(result.link);
			hideIds.splice(index, 1);
			showIds.push({ link: result.link, order: order});
			order += 1;
		}

	});
	hideIds.forEach(id => {
		hideCard(document.getElementById(id));
	})
	showIds.forEach(id => {
		card = document.getElementById(id.link);
		card.style.order = id.order;
		showCard(card);
	})
}

function showCard(elem) {
	elem.classList.remove('hidden');
}

function hideCard(elem) {
	elem.classList.add('hidden');
}
