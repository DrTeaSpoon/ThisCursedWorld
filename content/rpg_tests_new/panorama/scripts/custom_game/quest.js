//Runs a function periodically
//start - how much of an additional delay to have (on top of the tick refresh) (set this to -1 to run the function immediately
//time - how long to run for. set this to -1 to run infinitely
//tick - how many seconds to elapse between ticks (assumes time / tick is an integer) (set this to negative to run a set amount of ticks, e.g. -30 will run 30 ticks in whatever time period given)
//func - func to run (return true to cancel)
//UPDATE June 29 2015 - fixed some enclosure issues, added a safecheck for time overflow
$.Every = function(start, time, tick, func){
	var startTime = Game.Time();
	var tickRate = tick;
	if(tick < 1){    
		if(start < 0) tick--;
		tickRate = time / -tick;
	}
	
	var tickCount =  time/ tickRate;
	
	if(time < 0){
		tickCount = 9999999;
	}
	var numRan = 0;
	$.Schedule(start, (function(start,numRan,tickRate,tickCount){
		return function(){
			if(start < 0){
				start = 0;
				if(func()){
					return;
				}; 
			}  
			var tickNew = function(){
				numRan++;
				delay = (startTime+tickRate*numRan)-Game.Time();
				if((startTime+tickRate*numRan)-Game.Time() < 0){
					delay = 0;
				}
				$.Schedule(delay, function(){
					if(func()){
						return;
					};
					tickCount--;
					if(tickCount > 0) tickNew();
				});
			};
			tickNew();
		}
	})(start,numRan,tickRate,tickCount));
};
questHide = false;
var OnQuestHide = function(){
	if(questHide){
		$('#MiniLabel').text = " --- ";
		$('#ContainerPanel').visible = true;
		$('#QuestRoot').AddClass('QuestRoot');
		$('#QuestRoot').RemoveClass('QuestRootSmall');
		questHide = false;
	}else{
		$('#MiniLabel').text = "  +  ";
		$('#ContainerPanel').visible = false;
		$('#QuestRoot').AddClass('QuestRootSmall');
		questHide = true;
	}
};

var playerId = Players.GetLocalPlayer();

var OnQuestSmallerHide = function(quest){
	var q = $('#Quest'+quest)
	if(q.GetAttributeInt('reveal', 0) == 0){
		q.SetAttributeInt('reveal', 1);
		$('#Quest'+quest+'#LineContainer').style.visibility = 'collapse';
		$('#Quest'+quest+'#Minimize#Label').text = "  +  ";
		questHide = false;
	}else{
		q.SetAttributeInt('reveal', 0);
		$('#Quest'+quest+'#LineContainer').style.visibility = 'visible';
		$('#Quest'+quest+'#Minimize#Label').text = " ― ";
		questHide = true;
	}
}

var organizeQuestLines = function(){

}

var flashQuest = function(questId, green){
	
} 
var i = 0
var ran = 0; 
var addQuest = function(questId, name){
	if($('#Quest'+questId)){
		$('#Quest'+questId).RemoveAndDeleteChildren(); 
		$('#Quest'+questId).DeleteAsync(0);
		$.Msg('DEV ERROR : Forced to delete questId ' + questId + ' for quest ' + name);
	}
	var quest = $.CreatePanel('Panel', $('#ContainerPanel'), 'Quest'+questId);
	var questHeaderPanel = $.CreatePanel('Panel', quest, 'Quest'+questId+'#Panel');
	var questHeader = $.CreatePanel('Label', questHeaderPanel, 'Quest'+questId+'#Text');
	var minimizeButton = $.CreatePanel('Button', questHeaderPanel, 'Quest'+questId+'#Minimize');
	var minimizeButtonLabel = $.CreatePanel('Label', minimizeButton, 'Quest'+questId+'#Minimize#Label');
	
	
	questHeader.AddClass('QuestHeaderDefault');
	questHeaderPanel.AddClass('QuestHeaderPanel');
	//if(questId == 1){
	//	questHeader.AddClass('QuestHeaderOrange');
	//}else if(questId == 2){
	//	questHeader.AddClass('QuestHeaderGreen');
	//}else if(questId == 3){
	//	questHeader.AddClass('QuestHeaderRed');
	//}else if(questId == 5){
	//	$.Msg('1 : ' + name); 
	//	questHeader.AddClass('QuestHeaderViolet');
	//}
	questHeader.text = name;
	
	quest.AddClass('QuestPanel'); 
	
	minimizeButton.AddClass('MinierPanel');
	minimizeButton.SetPanelEvent('onactivate', (function(){OnQuestSmallerHide(questId)}));
	
	minimizeButtonLabel.AddClass('MinierPanelLabel');
	minimizeButtonLabel.text = " ― ";
	
	var lineContainer = $.CreatePanel('Panel', quest, 'Quest'+questId+'#LineContainer');
	lineContainer.AddClass('QuestLineContainer');
	var ib = i++;
	var tick = false;
}
 
