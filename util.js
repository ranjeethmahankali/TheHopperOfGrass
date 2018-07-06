var debug = null;
//general utility functions
function newGuid() {  
   function s4() {  
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);  
   }  
   return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();  
}

function globalOffsetLeft(node){
	if(node.parentElement.tagName.toLowerCase() == "body"){
		return node.offsetLeft;
	}
	return node.offsetLeft + globalOffsetLeft(node.parentElement);
}

function globalOffsetTop(node){
	if(node.parentElement.tagName.toLowerCase() == "body"){
		return node.offsetTop;
	}
	return node.offsetTop + globalOffsetTop(node.parentElement);
}

function addSvgPath(pathNode){
	var html = document.getElementsByTagNameNS("http://www.w3.org/2000/svg", 'svg')[0];
	html.appendChild(pathNode);
}