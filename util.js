//global lookup tables
var compFieldLookup = {};
var connectionLookup = {};
var domLookup = {};
//varirables for debugging purposes
var debug1 = null, debug2 = null;
//general utility functions
function newGuid() {  
   function s4() {  
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);  
   }  
   return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();  
}

function globalOffsetLeft(node){
	var x = 0;
	while(node){
		x += node.offsetLeft;
		node = node.offsetParent;
	}
	return x;
}

function globalOffsetTop(node){
	var y = 0;
	while(node){
		y += node.offsetTop;
		node = node.offsetParent;
	}
	return y;
}

function addSvgPath(pathNode){
	var container = document.getElementsByTagNameNS("http://www.w3.org/2000/svg", 'svg')[0];
	container.appendChild(pathNode);
}

function addComponent(compNode){
	var container = document.getElementById("guiSpace");
	container.appendChild(compNode);
}

function getPortAnchor(portNode){
	x = globalOffsetLeft(portNode);
	y = globalOffsetTop(portNode);
	debug = portNode;
	if(portNode.className == "outputs"){
		x = x + portNode.offsetWidth;
	}
	return [x, y + Math.floor(portNode.offsetHeight/2) + 1];
}

function getSCurveGeomDef(start, end){
	//ext is the control point which affects how soon / late the curve turns to the other component
	var ext = 75
	//console.log(start, end);
	p2 = [start[0]+ext, start[1]];
	p3 = [end[0]-ext, end[1]];
	//draw the connection as a straight line
	//return "M "+p1[0]+" "+p1[1]+" L "+p4[0]+" "+p4[1];
	//or draw it as a curve
	return "M "+start[0]+" "+start[1]+" C "+p2[0]+" "+p2[1]+", "+p3[0]+" "+
		p3[1]+", "+end[0]+" "+end[1];
}

function startTempSvgPath(start, end){
	var geomDef = getSCurveGeomDef(start, end);
	
	endTempSvgPath();
	var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("d", geomDef);
	path.setAttribute("stroke", "gray");
	path.setAttribute("stroke-width", "2");
	path.setAttribute("fill", "none");
	path.id = "tempPath";
	addSvgPath(path);
}

function updateTempSvgPath(start, end){
	var geomDef = getSCurveGeomDef(start, end);
	var tempPath = document.getElementById("tempPath");
	if(tempPath != null){
		tempPath.setAttribute("d", geomDef);
	}
}

function endTempSvgPath(){
	var svg = document.getElementsByTagNameNS("http://www.w3.org/2000/svg", 'svg')[0];
	var paths = document.getElementsByTagNameNS("http://www.w3.org/2000/svg", 'path');
	//console.log(paths.length);
	for(var i = 0; i < paths.length; i++){
		if(paths[i].id == "tempPath"){
			svg.removeChild(paths[i]);
		}
	}
}

function getComponentForPort(portNode){
	if(portNode.parentElement.className == "comp"){
		return portNode.parentElement.id;
	}
	return getComponentForPort(portNode.parentElement);
}