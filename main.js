window.onload = main;
ComponentDefinitions = {}

//function defineComponent(name, )

//main script
function main(){
	/*
	comp = new Component("circle",['C','R'],['O'],["Center", "Radius"],["Circle"],
		null);
	*/
	//console.log(comp.id);
	var fld1 = new Field("number", true);
	var fld2 = new Field("number", true);
	var fld3 = new Field("number", true);
	var comp1 = new Component("point",["x", "y"], ["out"], ["x","y"], ["point"],
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
	
	var comp2 = new Component("circle",["C", "R"], ["out"], ["center","radius"], 
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
	
	addComponent(fld1.getHtml());
	addComponent(fld2.getHtml());
	addComponent(fld3.getHtml());
	addComponent(comp1.getHtml());
	addComponent(comp2.getHtml());
}