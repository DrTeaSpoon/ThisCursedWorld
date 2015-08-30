(function(){var superctx = $.GetContextPanel().GetParent().GetParent();for(var x in superctx.data()){$[x] = superctx.data()[x];}})(); function AddToGlobalNamespace(name, func){$.GetContextPanel().GetParent().GetParent().data()[name] = func;}

var CloseTooltips = function(){
	
}

AddToGlobalNamespace("ShowTooltip", function(x, y, op_width, op_height, op_dir){
	
	CloseTooltips();
	
	$('#Container').position = x + " " + y;
	
	var dir = "up";
	
	if(dir == "up"){
		$('#Container').style.flowChildren = "up";
		$('#Container').style.marginBottom = "-2000px";
	}
	
	return $('#Container');
	
});

AddToGlobalNamespace("CloseTooltips", CloseTooltips);

AddToGlobalNamespace("GetShownTooltips", function(){
	
});