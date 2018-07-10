//preparation script

ComponentDefinitions = {}

/**
	* Adds a new component definition to the environment.
	*
	* @param {String} name - The name of the component.
	* @param {Array of Strings} inSymbols - The symbols for the input parameters.
	* @param {Array of Strings} outSymbols - The symbols for the output parameters.
	* @param {Array of Strings} inCaptions - Captions for the input parameters.
	* @param {Array of Strings} outCaptions - Captions for the output parameters.
	* @param {Arrow Function (lambda exp)} solver - This function should evaluate the output of the component
	* @param {Arrow Function (lambda exp)} geometry solver - This function should evaluate the geometry output of the component
	*/
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

//defining the point component
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

//defining the circle component
defineComponent("circle",["C", "R"], ["out"], ["center","radius"], ["circle"], 
	(params) => {
		return [params[0], params[1]];
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

//defining the line component
defineComponent("line",["S", "E"], ["out"], ["start","end"], ["line"], 
	(params) => {
		return params[0] + params[1];
	},
	params => {//geometry solver
		var geom = document.createElementNS(svgNS, "line");
		geom.setAttribute("x1", params[0][0]);
		geom.setAttribute("y1", params[0][1]);
		geom.setAttribute("x2", params[1][0]);
		geom.setAttribute("y2", params[1][1]);
		geom.setAttribute("stroke","black");
		geom.setAttribute("stroke-width","2");
		geom.setAttribute("fill","none");
		geom.id = newGuid();
		addGeometry(geom);
		return geom.id;
	});
	
//defining the line component
defineComponent("polarLn",["S", "D", "L"], ["out"], ["start","direction", "length"], 
	["line"], 
	(params) => {
		return params[0] + params[1];
	},
	params => {//geometry solver
		var geom = document.createElementNS(svgNS, "line");
		var start = params[0];
		//[x + rcosA, y +rsinA]
		var ang = params[1]*Math.PI/180;
		var end = [start[0] + params[2]*Math.cos(ang), 
			start[1] + params[2]*Math.sin(ang)]
		geom.setAttribute("x1", start[0]);
		geom.setAttribute("y1", start[1]);
		geom.setAttribute("x2", end[0]);
		geom.setAttribute("y2", end[1]);
		geom.setAttribute("stroke","black");
		geom.setAttribute("stroke-width","2");
		geom.setAttribute("fill","none");
		geom.id = newGuid();
		addGeometry(geom);
		return geom.id;
	});