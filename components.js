//component related logic

class Component{
	constructor(header, inputs, outputs, inputCaptions, outputCaptions, solver,
		geomSolver){
		this.header = header;
		this.id = newGuid();
		this.inputs = inputs;
		this.outputs = outputs;
		this.inputCaptions = inputCaptions || inputs;
		this.outputCaptions = outputCaptions || outputs;
		
		this.incoming = {};
		for(var i = 0; i < this.inputs.length; i++){
			this.incoming[this.inputs[i]] = null;
		}
		
		this.outgoing = {};
		for(var i = 0; i < this.outputs.length; i++){
			this.outgoing[this.outputs[i]] = null;
		}
		
		compFieldLookup[this.id] = this;
		
		//graph evaluation related stuff
		this.solver = solver || ((params) => {});
		this.geomSolver = geomSolver || ((params) => {return null;});
		this.geomId = null;
	}
	
	isLeafNode(){
		for(var i = 0; i < this.outputs.length; i++){
			if(this.outgoing[this.outputs[i]] != null){
				return false;
			}
		}
		return true;
	}
	
	updateHtml(){
		if(domLookup[this.id] != undefined){
			domLookup[this.id] = undefined;
		}
		var newHtml = this.getHtml();
	}
	
	addConnection(conn, paramIndex, isIncoming){
		if(isIncoming){
			if(this.incoming[this.inputs[paramIndex]] != null){
				removeSvgPath(this.incoming[this.inputs[paramIndex]]);
			}
			this.incoming[this.inputs[paramIndex]] = conn.id;
		}else{
			if(this.outgoing[this.outputs[paramIndex]] != null){
				removeSvgPath(this.outgoing[this.outputs[paramIndex]]);
			}
			this.outgoing[this.outputs[paramIndex]] = conn.id;
		}
	}
	
	getAllConnectionIds(){
		var ids = []
		for(var key in this.incoming){
			if(this.incoming[key] != undefined){
				ids.push(this.incoming[key]);
			}
		}
		for(var key in this.outgoing){
			if(this.outgoing[key] != undefined){
				ids.push(this.outgoing[key]);
			}
		}
		return ids;
	}
	
	getHtml(){
		if(domLookup[this.id] != undefined){
			return domLookup[this.id];
		}
		
		var html = document.createElement("div");
		html.className = "comp";
		
		var head = document.createElement("div");
		head.className = "compHeader";
		head.appendChild(document.createTextNode(this.header));
		var compId = this.id;
		head.onclick = function(){componentSelect(compId);};
		html.appendChild(head);
		
		var inputBox = document.createElement("div");
		inputBox.className = "inputBox";
		for(var i = 0; i < this.inputs.length; i++){
			var inpNode = document.createElement("p");
			inpNode.className = "inputs";
			inpNode.appendChild(document.createTextNode(this.inputs[i]));
			inpNode.id = i.toString();
			var caption = this.inputCaptions[i]
			if(caption != null){inpNode.setAttribute("title", caption);}
			inputBox.appendChild(inpNode);
		}
		html.appendChild(inputBox);
		
		var outputBox = document.createElement("div");
		outputBox.className = "outputBox";
		for(var i = 0; i < this.outputs.length; i++){
			var outNode = document.createElement("p");
			outNode.className = "outputs";
			outNode.appendChild(document.createTextNode(this.outputs[i]));
			outNode.id = i.toString();
			var caption = this.outputCaptions[i]
			if(caption != null){outNode.setAttribute("title", caption);}
			outputBox.appendChild(outNode);
		}
		html.appendChild(outputBox);
		
		makeDraggable(html);
		html.id = this.id;
		domLookup[this.id] = html;
		return html;
	}
	
	getOutputValue(index){
		//deleting old geometry
		deleteGeometry(this.geomId);
		
		var inputVals = [];
		for(var i = 0; i < this.inputs.length; i++){
			var conn = connectionLookup[this.incoming[this.inputs[i]]];
			if(conn == null){
				return null;
			}
			var val = conn.getTransmitValue();
			if(val == null){
				//one of the inputs seems to be unset so we bail out
				return null;
			}
			inputVals.push(val);
		}
		
		var outputVal = this.solver(inputVals);
		
		//creating new geometry
		this.geomId = this.geomSolver(inputVals);
		
		return outputVal;
	}
	
	evaluate(){
		for(var i = 0; i < this.outputs.length; i++){
			this.getOutputValue(i);
		}
	}
}

class Field{
	constructor(name, isNumber){
		this.name = name;
		this.isNumber = isNumber;
		this.id = newGuid();
		
		compFieldLookup[this.id] = this;
		this.connections = [];
		
		this.state = "ok";
	}
	