var addLine = function(questId, text,line){    
	quest = $('#Quest'+questId+'#LineContainer');
	var count
	if(line !== null){
		count = line;
	}else{
		count = $.Msg('SETTING HINT : ' + $('#Quest'+questId+'#Line'+line));
	}
	quest.SetAttributeInt('bigLineCount', count + 1);
	line = $.CreatePanel('Panel', quest, 'Quest'+questId+'#Line'+count);
		$.Msg('SETTING HINT : ' + $('#Quest'+questId+'#Line'+count)+ "COUNT : " + count);
	line.AddClass('QuestLinePanel');
	lineText = $.CreatePanel('Label', line, 'Quest'+questId+'#Line'+count+'#Text');
	lineText.html = true;
	lineText.text = " • " + text;
	
		lineText.AddClass('QuestLine');
	//if(count == 1){
	//	lineText.AddClass('QuestLineSlashed');
	//}
	
	organizeQuestLines(questId);
	return line;
}

var addSubLine = function(questId, lineNo, text){ 
	quest = $('#Quest'+questId); 
	line = $('#Quest'+questId+'#Line'+lineNo);	
	count = 0;
	line.SetAttributeInt('smallLineCount', count + 1);
	
	subLine = $.CreatePanel('Label', line, 'Quest'+questId+'#Line'+lineNo+'#SubLine'+count);
	subLine.AddClass('QuestSubLine'); 
	subLine.text = text; 
}

var setLine = function(questId, line, text){
	if(!($('#Quest'+questId+'#Line'+line))){
		addLine(questId,text,line);
		return;
	}
		$.Msg('SETTING HINT : ' + $('#Quest'+questId+'#Line'+line));
	$('#Quest'+questId+'#Line'+line+'#Text').html = true;
	$('#Quest'+questId+'#Line'+line+'#Text').text = " • " + text;
}

var setSubLine = function(questId, line, subLine, text){
	if(!($('#Quest'+questId+'#Line'+line+'#SubLine'+subLine))){
		addSubLine(questId,line,text);
		return;
	} 
	$('#Quest'+questId+'#Line'+line+'#SubLine'+subLine).html = true;
	$('#Quest'+questId+'#Line'+line+'#SubLine'+subLine).text = text;
}
var removeQuest = function(dat){
	if(!dat) return;
	$('#Quest'+dat.id).RemoveAndDeleteChildren();
	$('#Quest'+dat.id).DeleteAsync(0);
}

var removeLine = function(dat){
	if(!dat) return;
	$('#Quest'+dat.id+'#Line'+dat.line).RemoveAndDeleteChildren();
	$('#Quest'+dat.id+'#Line'+dat.line).DeleteAsync(0);
}

var removeSubLine = function(dat){
	if(!dat) return;
	$('#Quest'+dat.id+'#Line'+dat.line+'#SubLine'+dat.sub).RemoveAndDeleteChildren();
	$('#Quest'+dat.id+'#Line'+dat.line+'#SubLine'+dat.sub).DeleteAsync(0);
}

var onQuestCreate = function(dat){
	if(!dat) return;
	if(dat.player != playerId) return;
	addQuest(dat.id,dat.name);
}

var onQuestSetLine = function(dat){
	if(!dat) return;
	if(dat.player != playerId) return;
	if(!($('#Quest'+dat.id))){
		$.Schedule(0.01, (function(){onQuestSetLine(dat);})); //events run in asynchronous order, this request might come in bef
		return;
	}
	$.Msg('LINE : ' + dat.lineIndex + ' COMPLETED : ' + dat.completed);
	setLine(dat.id,dat.lineIndex,dat.lineText);
	if(dat.hint){
		$.Msg('SETTING HINT : ' + $('#Quest'+dat.id+'#Line'+dat.lineIndex) + "LINE : " + dat.lineIndex);
		setSubLine(dat.id,dat.lineIndex,0,dat.hint);
	}
	
	if(dat.completed == "true"){
		if($('#Quest'+dat.id+'#Line'+dat.lineIndex+'#Text')) $('#Quest'+dat.id+'#Line'+dat.lineIndex+'#Text').AddClass('QuestLineSlashed');
	}else if(dat.completed !== null){ 
		if($('#Quest'+dat.id+'#Line'+dat.lineIndex+'#Text')) $('#Quest'+dat.id+'#Line'+dat.lineIndex+'#Text').RemoveClass('QuestLineSlashed');
	}
	
}

