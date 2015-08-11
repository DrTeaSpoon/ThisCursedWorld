"use strict";
var fullScreenMode = $.GetContextPanel().GetAttributeInt("fullScreenMode", -1) != -1;
var ided = false;
var itemStats = null;
function UpdateItem()
{
	var item = $.GetContextPanel().GetAttributeInt( "item", -1 ); 
	var queryUnit = $.GetContextPanel().GetAttributeInt( "queryUnit", -1 );
	var itemName = Abilities.GetAbilityName( item );
	var hotkey = Abilities.GetKeybind( item, queryUnit );
	var chargeCount = 0;
	var hasCharges = false;
	var altChargeCount = 0;
	var hasAltCharges = false;
	
	if ( Items.ShowSecondaryCharges( item ) )
	{
		// Ward stacks display charges differently depending on their toggle state
		hasCharges = true;
		hasAltCharges = true;
		if ( Abilities.GetToggleState( item ) )
		{
			chargeCount = Items.GetCurrentCharges( item );
			altChargeCount = Items.GetSecondaryCharges( item );
		}
		else
		{
			altChargeCount = Items.GetCurrentCharges( item );
			chargeCount = Items.GetSecondaryCharges( item );
		}
	}
	else if ( Items.ShouldDisplayCharges( item ) )
	{
		hasCharges = true;
		chargeCount = Items.GetCurrentCharges( item );
	}

	$.GetContextPanel().SetHasClass( "show_charges", hasCharges );
	$.GetContextPanel().SetHasClass( "show_alt_charges", hasAltCharges );
	
	if(!Abilities.IsPassive(item) && !fullScreenMode){
		$("#Hotkey").visible = true;
		$( "#HotkeyText" ).text = hotkey;
	}else{
		$("#Hotkey").visible = false;
		$( "#HotkeyText" ).text = "1";
	}
	$("#Hotkey").style.margin = "-5px -5px -5px -5px";
	$( "#ItemImage" ).itemname = itemName;
	$( "#ItemImage" ).contextEntityIndex = item;
	$( "#ChargeCount" ).text = chargeCount;
	$( "#AltChargeCount" ).text = altChargeCount;
	
	if ( item == -1 || Abilities.IsCooldownReady( item ) )
	{
		$.GetContextPanel().SetHasClass( "cooldown_ready", true );
		$.GetContextPanel().SetHasClass( "in_cooldown", false );
	}
	else
	{
		$.GetContextPanel().SetHasClass( "cooldown_ready", false );
		$.GetContextPanel().SetHasClass( "in_cooldown", true );
		var cooldownLength = Abilities.GetCooldownLength( item );
		var cooldownRemaining = Abilities.GetCooldownTimeRemaining( item );
		var cooldownPercent = Math.ceil( 100 * cooldownRemaining / cooldownLength );
		$( "#CooldownTimer" ).text = Math.ceil( cooldownRemaining );
		$( "#CooldownOverlay" ).style.width = cooldownPercent+"%";
	}
	
	$.Schedule( 0.1, UpdateItem );
}

function ItemShowTooltip()
{
	var time1 = Game.Time();
	var item = $.GetContextPanel().GetAttributeInt( "item", -1 );
	var itemIndex = $.GetContextPanel().GetAttributeInt( "itemSlot", -1 );
	var queryUnit = $.GetContextPanel().GetAttributeInt( "queryUnit", -1 );
	var identified = ided;
	if ( item == -1 )
		return; 

	var itemName = Abilities.GetAbilityName( item );
	//$.Msg("SHOW!")
	var x = $.CreatePanel("Panel", $.GetContextPanel(), 'ItemTooltip');
	x.SetAttributeInt("item", item);
	x.SetAttributeInt("itemIndex", itemIndex);
	x.SetAttributeInt("ided", identified ? 1 : 0);
	x.data().stats = $.GetContextPanel().data().stats;
	x.data().ided = ided;
	x.SetAttributeInt("queryUnit", queryUnit);
	x.BLoadLayout( "file://{resources}/layout/custom_game/mmoui/inventory_tooltip.xml", false, false );
	//$('#ItemTooltip').style.width = "250px";
	//$('#ItemTooltip').style.height = "250px";
	//$('#ItemTooltip').AddClass("ItemTooltip");// = "-250px -250px -250px -250px";
	//$('#ItemTooltip').style.backgroundColor = "#ffffffff";
	x.hittest = false;
	//$.GetContextPanel().style.width = "500px"; 
	//$.GetContextPanel().style.height = "500px";
	//$.GetContextPanel().style.margin = "-221px -221px -222px -222px";
	//$.DispatchEvent( "DOTAShowAbilityTooltipForEntityIndex", $.GetContextPanel(), itemName, queryUnit );
	RenderTop();
}

