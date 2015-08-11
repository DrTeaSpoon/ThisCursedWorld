var questHide = false;
var lastName = "";
var localPlayer = Players.GetLocalPlayer();
data = {
	name: "King of Cows",
	portrait: null,
	initText: "ME? You chose to disobey ME?!?!!?!? HOW DARE YOU CHOOSE TO DISOBEY THE QUEEN OF CHAOS, THE LORD OF DESTRUCTION, THE ONE WHO SHALL MAKE THE STRONG SUFFER AND THE GODS FALL! SUFFER! I DEMAND YOU TO SUFFER! WORTHLESS COWARD!",
	options: {
		first: {
			text: "Would you care for a drink, my fair lady?",
			img: "file://{images}/custom_game/chat.png"
		},
		
		third: {
			text: "<tag:\"yellowHighlight\">[QUEST] The Fall of Ankhar</font> ",
			img: "file://{images}/custom_game/exclamation.png"
		},
		
		fourth: {
			text: "<tag:\"greenHighlight\">[QUEST] The Fall of Ankhar ",
			img: "file://{images}/custom_game/check.png"
		},
		
		fifth: {
			text: "<tag:\"orangeHighlight\">[QUEST] Sieging the giant much more giant than ever more imagined castle of uber castleness</font>",
			img: "file://{images}/custom_game/ItemIcon058.png"
		}
	}
}

var OnWindowClose = function(){
	$('#InteractPanel').visible = false;
	GameEvents.SendCustomGameEventToServer("combo_quest_show", {player:localPlayer, show:1} );
}

var currentOptionsRoot = {};
var currentOptionsPath = "";
var currentOptions = {};
var currentSubOptions = null;

var OnWindowHide = function(){
	if(questHide){
		$('#MiniLabel').text = "―";
		$('#MiniLabel').style.marginLeft = "3px";
		$('#MiniLabel').style.horizontalAlign = "center";
		$('#Content').visible = true;
		$('#InteractPanel').AddClass('InteractPanel');
		$('#InteractPanel').RemoveClass('InteractPanelSmall');
		questHide = false;
	}else{
		$('#MiniLabel').text = "+";
		$('#MiniLabel').style.marginLeft = "7px";
		$('#MiniLabel').style.horizontalAlign = "center";
		$('#Content').visible = false;
		$('#InteractPanel').AddClass('InteractPanelSmall');
		$('#InteractPanel').RemoveClass('InteractPanel');
		questHide = true;
	}
};
var waitingForLeak = false;
var waitingForLeakTextOverride = false;
var addOption = function(textt, image, id){
	optionsPanel = $('#Options');
	count = optionsPanel.GetAttributeInt('count', 0);
	var i = count
	optionsPanel.SetAttributeInt('count',i+1);
	var panel = $.CreatePanel('Button', optionsPanel, 'Option'+i);
	var imgPanel = $.CreatePanel('Panel', panel, 'Option'+i+'#Image#Panel');
	var textPanel = $.CreatePanel('Panel', panel, 'Option'+i+'#Text#Panel');
	var realTextPanel = $.CreatePanel('Panel', textPanel, 'Option'+i+'#Text#Panel#Real');
	var text = $.CreatePanel('Label', realTextPanel, 'Option'+i+'#Text#Text');
	//hint text todo
	var imgFrame = $.CreatePanel('Panel', imgPanel, 'Option'+i+'#Image#Frame');
	var img = $.CreatePanel('Image', imgFrame, 'Option'+i+'#Image#Image');
	img.SetImage(image);
	 

	text.html = true; 
	var txx = textt;
	if(txx.substring(0,6) == '<tag:\"'){
		var tb = txx.substring(6, txx.length);
		tb = tb.substring(0, tb.indexOf('\"'));
		text.AddClass(tb);
		text.AddClass('OptionsTextRealNoColor');
	}else{
		text.AddClass('OptionsTextReal');
	}
	
	
	text.text = textt;
	panel.AddClass('OptionsPanel')
	imgPanel.AddClass('OptionsImagePanel'); 
	img.AddClass('OptionsImage');
	textPanel.AddClass('OptionsTextPanel');
	imgFrame.AddClass('OptionsImageFrame');
	realTextPanel.AddClass('OptionsTextPanelReal');
	
	
	panel.SetPanelEvent('onactivate', (function(){
		$.Msg('CLICK' + textt);
		if(id){
			var back = true;
			for(var x in id){
			//	$.Msg(x + ':' + id[x]);
			}
				if(id.fireId){
					var ib = id.fireId;
					if(ib == '$'){
						ib=currentSubOptions['1'];
					}
					$.Msg('CLICK')
					GameEvents.SendCustomGameEventToServer("interact_click_option_new", {id: ib, player:localPlayer} );
				}
			if(id.goto){
				if(id.goto.shortcut){
					if(id.goto.shortcut.indexOf && id.goto.shortcut.indexOf('$refresh') != -1){
						waitingForLeak = true;
						back = false;
						var ib = id.fireId;
						if(!ib || ib == '$'){
							ib=currentSubOptions['1'];
						}
						$.Msg('SENDING');
						GameEvents.SendCustomGameEventToServer("interact_refresh_options", {id: ib, player:localPlayer} );
					}else{
						$.Msg('11 ' + id.goto.shortcut + id.goto.shortcut.includes + ':' + id.goto.shortcut.contains + ':' + id.goto.shortcut.indexOf + ':' + id.goto.shortcut.indexof);
						back = false;
						onInteractSetFlags(currentOptions);
					}
				}else{
					$.Msg('22');
				}
				if(id.goto.options){
					back = false;
					generateOptions(id.goto.options);
				}
				if(id.goto.text){
					waitingForLeakTextOverride = waitingForLeak;
					$('#DialogueText').html = true;
					$('#DialogueText').text = id.goto.text;
					if(id.goto.text.length < 30){
						$('#DialogueText').RemoveClass('DialogueTextSmall');
						$('#DialogueText').AddClass('DialogueTextBig');
					}else{
						$('#DialogueText').AddClass('DialogueTextSmall');
						$('#DialogueText').RemoveClass('DialogueTextBig');
					}
				}
				
				if(id.goto.portraitFx){
				
				}
			}
			if(back){
				onInteractShow({show:false});
			}
		}
	}));
	
}
var optionsData = {}
var generateOptions = function(options){
	if(currentSubOptions === null){
		currentSubOptions = options;
	}
	optionsPanel = $('#Options');
	optionsPanel.RemoveAndDeleteChildren();
	optionsData = {}
	var i = -1;
	var x = {}
	for(x in options){
		if(typeof options[x] !== 'object') continue;
		var img = options[x].img;
		if(options[x].img.substring(0,1) == "/"){
			img = "file://{images}/custom_game/" + img + ".png";
		}
		addOption(options[x].text, img, {goto: options[x].goto, fireId:options[x].fireId});
		
	}
}

