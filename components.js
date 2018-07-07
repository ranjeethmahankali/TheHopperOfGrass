//component related logic

class Component{
	constructor(header, inputs, outputs, inputCaptions, outputCaptions, solver){
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
		
		this.solver = solver || (() => {});
		
		compFieldLookup[this.id] = this;
	}
	
	updateHtml(){
		if(domLookup[this.id] != undefined){
			domLookup[this.id] = undefined;
		}
		var newHtml = this.getHtml();
	}
	
	addConnection(conn, paramIndex, isIncoming){
		if(isIncoming){
			this.incoming[this.inputs[paramIndex]] = conn.id;
		}else{
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
		html.appendChild(head);
		
		var inputBox = document.createElement("div");
		inputBox.className = "inputBox";
		for(var i = 0; i < this.inputs.length; i++){
			var inpNode = document.createElement("p");
			inpNode.className = "inputs";
			inpNode.appendChild(document.createTextNode(this.inputs[i]));
			inpNode.id = i.toString();
			//inpNode.setAttribute("contenteditable", "true");
			var caption = this.inputCaptions[this.inputs[i]]
			if(caption != null){inpNode.title = caption;}
			inputBox.appendChild(inpNode);
		}
		html.appendChild(inputBox);
		
		var outputBox = document.createElement("div");
		outputBox.className = "outputBox";
		for(var i = 0; i < this.outputs.length; i++){
			var outNode = document.createElement("p");
			outNode.className = "outputs";
			outNode.appendChild(document.createTextNode(this.outputs[i]));
			var caption = this.outputCaptions[this.outputs[i]]
			if(caption != null){inpNode.title = caption;}
			outputBox.appendChild(outNode);
		}
		html.appendChild(outputBox);
		
		makeDraggable(html);
		html.id = this.id;
		domLookup[this.id] = html;
		return html;
	}
}

class Field{
	constructor(name, isNumber){
		this.name = name;
		this.isNumber = isNumber;
		this.id = newGuid();
		
		compFieldLookup[this.id] = this;
		this.connections = [];
	}
	
	addConnection(conn, paramIndex, isIncoming){
		//the paramIndex and isIncoming parameters are redundant for a field,
		//but I kept them to keep the signature of the method consistent
		if(this.connections.indexOf(conn.id) > -1){
			return;
		}
		this.connections.push(conn.id);
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
		//console.log(connectionLookup);
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
}