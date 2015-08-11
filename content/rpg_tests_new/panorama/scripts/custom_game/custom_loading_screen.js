

var x = function(){
	$.Msg("HI");
	$.Schedule(0.1, x);
	$.Msg(Game.GetMapInfo().map_display_name);
	if(Game.GetMapInfo().map_display_name === "template_map"){
		$('#gamemode').SetImage("file://{images}/custom_game/loading_screen/loadscreen.png");
		$.Msg("SET");
	}
}
x();