var onQuestCompleteLine = function(dat){
	if(!dat) return;
	if(dat.player != playerId) return;
	if(!dat.fade){
		removeLine(dat.id,dat.lineIndex);
	}else{
		$.Schedule(2, function(){onQuestCompleteLine(dat.id,dat.lineIndex,!dat.fade)});
	}
}

var onQuestSetSubLine = function(dat){
	if(!dat) return;
	if(dat.player != playerId) return;
	if(!($('#Quest'+dat.id+'#Line'+dat.lineIndex))){
		$.Schedule(0.01, (function(){onQuestSetSubLine(dat);}));
		return;
	}
	setSubLine(dat.id,dat.lineIndex,dat.lineSubIndex,dat.lineText);
}

var onQuestCompleteSubLine = function(dat){
	if(!dat) return;
	if(dat.player != playerId) return;
	if(!dat.fade){
		removeSubLine(dat.id,dat.lineIndex,dat.lineSubIndex);
	}else{
		$.Schedule(2, function(){onQuestCompleteSubLine(dat.id, dat.lineIndex, dat.lineSubIndex, !dat.fade)});
	}
}


var onQuestRemove = function(dat){
	if(!dat) return;
	if(dat.player != playerId) return;
	if(!dat.fade){
		removeQuest(dat.id);
	}else{
		$.Schedule(2, function(){onQuestRemove(dat.id,!dat.fade)});
	}
}

var onQuestFlag = function(dat){
	if(!dat) return;
	if(dat.player != playerId) return;
	if(dat.flag == "pendingComplete"){
		$('#Quest'+dat.id+'#Text').AddClass('QuestHeaderGreen');
	}else if(dat.flag == "completeWithFade"){
		removeQuest({id:dat.id});
	}else if(dat.flag == "complete"){
		removeQuest(dat.id);
	}else if(dat.flag == "pendingFailure"){
		removeQuest(dat.id);
	}else if(dat.flag == "clearLines"){
		if($('#Quest'+dat.id+'#LineContainer')) $('#Quest'+dat.id+'#LineContainer').RemoveAndDeleteChildren();
	}else if(dat.flag == "clearAll"){
		$('#ContainerPanel').RemoveAndDeleteChildren();
	}else if(dat.flag == "setRed"){
		$('#Quest'+dat.id+'#Text').AddClass('QuestHeaderRed');
	}	
	
}

var onQuestShow = function(table, key, data){
	if(!data) return;
	if(data.player != playerId) return;
	if(data.show === null || data.show == 1){
		$('#QuestRoot').visible = true;
	}else{
		$('#QuestRoot').visible = false;
	}
	OnQuestHide();
}
$.Msg('INIT - Quest UI');
(function(){  
	$.Msg('////////////////////////////////////////////////////////////////////////')
	$.Msg('There will be some erroneous error messages belowsdfasdfsadfsadf  \\/')
	GameEvents.Subscribe("quest_create", onQuestCreate);
	GameEvents.Subscribe("quest_set_line", onQuestSetLine);
	GameEvents.Subscribe("quest_complete_line", onQuestCompleteLine);
	GameEvents.Subscribe("quest_set_sub_line", onQuestSetSubLine);
	GameEvents.Subscribe("quest_complete_sub_line", onQuestCompleteSubLine);
	GameEvents.Subscribe("quest_remove", onQuestRemove);
	GameEvents.Subscribe("quest_flag", onQuestFlag);
	CustomNetTables.SubscribeNetTableListener( "quest", onQuestShow );
	$.Msg('No more!')
	$.Msg('////////////////////////////////////////////////////////////////////////')
	
	/*$.Msg('Quest Init. NULL : ' + $('#ContainerPanel'));
	addQuest(0, 'Killin Fish');
	addLine(0, "Kill some fish: 0/10");
	addSubLine(0,0, "Kil dem fishes");
	addLine(0, "Kil moar fish");
	addSubLine(0,1, "lol dead");
	
	addQuest(1, 'Killin treants'); 
    addLine(1, "Kill some treants: 0/10");
	addSubLine(1,0, "Kil dem treants");
	addLine(1, "Kil moar treants");
	addSubLine(1,1, "lol treants");
	
	addQuest(2, 'Killin treants');
    addLine(2, "Kill some treants: 0/10");
	addSubLine(2,0, "Kil dem treants");
	addLine(2, "Kil moar treants");
	addSubLine(2,1, "lol treants");
	
	addQuest(3, 'Killin treants');
    addLine(3, "Kill some treants: 0/10");
	addSubLine(3,0, "Kil dem treants");
	addLine(3, "Kil moar treants");
	addSubLine(3,1, "lol treants");
	
	addQuest(4, 'Killin treants');
    addLine(4, "Kill some treants: 0/10");
	addSubLine(4,0, "Kil dem treants");
	addLine(4, "Kil moar treants");
	addSubLine(4,1, "lol treants");*/
})();


		 