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
	var comp1 = new Component("point",["x", "y"], ["out"], ["x","y"], ["pt"],
		(params) => {
			return [params[0], params[1]];
		},
		(params) => {
			var compId = params[0];
			//incomplete
		});
	
	var comp2 = new Component("circle",["C", "R"], ["out"], ["center","radius"], 
		["out"], (params) => {
			return params[0] + params[1];
		},
		params => {
			var compId = params[0];
		});
	
	addComponent(fld1.getHtml());
	addComponent(fld2.getHtml());
	addComponent(comp1.getHtml());
	addComponent(comp2.getHtml());
}