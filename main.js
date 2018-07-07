window.onload = main;
ComponentDefinitions = {}

function defineComponent(name, inSymbols, outSymbols, inCaptions, outCaptions,
	solver, geomSolver){
	
	ComponentDefinitions[name] = {
		"name": name,
		"inSymbols": inSymbols,
		"outSymbols": outSymbols,
		"inCaptions": inCaptions,
		"outCaptions": outCaptions,
		"solver": solver,
		"geomSolver": geomSolver,
	};
}

function createComponentInstance(compName){
	var compData = ComponentDefinitions[compName];
	if(compData == undefined){
		alert("unrecognized component!");
		return;
	}
	return new Component(
		compData["name"],
		compData["inSymbols"],
		compData["outSymbols"],
		compData["inCaptions"],
		compData["outCaptions"],
		compData["solver"],
		compData["geomSolver"],
	);
}

function defineStandardComponents(){
	//defining a point component
	defineComponent("point",["x", "y"], ["out"], ["x","y"], ["point"],
		(params) => {
			return [params[0], params[1]];
		},
		(params) => {//geometry solver
			var geom = document.createElementNS(svgNS, "circle");
			geom.setAttribute("cx", params[0]);
			geom.setAttribute("cy", params[1]);
			geom.setAttribute("r", 2);
			geom.setAttribute("stroke","black");
			geom.setAttribute("stroke-width","4");
			geom.setAttribute("fill","none");
			geom.id = newGuid();
			addGeometry(geom);
			return geom.id;
		});
	
	//defining a circle component
	defineComponent("circle",["C", "R"], ["out"], ["center","radius"], 
		["out"], (params) => {
			return params[0] + params[1];
		},
		params => {//geometry solver
			var geom = document.createElementNS(svgNS, "circle");
			geom.setAttribute("cx", params[0][0]);
			geom.setAttribute("cy", params[0][1]);
			geom.setAttribute("r", params[1]);
			geom.setAttribute("stroke","black");
			geom.setAttribute("stroke-width","2");
			geom.setAttribute("fill","none");
			geom.id = newGuid();
			addGeometry(geom);
			return geom.id;
		});
}

//main script
function main(){
	
	defineStandardComponents();
	var fld1 = new Field("number", true);
	var fld2 = new Field("number", true);
	var fld3 = new Field("number", true);
	var comp1 = createComponentInstance("point");
	
	var comp2 = createComponentInstance("circle");
	
	addComponent(fld1.getHtml());
	addComponent(fld2.getHtml());
	addComponent(fld3.getHtml());
	addComponent(comp1.getHtml());
	addComponent(comp2.getHtml());
}