//main script
window.onload = main;

var comp, fld;

function main(){
	comp = new Component("circle",['C','R'],['O'],["Center", "Radius"],["Circle"],
		null);
	console.log(comp.id);
	fld = new Field("number", true);
	document.body.appendChild(comp.getHtml());
	document.body.appendChild(fld.getHtml());
}

function addConnection(){
	var conn = new Connection(fld.id, 0, comp.id, 0);
	addSvgPath(conn.getHtml());
}