function RenderTop(){
	//$.Msg("Render Top!");
	$.GetContextPanel().SetAttributeInt("wantsRenderTop", 1);
	//$.GetContextPanel().style = "z-index: 9999";
}

function ItemHideTooltip()
{ 
	//$.Msg("HIDE!")
	if($('#ItemTooltip')) $('#ItemTooltip').DeleteAsync(0);
	//$.DispatchEvent( "DOTAHideAbilityTooltip", $.GetContextPanel() );
}

function ActivateItem()
{
	$.Msg("Item Activate!");
	if(fullScreenMode) return false;
	var item = $.GetContextPanel().GetAttributeInt( "item", -1 );
	var queryUnit = $.GetContextPanel().GetAttributeInt( "queryUnit", -1 );
	if ( item == -1 )
		return;

	// Items are abilities - just execute the ability
	Abilities.ExecuteAbility( item, queryUnit, false );
}

function DoubleClickItem()
{
	$.Msg("Double Click");
	if(fullScreenMode) return false;
	var item = $.GetContextPanel().GetAttributeInt( "item", -1 );
	var queryUnit = $.GetContextPanel().GetAttributeInt( "queryUnit", -1 );
	if ( item == -1 )
		return;

	// Items are abilities
	Abilities.CreateDoubleTapCastOrder( item, queryUnit );
}

function RightClickItem()
{
	//if(fullScreenMode) return;
	// Not yet!
	//$.Msg( "Context menu not implemented." );
	
	var ind = $.GetContextPanel().GetAttributeInt( "itemSlot", -1 );
	var ind2 = $.GetContextPanel().GetAttributeInt( "item", -1 );
	GameEvents.SendCustomGameEventToServer("mmoui_identify_item", {player:Game.GetLocalPlayerID(), item:ind2, itemIndex:ind});
}

function OnDragEnter( a, draggedPanel )
{
	if(fullScreenMode) return;
	var item = $.GetContextPanel().GetAttributeInt( "item", -1 );
	var draggedItem = draggedPanel.GetAttributeInt( "drag_item", -1 );

	// only care about dragged items other than us
	if ( draggedItem == -1 || draggedItem == item )
		return true;

	// highlight this panel as a drop target
	$.GetContextPanel().AddClass( "potential_drop_target" );
	return true;
}

function OnDragDrop( panelId, draggedPanel )
{
	if(fullScreenMode) return;
	var item = $.GetContextPanel().GetAttributeInt( "item", -1 );
	var thisSlot = $.GetContextPanel().GetAttributeInt( "itemSlot", -1 );
	var draggedItem = draggedPanel.GetAttributeInt( "drag_item", -1 );
	
	// only care about dragged items other than us
	if ( draggedItem == -1 || ( draggedItem == item ) )
		return true;

	// executing a slot swap - don't drop on the world
	draggedPanel.SetAttributeInt( "drag_completed", 1 );

	// create the order
	var moveItemOrder =
	{
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_MOVE_ITEM,
		TargetIndex: thisSlot,
		AbilityIndex: draggedItem
	};
	Game.PrepareUnitOrders( moveItemOrder );
	return true;
}

function OnDragLeave( panelId, draggedPanel )
{
	if(fullScreenMode) return;
	var item = $.GetContextPanel().GetAttributeInt( "item", -1 );
	var draggedItem = draggedPanel.GetAttributeInt( "drag_item", -1 );
	if ( draggedItem == -1 || draggedItem == item )
		return false;

	// un-highlight this panel
	$.GetContextPanel().RemoveClass( "potential_drop_target" );
	return true;
}

function OnDragStart( panelId, dragCallbacks )
{
	if(fullScreenMode) return;
	var item = $.GetContextPanel().GetAttributeInt( "item", -1 );
	var itemName = Abilities.GetAbilityName( item );

	ItemHideTooltip(); // tooltip gets in the way

	// create a temp panel that will be dragged around
	var displayPanel = $.CreatePanel( "DOTAItemImage", $.GetContextPanel(), "dragImage" );
	displayPanel.itemname = itemName;
	displayPanel.contextEntityIndex = item;
	displayPanel.SetAttributeInt( "drag_item", item );
	displayPanel.SetAttributeInt( "drag_completed", 0 ); // determines whether the drag was successful

	// hook up the display panel, and specify the panel offset from the cursor
	dragCallbacks.displayPanel = displayPanel;
	dragCallbacks.offsetX = 0;
	dragCallbacks.offsetY = 0;
	
	// grey out the source panel while dragging
	$.GetContextPanel().AddClass( "dragging_from" );
	return true;
}

