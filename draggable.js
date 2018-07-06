//bounds of the GUI
var XBounds = [0, 600];
var YBounds = [0, 600];

var comps = document.getElementsByClassName("comp");

for(var i = 0; i < comps.length; i++){
	dragElement(comps[i]);
}

// var debug = null;

function getElementBounds(elem){
	return [elem.offsetLeft, elem.offsetLeft + elem.offsetWidth, elem.offsetTop, elem.offsetTop + elem.offsetHeight];
}

function boundsContained(bound, container){
	return bound[0] >= container[0] && bound[1] <= container[1] && bound[2] >= container[2] && bound[3] <= container[3];
}

function dragElement(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	if (elmnt.getElementsByClassName("compHeader")[0]) {
		/* if present, the header is where you move the DIV from:*/
		elmnt.getElementsByClassName("compHeader")[0].onmousedown = dragMouseDown;
	} else {
		/* otherwise, move the DIV from anywhere inside the DIV:*/
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		//bailing out if the component is at the edge
		var elemBounds = getElementBounds(elmnt);
		var xpos, ypos;

		if(boundsContained(elemBounds, XBounds.concat(YBounds))){
			// calculate the new cursor position:
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			// get the element's new position:
			xpos = elmnt.offsetLeft - pos1;
			ypos = elmnt.offsetTop - pos2;
		}else{
			xpos = elmnt.offsetLeft;
			ypos = elmnt.offsetTop;
			return;
		}
		
		// making sure its within the bounds
		xpos = Math.min(Math.max(xpos, XBounds[0]), XBounds[1] - elmnt.offsetWidth);
		ypos = Math.min(Math.max(ypos, YBounds[0]), YBounds[1] - elmnt.offsetHeight);
		//setting the position to the DOM element
		elmnt.style.top = (ypos) + "px";
		elmnt.style.left =  (xpos) + "px";
	}

	function closeDragElement() {
		/* stop moving when mouse button is released:*/
		document.onmouseup = null;
		document.onmousemove = null;
	}
}