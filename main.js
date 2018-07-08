window.onload = main;

/**
	* Creates an instance of a component with the given name and adds it to the
	* gui canvas.
	*
	* @param {String} compName - The name of the component to be added.
	*/
function createComponentInstance(compName){
	var compData = ComponentDefinitions[compName];
	if(compData == undefined){
		alert("unrecognized component!");
		return;
	}
	var component = new Component(
		compData["name"],
		compData["inSymbols"],
		compData["outSymbols"],
		compData["inCaptions"],
		compData["outCaptions"],
		compData["solver"],
		compData["geomSolver"]
	);
	
	addComponent(component.getHtml());
}

/**
	* Creates an input field and adds it to the gui canvas
	*/
function createField(){
	var fld1 = new Field("number", true);
	addComponent(fld1.getHtml());
}

//main script
function main(){
	for(var key in ComponentDefinitions){
		var btn = document.createElement("button");
		btn.innerText = key;
		btn.onclick = function(e){createComponentInstance(e.target.innerText);};
		document.getElementById("formGui").appendChild(btn);
	}
}