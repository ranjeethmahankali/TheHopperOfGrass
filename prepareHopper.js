//preparation script

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