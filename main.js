//main script
window.onload = main;

function main(){
	/*
	comp = new Component("circle",['C','R'],['O'],["Center", "Radius"],["Circle"],
		null);
	*/
	//console.log(comp.id);
	var fld1 = new Field("number", true);
	var fld2 = new Field("number", true);
	var comp1 = new Component("add",["A", "B"], ["out"], ["first","second"], ["sum"],
		(params) => {return params[0] + params[1]});
	
	var comp2 = new Component("add",["A", "B"], ["out"], ["first","second"], ["sum"],
		(params) => {return params[0] + params[1]});
	
	addComponent(fld1.getHtml());
	addComponent(fld2.getHtml());
	addComponent(comp1.getHtml());
	addComponent(comp2.getHtml());
}