function OnDragEnd( panelId, draggedPanel )
{
	if(fullScreenMode) return;
	var item = $.GetContextPanel().GetAttributeInt( "item", -1 );
	var queryUnit = $.GetContextPanel().GetAttributeInt( "queryUnit", -1 );

	// if the drag didn't already complete, then try dropping in the world
	if ( !draggedPanel.GetAttributeInt( "drag_completed", 0 ) )
	{
		Game.DropItemAtCursor( queryUnit, item );
	}

	// kill the display panel
	draggedPanel.DeleteAsync( 0 );

	// restore our look
	$.GetContextPanel().RemoveClass( "dragging_from" );
	return true;
}
function OnItemUnidentified()
{
	$.GetContextPanel().SetAttributeInt("ided", 0);
	$('#UnidImage').visible = false
	if($('#ItemTooltip')){
		ItemHideTooltip();
		$.Schedule(0.05, function()
			{
				ItemShowTooltip();
			});
	}
}

function onAbilSpecial(keys)
{
	if(keys.player != Game.GetLocalPlayerID()){
		return;
	}
	var index = keys.itemIndex;

	if(index != $.GetContextPanel().GetAttributeInt( "itemSlot", -1 )){
		return;
	}
	if(keys.ided !== null && keys.ided === 0){
		$('#UnidImage').visible = true;
		ided = false;
	}else if(keys.ided !== null){
		if(!ided){
			OnItemUnidentified();
		}
		$('#UnidImage').visible = false;
		ided = true;
	}
}

function RenderAbilitySpecial(stats, id){
	ided=id;
	itemStats=stats;
}

function onIdentifyItem(keys)
{

	if(keys.player != Game.GetLocalPlayerID()){
		return;
	} 
	var index = keys.item

	if(index != $.GetContextPanel().GetAttributeInt( "item", -1 )){ 
		return;
	}
	if(keys.ided !== null && keys.ided === false){
		ided = false;
	}else if(keys.ided !== null){
		if(!ided){
			OnItemUnidentified();
		}
		ided = true;
	}	
	$.GetContextPanel().data().ided = ided
}
var highlight = false;
$.GetContextPanel().data().Highlight = function(){
	highlight = !highlight;
	$.Msg("Highlight Toggle : " + highlight);
	$('#HighlightImage').visible = highlight;
	$('#BorderImage').visible = !highlight;
	
};
$.GetContextPanel().data().IsHighlighted = function(){
	return highlight;

};
(function()
{
	// Drag and drop handlers ( also requires 'draggable="true"' in your XML, or calling panel.SetDraggable(true) )
	if(!fullScreenMode){
		$.RegisterEventHandler( 'DragEnter', $.GetContextPanel(), OnDragEnter );
		$.RegisterEventHandler( 'DragDrop', $.GetContextPanel(), OnDragDrop );
		$.RegisterEventHandler( 'DragLeave', $.GetContextPanel(), OnDragLeave );
		$.RegisterEventHandler( 'DragStart', $.GetContextPanel(), OnDragStart );
		$.RegisterEventHandler( 'DragEnd', $.GetContextPanel(), OnDragEnd );
		$('#ItemButton').SetPanelEvent("onactivate", function(){ActivateItem()});
		$('#ItemButton').SetPanelEvent("ondblclick", function(){DoubleClickItem()});
	}else{
		$.GetContextPanel().style.width = "64px";
		$.GetContextPanel().style.height = "64px";
		$.GetContextPanel().style.verticalAlign = "center";
		$.GetContextPanel().style.horizontalAlign = "center";
		$.GetContextPanel().style.marginLeft = "2px";
	}
		$('#ItemButton').SetPanelEvent("oncontextmenu", function(){RightClickItem()});
	$('#ItemButton').SetPanelEvent("onmouseover", ItemShowTooltip);
	$('#ItemButton').SetPanelEvent("onmouseout", ItemHideTooltip);
	GameEvents.Subscribe("mmoui_on_item_identified", onIdentifyItem);
	if($.GetContextPanel().data().stats){
		RenderAbilitySpecial($.GetContextPanel().data().stats, $.GetContextPanel().data().ided);
		ided = $.GetContextPanel().data().ided;
		$('#UnidImage').visible = !$.GetContextPanel().data().ided;
	}else{
		var itemIndex = $.GetContextPanel().GetAttributeInt( "itemSlot", -1 ); 
		var item = $.GetContextPanel().GetAttributeInt( "item", -1 ); 
		var t = {player:Game.GetLocalPlayerID(), item:item, itemIndex:itemIndex}
		GameEvents.SendCustomGameEventToServer("mmoui_get_abil_special", t );
		GameEvents.Subscribe("mmoui_return_abil_special", onAbilSpecial);
	$('#UnidImage').visible = false
	}
	UpdateItem(); // initial update of dynamic state
	$.GetContextPanel().data().ided = ided
})();
