(function(){var superctx = $.GetContextPanel().GetParent().GetParent();for(var x in superctx.data()){$[x] = superctx.data()[x];}})(); function AddToGlobalNamespace(name, func){$.GetContextPanel().GetParent().GetParent().data()[name] = func;}

$.Every = function(start, time, tick, func){
	var startTime = Game.Time();
	var tickRate = tick;
	if(tick < 1){    
		if(start < 0) tick--;
		tickRate = time / -tick;
	} 
	
	var tickCount =  time/ tickRate;
	
	if(time <= 0){
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
if(true){ 
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ACTION_PANEL, false );     //Hero actions UI.
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ACTION_MINIMAP, false );     //Minimap.
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_PANEL, false );      //Entire Inventory UI
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_SHOP, false );     //Shop portion of the Inventory.
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_ITEMS, false );      //Player items.
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_QUICKBUY, false );     //Quickbuy.
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_COURIER, false );      //Courier controls.
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_PROTECT, false );      //Glyph.
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_GOLD, false );     //Gold display.
    GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS, false );      //Suggested items shop panel.
	//$.GlobalFunction();

}



//TARGET UI
var currentTargetType = "sdf";
var offsets = {
	basic: {
		width: "200px",
		top: "20px"
	},
	
	medium: {
	
	},
	
	epic: {
	
	},
	
	grandeur: {
		panelWidth: "652",
		
		width: "600",
		
		hpBarOffsetBottom: "19",
		hpBarOffsetLeft: "83",
		hpBarWidth: "494",
		hpBarHeight: "19",
		   
		imageWidth: "700",
		imageHeight: "100",
	}
}
function SetTargetUIType(type){
	currentTargetType = type;
	//Background
	$('#TargetHealthBarBackground').SetImage("file://{images}/custom_game/mmobar/hp_bar_" + type + ".png");
	
	//Health Bar
	$('#TargetHealthBar').style.width = offsets[type].imageWidth + "px";
	$('#TargetHealthBar').style.height = offsets[type].imageHeight + "px";
	
	//Colored Bar
	$('#TargetHealthBarColor').style.width = offsets[type].hpBarWidth + "px";
	$('#TargetHealthBarColor').style.height = offsets[type].hpBarHeight + "px";
	$('#TargetHealthBarColor').style.margin = "0px 0px " + offsets[type].hpBarOffsetBottom + "px " + offsets[type].hpBarOffsetLeft + "px";
	
	//Staggering Z-Indices
	$('#THBCContainer').style.zIndex = 999;
	$('#TargetHealthBarColor').style.zIndex = 999;
	$('#TargetHealthBarText').style.zIndex = 1000;
	//$('#TargetHealthBarBackground').style.zIndex = 997;
}

function SetTargetUIName(name){
	$('#TargetName').text = name; 
}  
function SetTargetUIHealth(unit){
	var health = Entities.GetHealth(unit);
	var max = Entities.GetMaxHealth(unit);
	//$.Msg("Health:" + health + "Max: " + max + "Unit:" + unit);
	$('#TargetHealthBarText').text = health + " / " + max;
	$('#TargetHealthBarColor').style.width = ((health / max) * offsets[currentTargetType].hpBarWidth) + "px";
}
function SetTargetUISubtext(text){
	$('#TargetAbilities').text = text;
}
 
 function GetTargetUnit()
{
	var mouseEntities = GameUI.FindScreenEntities( GameUI.GetCursorPosition() );
	var localHeroIndex = Players.GetPlayerHeroEntityIndex( Players.GetLocalPlayer() );
	mouseEntities = mouseEntities.filter( function(e) { return e.entityIndex !== localHeroIndex; } );
	for ( var e of mouseEntities )
	{
		if ( !e.accurateCollision ){
			continue;
		}
		return e.entityIndex; 
	}

	for ( var e of mouseEntities )
	{
		return e.entityIndex;
	}

	return 0;
}
 
function TargetUIPeriodic(){
	if(currentTargetType != "grandeur"){
		SetTargetUIType("grandeur");
	}
	var unit = GetTargetUnit();
	if(!unit){
		$('#TargetPanel').visible = false;
		$.Schedule(0.03, TargetUIPeriodic);
		return;
	}else{
		$('#TargetPanel').visible = true;
	}
	SetTargetUIName($.Localize(Entities.GetUnitName(unit)));
	//SetTargetUIName("hi");
	SetTargetUIHealth(unit);
	SetTargetUISubtext("DAMAGE: " + Math.ceil((Entities.GetDamageMin(unit) + Entities.GetDamageMax(unit)) / 2) + "    ARMOR : " + Math.ceil(Entities.GetArmorForDamageType(unit, 1)));
	$.Schedule(0.03, TargetUIPeriodic);
}
TargetUIPeriodic();
//END TARGET UI






