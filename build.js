const fs = require("fs-extra");
const path = require("path");
const glob = require("glob-promise");
const util = require("util");
const sass = require("sass")
const YAML = require("yaml");
const ejs = require("ejs");
const replaceExt = require("replace-ext");
const myRender = util.promisify(sass.render);

const sourceDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, "dist");
const templateDir = path.join(__dirname, "templates");

let tags = {};

function addTags(object, link) {
	if(!object.tags) { return }
	object.tags.forEach( tagName => {
		if( !tags[tagName] ) {
			tags[tagName] = [];
		}
		tags[tagName].push({
			title: object.title,
			filetype: object.filetype,
			link: link
		})
	})
}

function filenameToLink(filename){
	return path.relative(distDir, filename);
}

// Copy source to dist
let copyPromise = fs.remove(distDir)
	.then( () => fs.copy(sourceDir, distDir) );

// Process all the CSS
copyPromise
	.then( () => glob(path.join(__dirname, "dist" )+'/**/*.scss') )
	.then( filelist => {
		let renderPromises = [];
		filelist.forEach(filename => {
			renderPromises.push(myRender({ file: filename }));
		});
		return Promise.all(renderPromises);
	})
	.then( results => {
		results.forEach( processed => {
			let inFilename = processed.stats.entry
			let outFilename = replaceExt(inFilename, '.css');
			fs.writeFile(outFilename, processed.css);
			fs.remove(inFilename);
		})
	})
	.catch(err => console.log(err));

// Process all the YML with their templates
copyPromise
	.then( () => glob(path.join(__dirname, "dist")+ '/**/*.{yml,yaml}') )
	.then( filelist => {
		let directories = {};
		let processedList = [];
		filelist.forEach( filename => {
			// Process YAML file into a javascript object
			let yamlContents = fs.readFileSync(filename, {encoding:'utf8'});
			let jsonContents = YAML.parse(yamlContents);
			let newFilename = replaceExt(filename, '.html');
			processedList.push({
				oldFilename: filename,
				newFilename: newFilename,
				contents: jsonContents
			});
			// Check if recipe, then we have to add tags and to directory
			if( jsonContents.filetype !== 'index') {
				let link = filenameToLink(newFilename);
				if(!directories[jsonContents.filetype]) {
					directories[jsonContents.filetype] = [];
				}
				directories[jsonContents.filetype].push({
					title: jsonContents.title,
					link: link
				});
				addTags(jsonContents, link);
			}
		});
		processedList.forEach( item => {
			// Check that we have a template
			if( !item.contents.template ) { return }
			let templatePath = templateDir + '/' + item.contents.template + '.ejs';
			if( !fs.existsSync(templatePath) ) { return }
			// Add directories if filetype is index
			if( item.contents.filetype == 'index' ) {
				item.contents.directories = directories;
			}
			// Render contents with template
			ejs.renderFile(templatePath, item.contents, (err, processedContents) => {
				if(err) {
					throw err
				} else {
					fs.writeFile( item.newFilename, processedContents );
					fs.remove(item.oldFilename);
				}
			});
		});
	})
	.then( () => {
		fs.writeFileSync(path.join(__dirname, "dist") + '/tags.json', JSON.stringify(tags));
	})
	.catch(err => console.log(err));
