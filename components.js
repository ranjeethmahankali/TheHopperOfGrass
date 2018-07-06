//component related logic

//component class
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
		
		dragElement(html);
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
		inpNode.className = "inputs";
		inpNode.setAttribute("contenteditable", "true");
		inpNode.appendChild(document.createTextNode(this.isNumber ? "0" : "value"));
		
		inputBox.appendChild(inpNode);
		html.appendChild(inputBox);
		
		var outputBox = document.createElement("div");
		outputBox.className = "outputBox";
		
		var outNode = document.createElement("p");
		outNode.className = "outputs";
		outNode.appendChild(document.createTextNode("out"));
		
		outputBox.appendChild(outNode);
		html.appendChild(outputBox);
		
		dragElement(html);
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
		var p1, p2, p3, p4;
		var incoming = this.getIncomingParam();
		//debug = incoming
		var outgoing = this.getOutgoingParam();
		if(incoming == null || outgoing == null){return null;}
		
		var inLeft, inTop, outLeft, outTop;
		inLeft = globalOffsetLeft(incoming);
		outLeft = globalOffsetLeft(outgoing);
		inTop = globalOffsetTop(incoming);
		outTop = globalOffsetTop(outgoing);
		//console.log(inLeft, inTop, outLeft, outTop);
		
		//ext is the control point which affects how soon / late the curve turns to the other component
		var ext = 75
		
		p1 = [inLeft + incoming.offsetWidth, 
			inTop + Math.floor(incoming.offsetHeight/2) + 1];
		p2 = [inLeft + incoming.offsetWidth + ext, 
			inTop + Math.floor(incoming.offsetHeight/2) +1];
		p3 = [outLeft - ext, outTop + Math.floor(incoming.offsetHeight/2)+1];
		p4 = [outLeft, outTop + Math.floor(incoming.offsetHeight/2)+1];
		
		//draw the connection as a straight line
		//return "M "+p1[0]+" "+p1[1]+" L "+p4[0]+" "+p4[1];
		//or draw it as a curve
		return "M "+p1[0]+" "+p1[1]+" C "+p2[0]+" "+p2[1]+", "+p3[0]+" "+
			p3[1]+", "+p4[0]+" "+p4[1];
	}
	
	updateHtml(){
		if(domLookup[this.id] == undefined){
			var newHtml = this.getHtml();
		}
		else{
			domLookup[this.id].setAttribute("d", this.getGeomDef());
			debug = domLookup[this.id];
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