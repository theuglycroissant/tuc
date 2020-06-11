const fs = require("fs-extra");
const path = require("path");
const glob = require("glob-promise");
const util = require("util");
const sass = require("sass")
const YAML = require("yaml");
const ejs = require("ejs");
const replaceExt = require("replace-ext");
const gm = require("gm").subClass({imageMagick: true});
const uglifycss = require("uglifycss");
const minify = require("minify");
const scssRender = util.promisify(sass.render);

const sourceDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, "dist");
const templateDir = path.join(__dirname, "templates");

const buildConfig = require('./build.config.js');

let tags = {};
let directories = {};

function directoryEntry(object, link) {
	returnObject = {link: link};
	entries = buildConfig.directoryEntries[object.directory]
	if(typeof(entries) !== 'undefined') {
		entries.forEach(entry => {
			returnObject[entry] = object[entry]
		})
	}
	return returnObject;
}

function addTags(object, link) {
	if(!object.tags) { return }
	object.tags.forEach( tagName => {
		if( !tags[tagName] ) {
			tags[tagName] = [];
		}
		tags[tagName].push(link);
	})
}

function filenameToLink(filename){
	return '/'+path.relative(distDir, filename);
}

function processDirectories(directories) {
	Object.keys(directories).forEach( key => {
		if(buildConfig.directoryProcessors[key]) {
			directories[key] = buildConfig.directoryProcessors[key](directories[key]);
		}
	})
	return directories;
}

// Copy source to dist
let copyPromise = fs.remove(distDir)
	.then( () => fs.copy(sourceDir, distDir) );

// Process all the CSS
copyPromise
	.then( () => glob(distDir + '/**/*.scss') )
	.then( filelist => {
		let renderPromises = [];
		filelist.forEach(filename => {
			// If partial then just tell the next process to delete
			if(path.basename(filename).charAt(0) == '_') {
				renderPromises.push( Promise.resolve({partial: true, filename}) );
			} else {
				renderPromises.push(scssRender({ file: filename }));
			}
		});
		return Promise.all(renderPromises);
	})
	.then( results => {
		results.forEach( processed => {
			if(processed.partial) {
				// Remove partials
				fs.remove(processed.filename);
			} else {
				// Write processed scss to file and remove old files
				let inFilename = processed.stats.entry
				let outFilename = replaceExt(inFilename, '.css');
				let processedCSS = uglifycss.processString(processed.css.toString());
				fs.writeFile(outFilename, processedCSS);
				fs.remove(inFilename);
			}
		})
	})
	.catch(err => console.error(err));

// Minify JS
if( buildConfig.options.minifyJS ) {
	copyPromise
		.then( () => glob(distDir+'/**/*.js') )
		.then( filelist => {
			filelist.forEach(file => {
				minify(file).then(minified => {
					fs.writeFile(file, minified);
				});
			})
		});
}

// Convert photos
if( buildConfig.options.convertImgs ) {
	// Build up glob based on provided extensions
	myGlob = distDir + '/**/*.{'
	firstExt = true;
	buildConfig.options.convertImgs.extensions.forEach(ext => {
		if(!firstExt){
			myGlob += ",";
		}
		myGlob += ext;
		firstExt = false;
	})
	myGlob += "}";
	maxSize = buildConfig.options.convertImgs.maxSize;
	ignoreList = buildConfig.options.convertImgs.ignore
	copyPromise
		.then( () => glob(myGlob) )
		.then( filelist => {
			filelist.forEach(file => {
				// Check that we aren't supposed to be ignoring this file.
				relativeFile = '/'+path.relative(distDir, file);
				if(typeof(ignoreList) !== 'undefined' && ignoreList.includes(relativeFile)) {
					console.log(`Ignoring ${file}`);
					return
				}
				// We add > so that we only downscale, never upscale
				gm(file)
					.resize(maxSize, maxSize, '>')
					.write(file, (err) => {if (err) throw err} );
			})
		})
		.catch( console.error );
}

// Process all the YML with their templates
copyPromise
	.then( () => glob(distDir + '/**/*.{yml,yaml}') )
	.then( filelist => {
		let processedList = [];
		filelist.forEach( filename => {
			// Process YAML file into a javascript object
			let yamlContents = fs.readFileSync(filename, {encoding:'utf8'});
			let jsonContents = YAML.parse(yamlContents);
			let newFilename = replaceExt(filename, '.html');
			// Case insensitive tags
			if(buildConfig.options.caseInsensitiveTags) {
				if(typeof(jsonContents.tags) !== 'undefined') {
					jsonContents.tags = jsonContents.tags.map(tag => tag.toLowerCase() );
				}
			}
			// Add to processed list
			processedList.push({
				oldFilename: filename,
				newFilename: newFilename,
				contents: jsonContents
			});
			// Check if index, if not then we need to add to appropriate directory and add tags
			if( jsonContents.directory !== 'index') {
				let link = filenameToLink(newFilename);
				if(!directories[jsonContents.directory]) {
					directories[jsonContents.directory] = [];
				}
				directories[jsonContents.directory].push(directoryEntry(jsonContents, link));
				addTags(jsonContents, link);
			}
			// Delete YAML file from source
			fs.remove(filename);
		});
		// Now we need to allow directories to be processed
		directories = processDirectories(directories)
		// Now we add directory info to all indexes
		processedList.forEach( item => {
			if( item.contents.directory == 'index' ) {
				item.contents.directories = directories;
			}
		});
		// Now we process all objects into HTML
		processedList.forEach( item => {
			// Check that we have a template
			if( !item.contents.template ) { return }
			let templatePath = templateDir + '/' + item.contents.template + '.ejs';
			if( !fs.existsSync(templatePath) ) { return }
			// Render contents with template
			ejs.renderFile(templatePath, item.contents, (err, processedContents) => {
				if(err) {
					throw err
				} else {
					fs.writeFile( item.newFilename, processedContents );
				}
			});
		});
	})
	.then( () => {
		fs.ensureDirSync(distDir + '/data');
		fs.ensureDirSync(distDir + '/data/directories');
		fs.writeFileSync(distDir + '/data/tags.json', JSON.stringify(tags));
		fs.writeFileSync(distDir + '/data/taglist.json', JSON.stringify(Object.keys(tags)));
		let directoryNames = Object.keys(directories);
		directoryNames.forEach( name => {
			fs.writeFileSync(distDir + `/data/directories/${name}.json`, JSON.stringify(directories[name]));
		})
	})
	.catch(err => console.error(err));
