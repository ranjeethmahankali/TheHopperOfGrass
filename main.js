//main script
window.onload = main;

var comp, fld;

function main(){
	comp = new Component("circle",['C','R'],['O'],["Center", "Radius"],["Circle"],
		null);
	//console.log(comp.id);
	fld = new Field("number", true);
	addComponent(comp.getHtml());
	addComponent(fld.getHtml());
}

function addDebugConnection(){
	var conn = new Connection(fld.id, 0, comp.id, 0);
	addSvgPath(conn.getHtml());
}