//$.GetContextPanel().visible = false;
var lvlup = false;
var abilityIndex = 0;
function MakeAbilityPanel( abilityListPanel, ability, queryUnit )
{
	var abilityPanel = $.CreatePanel( "Panel", abilityListPanel, "Ability"+abilityIndex );
	abilityIndex += 1;
	abilityPanel.SetAttributeInt( "ability", ability );
	abilityPanel.SetAttributeInt( "queryUnit", queryUnit );
	abilityPanel.BLoadLayout( "file://{resources}/layout/custom_game/action_bar_ability.xml", false, false );
	return abilityPanel;  
}
//$.GetContextPanel().visible = false;
var abilities = [];
function UpdateAbilityList()
{
	var abilityListPanel = $( "#buttonsPanel" ); 
	if ( !abilityListPanel )
		return;
	abilities = [];
	abilityIndex = 0;
	abilityListPanel.RemoveAndDeleteChildren();
	 
	var queryUnit = Players.GetLocalPlayerPortraitUnit(); 
	
	for ( var i = 0; i < Entities.GetAbilityCount( queryUnit ); ++i )
	{
		var ability = Entities.GetAbility( queryUnit, i );
		if ( ability == -1 )
			continue;

		if ( !Abilities.IsDisplayedAbility(ability) )
			continue;
			
		if(Abilities.GetAbilityName(ability ) == "identify_item")
			continue;
		
		var p = MakeAbilityPanel( abilityListPanel, ability, queryUnit );
		p.SetAttributeString("lvlup", lvlup);
		abilities.push(p);
	}
}

var transition = function(percent){
	var green = (Math.ceil(percent*255)).toString(16)
	while(green.length < 2){
		green = "0" + green;
	}
	var red = (Math.ceil((1-percent)*255)).toString(16)
	while(red.length < 2){
		red = "0" + red;
	}
	return red+green+"00ff";
}

var transition2 = function(percent){
	var bit = (Math.ceil(percent*255)).toString(16);
	while(bit.length < 2){
		bit = "0" + bit;
	}
	return "#" + bit + bit + bit + "ff";
}

var LeftOrbFillPercent = function(pctInDecimal, unit){
	var raw = pctInDecimal;
	pctInDecimal = (1.0 - pctInDecimal) * 169;
	if(unit != null){
		$('#orbLeftText').text = Entities.GetHealth(unit);
		$('#orbLeftSmallText').text = Entities.GetHealthThinkRegen(unit);
		
		$('#orbLeftText').style.textShadow = "0px 0px 2px 1.0 #" + transition(raw);
	}
	$('#orbLeftFill').style.clip = "rect("+pctInDecimal+"px,300px,600px,0px)";
}

LeftOrbFillPercent(0.33);

var RightOrbFillPercent = function(pctInDecimal, unit){
	var raw = pctInDecimal;
	pctInDecimal = (1.0 - pctInDecimal) * 169;
	if(unit != null){
		$('#orbRightText').text = Math.ceil(Entities.GetMana(unit));
		$('#orbRightSmallText').text = Entities.GetManaThinkRegen(unit);
		
		$('#orbRightText').style.color = transition2(raw);// + transition(raw);
		$('#orbRightText').style.textShadow = "0px 0px 5px 1.0 #" + transition(raw);
	}
	$('#orbRightFill').style.clip = "rect("+pctInDecimal+"px,300px,600px,0px)";
}

 
RightOrbFillPercent(0.5);

var LeftOrbPeriodicFn = function(){
	LeftOrbFillPercent(Entities.GetHealthPercent(Players.GetLocalPlayerPortraitUnit()) / 100.0, Players.GetLocalPlayerPortraitUnit())
}

$.Every(0, 0, 0.03, LeftOrbPeriodicFn);

var RightOrbPeriodicFn = function(){	
	if(Entities.GetMaxMana(Players.GetLocalPlayerPortraitUnit()) > 0){
	RightOrbFillPercent(Entities.GetMana(Players.GetLocalPlayerPortraitUnit()) / Entities.GetMaxMana(Players.GetLocalPlayerPortraitUnit()), Players.GetLocalPlayerPortraitUnit())

	}else{
	RightOrbFillPercent(0, Players.GetLocalPlayerPortraitUnit())

	}
}
$.Every(0, 0, 0.05, RightOrbPeriodicFn);

var SetStatPointsRemaining = function(stats){
	if(stats > 0){
		$('#addSkillsButton').AddClass("addSkillsButtonAlive");
		$('#addSkillsButton').RemoveClass("addSkillsButtonDead");
		$('#addSkillsLabel').text = "+" + stats;
	}else{
		$('#addSkillsButton').RemoveClass("addSkillsButtonAlive");
		$('#addSkillsButton').AddClass("addSkillsButtonDead");
		$('#addSkillsLabel').text = "skl";
	}  
};

