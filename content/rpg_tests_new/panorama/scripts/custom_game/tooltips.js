(function(){var superctx = $.GetContextPanel().GetParent().GetParent();for(var x in superctx.data()){$[x] = superctx.data()[x];}})(); function AddToGlobalNamespace(name, func){$.GetContextPanel().GetParent().GetParent().data()[name] = func;}

var GetScreenWidth = function(){
	return 1920.0; 
}
var GetScreenHeight = function(){
	return 1080.0;
} 

var ComputePanelAbsPosition = function(panel){
	var xy = {x: 0, y: 0}; 
	var cc = 0;
	while(panel.id != "CustomUIRoot" || cc > 30){
		$.Msg("X : " + panel.actualxoffset);
		xy.x += panel.actualxoffset;
		xy.y += panel.actualyoffset;
		panel = panel.GetParent();
		cc++;
	}
	xy.x *= (1920 / panel.contentwidth);
	xy.y *= (1080 / panel.contentheight);
	return xy;
}

var CloseTooltips = function(){
	$('#Container').RemoveAndDeleteChildren();
}
var lastTooltip = null;
var widthAdd = 0;
var heightAdd = 0;

var UpdateWidthHeight = function(){
	if(lastTooltip){
		var width = lastTooltip.contentwidth * (GetScreenWidth() / 1920.0);
		var height = lasttTooltip.contentheight * (GetScreenHeight() / 1080.0);
		
		$('#Container').style.width = width + "px";
		$('#Container').style.height = height + "px";
	}
	
	$.Schedule(0.01, UpdateWidthHeight);
}
UpdateWidthHeight();

AddToGlobalNamespace("ShowTooltip", function(panel, op_width, op_height, op_dir){
	$.Msg("SHOW TOOLTIP");
	CloseTooltips();
	
	var x = ComputePanelAbsPosition(panel);
	$('#Container').style.position = x.x + "px " + x.y + "px";
	
	var dir = "up";
	
	if(dir == "up"){
		$('#Container').style.flowChildren = "down";
	}
	
	return $('#Container');
	
});

AddToGlobalNamespace("CloseTooltips", CloseTooltips);

AddToGlobalNamespace("GetShownTooltips", function(){
	
});