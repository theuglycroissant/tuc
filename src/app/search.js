let tagData = {};
let tags = [];

fetch("/tags.json")
	.then(res => res.json())
	.then(res => {
		tagData = res; 
		tags = Object.keys(tagData);
	})
	.then( () => displayTagData() )
	.catch(err => console.log(err));

function displayTagData() {
	let tagList = "<ul>"
	tags.forEach( tag => {
		tagList += `<li>${tag}</li>`
	});
	tagList += "</ul>";
	document.getElementById("tagList").innerHTML = tagList;
	console.log(tagData);
}