SetStatPointsRemaining(5); 
var addStatPoints = false;
(function(){
	$('#addSkillsButton').SetPanelEvent("onactivate", function(){
		if(Game.IsInAbilityLearnMode()){
			Game.EndAbilityLearnMode();
		}else{
			Game.EnterAbilityLearnMode();
		}
	});	
	
	$('#orbLeft').SetPanelEvent("onactivate", function(){
		
	});
})();

var ComputePanelAbsPosition = function(panel){
	var xy = {x: 0, y: 0};
	var cc = 0;
	while(panel.id != "CustomUIRoot" || cc > 30){
		xy.x += panel.actualxoffset;
		xy.y += panel.actualyoffset;
		panel = panel.GetParent();
		cc++;
	}
	xy.x *= (1920 / panel.contentwidth);
	xy.y *= (1080 / panel.contentheight);
	return xy;
}

var SetExpPercent = function(percentInDecimal){
	percentInDecimal *= 400;
	$('#expDone').style.width = percentInDecimal + "px";
	//$.Msg(ComputePanelAbsPosition($('#expDone'))); 
}  
SetExpPercent(0.5);

var ExpPeriodicFn = function(){  
	SetExpPercent(Players.GetLocalPlayerPortraitUnit());
	$.Schedule(0.03, ExpPeriodicFn);
} 
ExpPeriodicFn();
var SetLevel = function(lvl){

} 
SetLevel(55);
var GoldPeriodicFn = function(){
	$('#goldLabel').text = Players.GetGold(Game.GetLocalPlayerID());
	$.Schedule(0.03, GoldPeriodicFn);
}
GoldPeriodicFn();
var topItem = null;
//other ui stiff
function UpdateInventoryItem( itemSlot, item, queryUnit, parentPanel )
{
	var abilityPanel = $.CreatePanel( "Panel", parentPanel, "" );
	abilityPanel.SetAttributeInt( "itemSlot", itemSlot );
	abilityPanel.SetAttributeInt( "item", item );
	abilityPanel.SetAttributeInt( "queryUnit", queryUnit );
	abilityPanel.BLoadLayout( "file://{resources}/layout/custom_game/inventory_item.xml", false, false );
	topItem = abilityPanel;
} 
GameUI.SetRenderBottomInsetOverride(0);
function UpdateInventory()
{ 
	/*var stashPanel = $( "#stash_row" );
	if ( !stashPanel )
		return;*/

	var itemsPanel = $( "#itemsPanel" );
	if ( !itemsPanel )
		return; 
 
	// Brute-force recreate the entire inventory UI for now 
	itemsPanel.RemoveAndDeleteChildren(); 

	var queryUnit = Players.GetLocalPlayerPortraitUnit();
   
	// Currently hardcoded: first 6 are inventory, next 6 are stash items
	var DOTA_ITEM_STASH_MIN = 6;
	var DOTA_ITEM_STASH_MAX = 12;
	for ( var i = 0; i < 7; ++i )
	{
		var item = Entities.GetItemInSlot( queryUnit, i );
		if(item == -1) continue;
	
		if ( i >= DOTA_ITEM_STASH_MIN )
		{
			//UpdateInventoryItem( i, item, queryUnit, stashPanel );
		}
		else
		{
			UpdateInventoryItem( i, item, queryUnit, itemsPanel );
		}
	}
}
//$.GetContextPanel().visible = false;
function PollItemsForTop(){ 
	var i = 0;
	while(true){
		var x = $('#itemsPanel').GetChild(i);
		//$.Msg("1");
		if(!x) break;
		//$.Msg("2");
		if(x.GetAttributeInt("wantsRenderTop", 0) == 1){
			x.style.zIndex = "505";
			topItem.style.zIndex = "504";
			//$('#itemsPanel').MoveChildAfter(x, topItem);
			topItem = x;
			x.SetAttributeInt("wantsRenderTop", 0);
			//$.Msg("RENDER TOPPPP");
		}else{
			//$.Msg("ITEM : " + x.GetAttributeInt("item", -1));
		}
		i = i + 1;
	}
	$.Schedule(0.1, PollItemsForTop);
}
PollItemsForTop();

(function()
{
	GameEvents.Subscribe( "dota_inventory_changed", UpdateInventory );
	GameEvents.Subscribe( "dota_inventory_item_changed", UpdateInventory );
	GameEvents.Subscribe( "m_event_dota_inventory_changed_query_unit", UpdateInventory );
	GameEvents.Subscribe( "m_event_keybind_changed", UpdateInventory );
	GameEvents.Subscribe( "dota_player_update_selected_unit", UpdateInventory );
	GameEvents.Subscribe( "dota_player_update_query_unit", UpdateInventory );
	
	UpdateInventory(); // initial update
})();

(function()
{
	GameEvents.Subscribe( "dota_portrait_ability_layout_changed", UpdateAbilityList );
	GameEvents.Subscribe( "dota_player_update_selected_unit", UpdateAbilityList );
	GameEvents.Subscribe( "dota_player_update_query_unit", UpdateAbilityList );
	
	UpdateAbilityList(); // initial update
})();