var close = function(){
  
}
var onInteractShow = function(data){
	if(data.player != localPlayer) return;
	if(data.name) lastName = data.name;
	GameEvents.SendCustomGameEventToServer("combo_quest_show", {player:localPlayer, show:data.show?1:0} );
	$('#InteractPanel').visible = data.show;
}

var onInteractSetFlags = function(data){
	if(data.player != localPlayer) return;
	if(waitingForLeak){
		waitingForLeak = false;
		currentOptions = data; 
		currentSubOptions = null;
		generateOptions(data.options);
		currentSubOptions = null;
		if(!waitingForLeakTextOverride){
			$('#DialogueText').text = data.text;
			if(data.text.length < 30){
				$('#DialogueText').RemoveClass('DialogueTextSmall');
				$('#DialogueText').AddClass('DialogueTextBig');
			}else if(data.text.length > 100){
				$('#DialogueText').AddClass('DialogueTextSmall');
				$('#DialogueText').RemoveClass('DialogueTextBig');
			}else{
				$('#DialogueText').AddClass('DialogueTextSmall');
				$('#DialogueText').RemoveClass('DialogueTextBig');
			}
		}
		waitingForLeakTextOverride = false;
		return;
	}
		$('#HeaderName').text = data.name;
	if(data.text){
		$('#DialogueText').text = data.text;
		if(data.text.length < 30){
			$('#DialogueText').RemoveClass('DialogueTextSmall');
			$('#DialogueText').AddClass('DialogueTextBig');
		}else{
			$('#DialogueText').AddClass('DialogueTextSmall');
			$('#DialogueText').RemoveClass('DialogueTextBig');
		}
	}
	
	if(data.options){
		currentOptions = data; 
		currentSubOptions = null;
		generateOptions(data.options);
		currentSubOptions = null;
	}
	if(data.portrait){} //todo	
}

var onInteractClearOptions = function(data){
	if(data.player != localPlayer) return;
	$('#Options').RemoveAndDeleteChildren();
}

var onInteractAddOption = function(data){
	if(data.player != localPlayer) return;
	addOption(data.text, data.img, data.id);
}
var onInteractClickOption = function(data){
	if(data.player != localPlayer) return;
	$.Msg('HI');
} 

var onInventoryChanged = function(data){
	$.Msg('HI');
	GameEvents.SendCustomGameEventToServer("inventory_updated", {} );
}
 
var init = function(data){
	$('#InteractPanel').visible = false;
	if(data){ 
		$('#HeaderName').text = data.name;
		//portrait
		$('#DialogueText').text = data.initText
		generateOptions(data.options);
	}
			$('#DialogueText').AddClass('DialogueTextSmall');
	 
	$.Msg('////////////////////////////////////////////////////////////////////////')
	$.Msg('There will be some erroneous error messages below \\/')
	GameEvents.Subscribe("interact_show", onInteractShow);
	GameEvents.Subscribe("interact_set_flags", onInteractSetFlags);
	GameEvents.Subscribe("interact_clear_options", onInteractClearOptions);
	GameEvents.Subscribe("interact_add_option", onInteractAddOption);
	GameEvents.Subscribe("interact_click_option", onInteractClickOption);
	GameEvents.Subscribe("dota_inventory_changed", onInventoryChanged);
	$.Msg('No more!')
	$.Msg('////////////////////////////////////////////////////////////////////////')
}

init(data);