const upArrow = "/assets/up.svg"
const downArrow = "/assets/down.svg"
let multichecks = Array.from(document.getElementsByClassName("multicheck"));

multichecks.forEach( multicheck => {
	let children = Array.from(multicheck.children);
	// First find the contents item toggle
	let contentsElem;
	let toggleElem;
	children.forEach( child => {
		if( child.classList.contains("multicheck_contents") ) {
			contentsElem = child;
		} else if( child.classList.contains("multicheck_toggle") ) {
			toggleElem = child;
		}
	});
	// Now attach a listener to the multicheck overlay
	children.forEach( child => {
		if( child.classList.contains("multicheck_overlay") ) {
			child.addEventListener("click", () => {
				toggleContents(multicheck);
				toggleArrow(toggleElem);
			});
		}
	});
})

function toggleContents(elem) {
	elem.classList.toggle("open");
}

function toggleArrow(elem) {
	Array.from(elem.children).forEach( child => {
		if(child.tagName == "IMG") {
			if( child.src.endsWith("up.svg") ) {
				child.src = downArrow;
			} else {
				child.src = upArrow;
			}
		}
	});
}

// Takes in the Id of a multicheck_contents and adds listeners to each rows
// The underlying checkbox is toggled and registerChange is called
// registerChange takes in arguments contentsElem and the value of the checkbox
function setupListeners(contentsId, registerChange) {
	var contentsElem = document.getElementById(contentsId);
	Array.from(contentsElem.children).forEach( child => {
		let rowValue = child.getAttribute('multicheck-value');
		let checkbox;
		Array.from(child.children).forEach( subchild => {
			if( subchild.tagName == "INPUT" ) {
				checkbox = subchild
			}
		});
		// If you click the box then change the check and call the callback
		child.addEventListener('click', (event) => {
			checkbox.checked = !checkbox.checked;
			registerChange(contentsId, rowValue);
		})
		// If you clicked the checkbox then change back HORRIBLE!!!	
		checkbox.addEventListener('click', (event) => {
			checkbox.checked = !checkbox.checked;
		});
	});
}

