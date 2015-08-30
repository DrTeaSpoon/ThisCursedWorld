(function(){var superctx = $.GetContextPanel().GetParent().GetParent();for(var x in superctx.data()){$[x] = superctx.data()[x];}})(); function AddToGlobalNamespace(name, func){$.GetContextPanel().GetParent().GetParent().data()[name] = func;}
/*$.Msg("a X : " + $('#All').actualxoffset);

var parent = $.ShowTooltip($('#Yellow'));
$.Msg("Parent : " + parent);    
var lbl = $.CreatePanel("Label", parent, "");   
lbl.text = "HI";    */