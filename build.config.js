module.exports.options = {
	caseInsensitiveTags: true,
	minifyJS: true,
	// TODO : Add ignore GLOBs
	convertImgs: {
		ignore: ['/assets/the_ugly_croissant_long.png'],
		extensions: ['jpg' ,'jpeg', 'JPG', 'JPEG', 'png', 'PNG'],
		maxSize: 500
	}
}

module.exports.directoryEntries = {
	recipe: ['title', 'card_photo', 'description', 'featured', 'tags', 'date']
}

module.exports.directoryProcessors = {
	recipe: (directory) => {
		// We should sort by date by default
		// Date should be given as DD/MM/YYYY
		// Earliest entry should go first, no date provided => 1 Jan 1970
		directory.forEach(recipe => {
			if(typeof(recipe.date) === 'undefined') {
				recipe.dateObject = new Date(0);
			} else {
				let dateParts = recipe.date.split("/");
				// JS months indexed from 0
				recipe.dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
			}
		})
		directory = directory.sort( (a, b) => a.dateObject < b.dateObject ? 1 : -1 )
		return directory;
	}
}