	addConnection(conn, paramIndex, isIncoming){
		//the paramIndex and isIncoming parameters are redundant for a field,
		//but I kept them to keep the signature of the method consistent
		if(this.connections.indexOf(conn.id) > -1){
			return;
		}
		this.connections.push(conn.id);
	}
	
	isLeafNode(){
		return false;
	}
	
	getAllConnectionIds(){
		return this.connections;
	}
	
	getHtml(){
		if(domLookup[this.id] != undefined){
			return domLookup[this.id];
		}
		
		var html = document.createElement("div");
		html.className = "comp";
		
		var head = document.createElement("div");
		head.className = "compHeader";
		head.appendChild(document.createTextNode(this.name));
		html.appendChild(head);
		
		var inputBox = document.createElement("div");
		inputBox.className = "inputBox";
		
		var inpNode = document.createElement("p");
		inpNode.className = "fields";
		inpNode.setAttribute("contenteditable", "true");
		inpNode.id = "0";
		inpNode.appendChild(document.createTextNode(this.isNumber ? "0" : "value"));
		inpNode.addEventListener("input", evaluateGraph);
		debug1 = inpNode;
		
		inputBox.appendChild(inpNode);
		html.appendChild(inputBox);
		
		var outputBox = document.createElement("div");
		outputBox.className = "outputBox";
		
		var outNode = document.createElement("p");
		outNode.className = "outputs";
		outNode.id = "0";
		outNode.appendChild(document.createTextNode("out"));
		
		outputBox.appendChild(outNode);
		html.appendChild(outputBox);
		
		makeDraggable(html);
		domLookup[this.id] = html;
		html.id = this.id;
		return html;
	}
	
	updateHtml(){
		if(domLookup[this.id] != undefined){
			domLookup[this.id] = undefined;
		}
		var newHtml = this.getHtml();
	}
	
	getOutputValue(index){
		//index is redundant here but still kept to preserve the signature of the function
		var domElem = domLookup[this.id];
		var strVal = domElem.getElementsByClassName("fields")[0].innerText;
		if(this.isNumber){
			var numVal = parseInt(strVal);
			if(!isNaN(numVal)){
				this.state = "ok";
				return numVal;
			}
			else{
				if(strVal == ""){
					return 0;
				}
				alert("Invalid input detected");
				this.state = "error";
				return null;
			}
		}else{
			this.state = "ok";
			return strVal;
		}
	}
}

class Connection{
	constructor(incomingId, incomingIndex, outgoingId, outgoingIndex){
		this.id = newGuid();
		this.incomingId = incomingId;
		this.incomingIndex = incomingIndex;
		this.outgoingId = outgoingId;
		this.outgoingIndex = outgoingIndex;
		//console.log(incomingId, incomingIndex, outgoingId, outgoingIndex);
		
		//setting up the connection info in the components that are being
		//connected
		var inComp = compFieldLookup[this.incomingId];
		if(inComp != undefined){
			inComp.addConnection(this, this.incomingIndex, false);
		}
		var outComp = compFieldLookup[this.outgoingId];
		if(outComp != undefined){
			outComp.addConnection(this, this.outgoingIndex, true);
		}
		
		connectionLookup[this.id] = this;
	}
	
	getHtml(){
		if(domLookup[this.id] != undefined){
			return domLookup[this.id];
		}
		
		var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		
		//this is the geometry part
		var geomDef = this.getGeomDef();
		path.setAttribute("d", geomDef);
		path.setAttribute("stroke", "black");
		path.setAttribute("stroke-width", "2");
		path.setAttribute("fill", "none");
		
		domLookup[this.id] = path;
		path.id = this.id;
		return path;
	}
	
	getGeomDef(){
		var incoming = this.getIncomingParam();
		//debug = incoming
		var outgoing = this.getOutgoingParam();
		if(incoming == null || outgoing == null){return null;}
		
		var start = getPortAnchor(incoming);
		var end = getPortAnchor(outgoing);
		
		return getSCurveGeomDef(start, end);
	}
	
	updateHtml(){
		if(domLookup[this.id] == undefined){
			var newHtml = this.getHtml();
		}
		else{
			domLookup[this.id].setAttribute("d", this.getGeomDef());
		}
	}
	
	getIncomingParam(){
		var inComp = compFieldLookup[this.incomingId];
		if(inComp == undefined){return null;}
		return inComp.getHtml().getElementsByClassName("outputs")[this.incomingIndex];
	}
	
	getOutgoingParam(){
		var outComp = compFieldLookup[this.outgoingId];
		if(outComp == undefined){return null;}
		return outComp.getHtml().getElementsByClassName("inputs")[this.outgoingIndex];
	}
	
	getTransmitValue(){
		var inComp = compFieldLookup[this.incomingId];
		var value = inComp.getOutputValue(this.incomingIndex);
		return value;
	}
}