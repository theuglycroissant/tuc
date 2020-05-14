fetch("/tags.json")
	.then(res => res.json())
	.then(res => {
		const tags = Object.keys(res);
		let tagList = "<ul>"
		tags.forEach( tag => {
			tagList += `<li>${tag}</li>`
		});
		tagList += "</ul>";
		document.getElementById("tagList").innerHTML = tagList;
	})
	.catch(err => console.log(err));
