//bounds of the GUI
var XBounds = [0, 600];
var YBounds = [0, 600];

var comps = document.getElementsByClassName("comp");

for(var i = 0; i < comps.length; i++){
	makeDraggable(comps[i]);
}

function componentSelect(compId){
	unselectAll();
	var compNode = document.getElementById(compId);
	compNode.style.borderWidth = "3px";
	
	var comp = compFieldLookup[compId];
	if(!comp.geomId){return;}
	var geomNode = document.getElementById(comp.geomId);
	geomNode.setAttribute("stroke", "green");
	//geomNode.setAttribute("fill", "green");
}

function unselectAll(){
	for(var key in compFieldLookup){
		var compNode = document.getElementById(compFieldLookup[key].id);
		compNode.style.borderWidth = "1px";
		if(compFieldLookup[key].geomId){
			if(compFieldLookup[key].geomId != null){
				var geomNode = document.getElementById(compFieldLookup[key].geomId);
				geomNode.setAttribute("stroke", "black");
				//geomNode.setAttribute("fill", "none");
			}
		}
	}
}

// var debug = null;

function getElementBounds(elem){
	return [elem.offsetLeft, elem.offsetLeft + elem.offsetWidth, 
		elem.offsetTop, elem.offsetTop + elem.offsetHeight];
}

function boundsContained(bound, container){
	return bound[0] >= container[0] && bound[1] <= container[1] && 
		bound[2] >= container[2] && bound[3] <= container[3];
}

//makes a UI DOM element into a draggable element
function makeDraggable(elmnt) {
	makeConnectible(elmnt);
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	if (elmnt.getElementsByClassName("compHeader")[0]) {
		/* if present, the header is where you move the DIV from:*/
		elmnt.getElementsByClassName("compHeader")[0].onmousedown = dragMouseDown;
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
		var elemBounds = getElementBounds(elmnt);
		var xpos, ypos;
		//making sure the component is not out of bounds
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
			//leave it where it is
			xpos = elmnt.offsetLeft;
			ypos = elmnt.offsetTop;
			//return;
		}
		
		// making sure its within the bounds
		xpos = Math.min(Math.max(xpos, XBounds[0]), XBounds[1] - elmnt.offsetWidth);
		ypos = Math.min(Math.max(ypos, YBounds[0]), YBounds[1] - elmnt.offsetHeight);
		//setting the position to the DOM element
		elmnt.style.top = (ypos) + "px";
		elmnt.style.left =  (xpos) + "px";
		
		//now updating the connections if any to this element and redrawing the UI
		var comp = compFieldLookup[elmnt.id];
		if(comp != undefined){
			var connIds = comp.getAllConnectionIds();
			var conns = connIds.map((idStr) => connectionLookup[idStr]);
			//console.log(conns);
			for(var i = 0; i < conns.length; i++){
				conns[i].updateHtml();
			}
		}
	}

	function closeDragElement() {
		/* stop moving when mouse button is released:*/
		document.onmouseup = null;
		document.onmousemove = null;
	}
}

function makeConnectible(elem){
	var port1 = null, port2 = null;
	var inPorts = elem.getElementsByClassName("inputs");
	var outPorts = elem.getElementsByClassName("outputs");
	//debug = inPorts;
	var ports = Array.from(inPorts).concat(Array.from(outPorts));
	for(var i = 0; i < ports.length; i++){
		ports[i].onmousedown = startConnection;
	}
	
	function getCurveEndPoints(e){
		debug1 = e;
		var start, end;
		if(port1 == null && port2 == null){return;}
		if(port1 != null && port2 == null){
			start = getPortAnchor(port1);
			end = [e.clientX, e.clientY];
		}
		else if(port2 != null && port1 == null){
			start = [e.clientX, e.clientY];
			end = getPortAnchor(port2);
		}
		else{
			start = getPortAnchor(port1);
			end = getPortAnchor(port2);
		}
		return [start, end];
	}
	
	function startConnection(e){
		var beginPort = e.target || e.srcElement;
		if(beginPort.className == "inputs"){
			port2 = beginPort;
		}else{
			port1 = beginPort;
		}
		document.onmouseup = endConnection;
		document.onmousemove = updateTempPath;
		
		//console.log(port1, port2);
		pts = getCurveEndPoints(e);
		var start = pts[0];
		var end = pts[1];
		startTempSvgPath(start, end);
	}
	
	function endConnection(e){
		var endPort = e.target || e.srcElement;
		if(endPort.className == "inputs"){
			port2 = endPort;
			//deactivate ports
			//deactivateReceivingPorts(false);
		}else if(endPort.className == "outputs"){
			port1 = endPort;
			//deactivate ports
			//deactivateReceivingPorts(true);
		}
		if(port1 != null && port2 != null){
			var compId1 = getComponentForPort(port1);
			var compId2 = getComponentForPort(port2);
			var paramIndex1 = parseInt(port1.id);
			var paramIndex2 = parseInt(port2.id);
			
			//console.log(paramIndex1, paramIndex2);
			var connection = new Connection(compId1, paramIndex1, 
				compId2, paramIndex2);
			addSvgPath(connection.getHtml());
		}
		document.onmouseup = null;
		document.onmousemove = null;
		port1 = null;
		port2 = null;
		endTempSvgPath();
		
		// evaluating the graph now that it is changed
		evaluateGraph();
	}
	
	function updateTempPath(e){
		pts = getCurveEndPoints(e);
		var start = pts[0];
		var end = pts[1];
		updateTempSvgPath(start, end);
	}
	//incomplete
}