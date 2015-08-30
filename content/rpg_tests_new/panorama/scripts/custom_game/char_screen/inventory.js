var maxInventory = 90;
var maxCharms = 24;
var maxCharmRows = 6;
var maxInventoryRows = 6; 
var equipmentArray = ["Helm", "Shoulders", "Chest", "Gloves", "Pants", "Necklace", "RingLeft", "RingRight", "Belt",  "Boots", "WeaponLeft", "SoulLeft", "WeaponRight", "SoulRight"];
var controlsArray = [];
var allEquipmentPanels = [];
var allInventoryPanels = [];
var allCharmPanels = [];
var allCharms = [];
var allEquipmentItems = [];
var allInventoryItems = [];
var selectedPanel = 0;
var ItemTable = null;

var ADD_ITEM_EVENT = "custom_inventory_on_item_pickup" //l->p
var SEND_ITEM_TABLE_EVENT = "send_item_table" //l->p
var REQUEST_ITEM_TABLE_EVENT = "request_item_table" //l->p

var REQUEST_DROP_ITEM_EVENT = "custom_inventory_on_request_item_drop" //l-p
var DROP_ITEM_EVENT = "custom_inventory_on_item_drop" //p-l    

var ITEM_CHANGE_SLOT_EVENT = "custom_inventory_on_item_change_position" //l-p

var REQEUST_EQUIP_ITEM_EVENT = "custom_inventory_on_request_item_equip" //l-p
var EQUIP_ITEM_EVENT = "custom_inventory_on_item_equip" //p-l

var REQEUST_UNEQUIP_ITEM_EVENT = "custom_inventory_on_request_item_unequip" //l-p
var UNEQUIP_ITEM_EVENT = "custom_inventory_on_item_unequip" //p-l
var REQUEST_FULL_UPDATE = "custom_inventory_on_request_full_update" //p-l
var SEND_FULL_UPDATE = "custom_inventory_on_full_update" //l-p
var ITEM_CHANGE_SLOT_EVENT = "custom_inventory_on_item_change_position" //L-P

	for(var i = 1; i <= maxCharmRows; i++){
		$('#CharmRow'+i).AddClass("CharmRow");
	}
	for(var i = 1; i <= maxInventoryRows; i++){
		$('#InventoryRow'+i).AddClass("InventoryRow");
	}
	for(var i = 1; i <= maxInventory; i++){ 
		var x = $('#Inventory'+i);
		x.AddClass("InventoryItem"); 
		x.slotId = i;  
		x.item = null;     
		x.itemPanel = null;   
		(function(i, x){ 
			x.SetPanelEvent("onactivate", function(){
				if(selectedPanel && selectedPanel.panel != x){
					if(selectedPanel.type == "inventory"){
						SwitchInventoryPanels(selectedPanel.panel, x)
					}else if(selectedPanel.type == "charm"){
						//CHARM SWITCH
					}else{ 
						//EQ SWITCH
					}
					selectedPanel = null
				}else if(x.item){
					x.itemPanel.data().Highlight();
					if(!x.itemPanel.data().IsHighlighted()){
						EquipItem(i);
						selectedPanel = null;
					}else{
						selectedPanel = {type: "inventory", panel: x}
					}
				}
			}); 
		})(i,x);
		allInventoryPanels.push(x);
	}
	for(var i = 1; i <= maxCharms; i++){
		var x = $('#Charm'+i);
		x.AddClass("Charm");
		x.slotId = 1000 + i
		x.item = null;
		x.itemPanel = null;
		x.SetPanelEvent("onactivate", function(){
		
		
				$.Msg("On Activate : " + x.slotId);
		});
		allCharmPanels.push(x);
	};
	for(x in equipmentArray){
		var y = $('#'+equipmentArray[x]);
		y.slotId = 10000 + x //assigning a huge slotId so the LUA knows where to send data
		y.slotName = equipmentArray[x]
		y.AddClass("Equipment");
		y.item = null;
		y.itemPanel = null;
		(function(y){
			y.SetPanelEvent("onactivate", function(){
				$.Msg("On Activate : #" + y.slotName);
				if(selectedPanel){
					if(selectedPanel.panel == y){
						selectedPanel = null; 
						UnequipItem(y.slotName);
						if(y.itemPanel){
							y.itemPanel.data().Highlight();
						}
					}else if(selectedPanel.type == "inventory"){
						UnequipItem(y.slotName, selectedPanel.slot);
					}else{
					
					}
				}else{
					y.itemPanel.data().Highlight();
					selectedPanel = {type: "equipment", slot: y.slotName, panel: y};
				}
			});
		}(y));
		allEquipmentPanels.push(y);
	}

function GenerateItem(parent,ided,stats){
	var abilityPanel = $.CreatePanel( "Panel", parent, "" );
	abilityPanel.SetAttributeInt( "itemSlot", parent.slotId );
	abilityPanel.SetAttributeInt( "item", parent.item );
	abilityPanel.SetAttributeInt( "queryUnit", Players.GetLocalPlayerPortraitUnit());
	abilityPanel.SetAttributeInt( "fullScreenMode", 1);
	abilityPanel.data().ided = ided;
	abilityPanel.data().stats = stats;
	abilityPanel.BLoadLayout( "file://{resources}/layout/custom_game/inventory_item.xml", false, false );
	parent.itemPanel = abilityPanel;
}
 
function ClearItem(parent){
	parent.itemPanel = null;
	parent.RemoveAndDeleteChildren();
}

var selectedPanel = null;

function SwitchInventoryPanels(panelA, panelB){
	if(!panelA.item){
		panelB.ided = panelB.itemPanel.data().ided;
		
		panelA.item = panelB.item; 
		panelA.ided = panelB.ided;
		panelA.stats = panelB.stats;
		panelB.item = null;
		panelB.ided = null;
		panelB.stats = null;
		
		ClearItem(panelB);
		GenerateItem(panelA, panelA.ided, panelA.stats);
		var t = {player:Game.GetLocalPlayerID(), item:panelA.item, slot:panelA.slotId}
		GameEvents.SendCustomGameEventToServer(ITEM_CHANGE_SLOT_EVENT, t );
	}else if(!panelB.item){
		panelA.ided = panelA.itemPanel.data().ided;
		
		panelB.item = panelA.item;
		panelB.ided = panelA.ided;
		panelB.stats = panelA.stats;
		panelA.item = null;
		panelA.ided = null; 
		panelA.stats = null;
		
		ClearItem(panelA);
		GenerateItem(panelB, panelB.ided, panelB.stats);
		var t = {player:Game.GetLocalPlayerID(), item:panelB.item, slot:panelB.slotId}
		GameEvents.SendCustomGameEventToServer(ITEM_CHANGE_SLOT_EVENT, t );
	}else{
		panelA.ided = panelA.itemPanel.data().ided;
		panelB.ided = panelB.itemPanel.data().ided;
		
		var tempItem = panelA.item;  
		var tempIded = panelA.ided;
		var tempStats = panelA.stats;     
	
		ClearItem(panelA); //selected = old equipment  
		ClearItem(panelB); //panel = new   
		   
		panelA.item = panelB.item;       
		panelA.ided = panelB.ided;       
		panelA.stats = panelB.stats;                   
		panelB.item = tempItem;   
		panelB.ided = tempIded;  
		panelB.stats = tempStats;
		
		GenerateItem(panelA,panelA.ided, panelA.stats);
		GenerateItem(panelB,panelB.ided, panelB.stats);
		$.Msg("SWITCH A B : " + panelA.ided + panelB.ided);
		
		var t = {player:Game.GetLocalPlayerID(), item:panelA.item, slot:panelA.slotId}
		GameEvents.SendCustomGameEventToServer(ITEM_CHANGE_SLOT_EVENT, t );
		var t = {player:Game.GetLocalPlayerID(), item:panelB.item, slot:panelB.slotId}
		GameEvents.SendCustomGameEventToServer(ITEM_CHANGE_SLOT_EVENT, t );
	}
	
}

/*Unequips the equipment item in *slot*. Optionally, specify "toSlot" to swap to a specified inventory slot / equip the item at toSlot */
function UnequipItem(slot, toSlot){ 
	$.Msg("UNEQUIPUFNDSAJFNSPDFIASDF");
	var equipmentPanel = $('#'+slot); //Equipment panel
	$.Msg("Unequip Item " + slot);

	if(toSlot){ //Not double clicked - click eq than click something else
		var toPanel = $('#Inventory'+toSlot); //The inventory item
		if(!toPanel){
			toPanel = $('#'+toSlot);
			if(toPanel){ //Switch Mainhand/Offhand
				//TODO: Switching Mainhand/Offhand Items
				$.Msg("Not Yet Implemented");
				return;
			}else{ //Charms?
				//TODO: Some sort of error message to show that you cant do this
				return;
			}
		}else{ //Equipment to Inventory
			var inventoryPanel = toPanel;
			
			if(toPanel.item){ //Clicking on an item in the inventory
				//TODO: Swap Item To Equipment
			}else{ //Clicking on an empty slot
			
				var eventData = {player:Game.GetLocalPlayerID(), item:equipmentPanel.item, toSlot: toSlot}
				GameEvents.SendCustomGameEventToServer(UNEQUIP_ITEM_EVENT, eventData );
				
				inventoryPanel.item = equipmentPanel.item;
				inventoryPanel.ided = equipmentPanel.ided;
				inventoryPanel.stats = equipmentPanel.stats;
				GenerateItem(inventoryPanel,inventoryPanel.ided,inventoryPanel.stats);
				ClearItem(equipmentPanel);
				
			}
		}
	}else{ //Double clicked equipment - automatically find a slot
		for(var i = 1; i <= maxInventory; i++){ //Loop over every slot
			var inventoryPanel = $('#Inventory'+i); //Grab panel 'i'
			if(!inventoryPanel.item){ //If the item doesn't exist on the panel, put it there!
				
				var eventData = {player:Game.GetLocalPlayerID(), item:equipmentPanel.item, toSlot: i}
				GameEvents.SendCustomGameEventToServer(UNEQUIP_ITEM_EVENT, eventData );
				
				inventoryPanel.item = equipmentPanel.item;
				inventoryPanel.ided = equipmentPanel.ided;
				inventoryPanel.stats = equipmentPanel.stats;
				GenerateItem(inventoryPanel,inventoryPanel.ided,inventoryPanel.stats);
				FullClearItem(equipmentPanel);
				
				return;
			}
		}
	}
}

function CheckItemRequirements(item){
	return true;
}

function CheckWeaponCompatibility(mainhand, offhand){
	if(mainhand.requirements.slot.toLowerCase() == "weapon twohand"){
		$.Msg("NOT COMPATIBLE NOT COMPATIBLE");
		return false;
	}
	$.Msg("SLOT : " + mainhand.requirements.slot.toLowerCase());
	return true;
}
function CheckSoulCompatibility(weapon, soul){
	return true;
}

function EquipItem(inventorySlot, equipmentSlot){
	var itemPanel = $('#Inventory'+inventorySlot);
	var itemEntIndex = itemPanel.item
	if(!itemEntIndex) return;
	var item = itemPanel.stats;
	if(!item) return;
	//if(!itemPanel.ided) return;
	var slot = item.requirements.slot;
	$.Msg("SLOT : " + slot);
	if(!slot) return;
	var targetSlot = equipmentSlot;
	var needsToUnequip = []; 
	if(slot.toLowerCase() == "ring"){
	 if(targetSlot){
		 if(targetSlot.toLowerCase() == "ringleft" || targetSlot.toLowerCase() == "ringright"){
			 
		 }else{
			 return;
		 }
	 }else{
		 if(!$('#RingLeft').item){
			targetSlot = "RingLeft";
		 }else if(!$('#RingRight').item){
			targetSlot = "RingRight";
		 }else{
			targetSlot = "RingLeft";
		 }
	 }
	}else if(slot.toLowerCase() == "weapon"){
		if(targetSlot){
			if(targetSlot.toLowerCase() == "weaponleft" || targetSlot.toLowerCase() == "weaponright"){
				
			}else{
				return;
			}
		}else{
			targetSlot = "weaponleft";
		}
		if(targetSlot.toLowerCase() == "weaponleft"){
			targetSlot = "WeaponLeft";
			var offhand = $('#WeaponRight').stats;
			if(offhand && !CheckWeaponCompatibility(item, offhand)){
				needsToUnequip.push('WeaponRight');
			}
			
			var mainhandSoul = $('#SoulLeft').stats;
			if(mainhandSoul && !CheckSoulCompatibility(item, mainhandSoul)){
				needsToUnequip.push('SoulLeft');
			}
		}else{
			targetSlot = "WeaponRight";
			var mainhand = $('#WeaponLeft').stats;
			if(mainhand && !CheckWeaponCompatibility(item, mainhand)){
				needsToUnequip.push('WeaponLeft');
			}
			
			var offhandSoul = $('#SoulLeft').stats;
			if(offhandSoul && !CheckSoulCompatibility(item, offhandSoul)){
				needsToUnequip.push('SoulLeft');
			}
		}
	}else if(slot.toLowerCase() == "weapon offhand"){
		if(targetSlot){
			if(targetSlot.toLowerCase() == "weaponright"){
				
			}else{
				return;
			}
		}else{
			targetSlot = "WeaponRight";
		}
		
		var mainhand = $('#WeaponLeft').stats;
		if(mainhand && !CheckWeaponCompatibility(item, mainhand)){
			needsToUnequip.push('WeaponLeft');
		}
		
		var offhandSoul = $('#SoulLeft').stats;
		if(offhandSoul && !CheckSoulCompatibility(item, offhandSoul)){
			needsToUnequip.push('SoulLeft');
		}
		targetSlot = "WeaponRight";
	}else if(slot.toLowerCase() == "weapon twohand" || slot.toLowerCase() == "weapon mainhand"){
		if(targetSlot){
			if(targetSlot.toLowerCase() == "weaponleft"){
				
			}else{
				return;
			}
		}else{
			targetSlot = "WeaponLeft";
		}
		
		var offhand = $('#WeaponRight').stats;
		if(offhand && !CheckWeaponCompatibility(item, offhand)){
			needsToUnequip.push('WeaponRight');
		}
		
		var mainhandSoul = $('#SoulLeft').stats;
		if(mainhandSoul && !CheckSoulCompatibility(item, mainhandSoul)){
			needsToUnequip.push('SoulLeft');
		}
		
		targetSlot = "WeaponLeft";
	}else if(slot.toLowerCase() == "soul"){
		if(targetSlot){
			if(targetSlot.toLowerCase() == "soulleft" || targetSlot.toLowerCase() == "soulright"){
				
			}else{
				return;
			}
		}else{
			targetSlot = "SoulLeft";
		}
		
		var corWeapon;
		if(targetSlot.toLowerCase() == "soulleft"){
			corWeapon = $('#WeaponLeft').stats;
		}else{
			corWeapon = $('#WeaponRight').stats;
		}
		if(!CheckSoulCompatibility(corWeapon, item)){
			return;
		}
		
	}else if(slot.toLowerCase() == "soul offhand"){
		if(targetSlot){
			if(targetSlot.toLowerCase() == "soulright"){
				
			}else{
				return;
			}
		}else{
			targetSlot = "SoulRight";
		}
		if(!CheckSoulCompatibility($('#WeaponRight').stats, item)){
			return;
		}
	}else if(slot.toLowerCase() == "soul twohand"){
		if(targetSlot){
			if(targetSlot.toLowerCase() == "soulleft"){
				if(!$('#WeaponLeft').stats.requirements.slot == "weapon twohand"){
					return;
				}
			}else{
				return;
			}
		}else{
			targetSlot = "SoulLeft"; 
		}
		if(!CheckSoulCompatibility($('#WeaponLeft').stats, item)){
			return;
		}
	}else if(slot.toLowerCase() == "soul mainhand"){
		if(targetSlot){
			if(targetSlot.toLowerCase() == "soulleft"){
				
			}else{
				return;
			}
		}else{
			targetSlot = "SoulLeft";
		}
		if(!CheckSoulCompatibility($('#WeaponLeft').stats, item)){
			return; 
		}
    }else{ 
		if(!targetSlot){ 
			targetSlot = slot;
		}else{
			if(targetSlot != slot){
				return;
			}
		}
	}
	
	if(!CheckItemRequirements(item)){
	//	return;
	}
	FullClearItem(itemPanel);
	if(targetSlot == "Head") targetSlot = "Helm";
	if(targetSlot == "Legs") targetSlot = "Pants";
	if(targetSlot == "Feet") targetSlot = "Boots";
	
	for(var x in needsToUnequip){
		UnequipItem(needsToUnequip[x]);
	}
	$.Msg("Target Slot: " + targetSlot);
	if($('#'+targetSlot).item){ 
		UnequipItem(targetSlot);
	}
	var panel = $('#'+targetSlot);
	panel.item = itemEntIndex;
	panel.ided = true;
	panel.stats =  item;
	GenerateItem(panel,true,item);

	var t = {player:Game.GetLocalPlayerID(), item:panel.item, targetSlot: targetSlot}
	GameEvents.SendCustomGameEventToServer(EQUIP_ITEM_EVENT, t );
	
	//TODO: Apply bonuses
}

function AddItemToInventory(item, slot, ided, stats){  
	var panel = null;
	if(ided !== null && stats){ //Adding Item From LUA
		panel = $('#Inventory' + slot);
		
		if(!panel){
			$.Msg("Your Inventory is Full");
			return;
		}
		ClearItem(panel); 
		panel.item = item;
		panel.ided = ided;
		panel.stats = stats;
		GenerateItem(panel,ided,stats);
		return;
	}
	/*else if(slot && selectedPanel && selectedPanel.item && selectedPanel.item == item){ //I dont fucking know
		panel = $('#Inventory'+slot);
		if(panel.item){
			//if(GetItemSlot(panel.item) != GetItemSlot(selectedPanel.item)){
			//	$.Msg("Item Slots Incompatible");
			//	return;
			//}
			//if(!CanEquipItem(panel.item, slot)){
			//	$.Msg("Can't Equip Item");
			//	return;
			//}
			var tempItem = selectedPanel.item;
			
			var t = {player:Game.GetLocalPlayerID(), item:selectedPanel.item}
			GameEvents.SendCustomGameEventToServer(UNEQUIP_ITEM_EVENT, t );
			t = {player:Game.GetLocalPlayerID(), item:panel.item}
			GameEvents.SendCustomGameEventToServer(EQUIP_ITEM_EVENT, t );
			
			ClearItem(selectedPanel); //selected = old equipment
			ClearItem(panel); //panel = new 
			
			selectedPanel.item = panel.item;
			panel.item = selectedPanel.item;
			
			GenerateItem(selectedPanel);
			GenerateItem(panel);
			return;
		}else{
			var t = {player:Game.GetLocalPlayerID(), item:selectedPanel.item}
			GameEvents.SendCustomGameEventToServer(UNEQUIP_ITEM_EVENT, t );
			
			ClearItem(selectedPanel);
			
			panel.item = selectedPanel.item;
			
			GenerateItem(panel);
			$.Msg("Equipment to Inventory Successful");
			return;
		}
	}else{
		for(var y in allInventoryPanels){
			if(!allInventoryPanels[y].item){
				panel = allInventoryPanels[y];
				slot = y;
				break;
			}
		}
		if(!panel){
			$.Msg("Your Inventory is Full");
			return;
		}
		panel.item = item;
		GenerateItem(panel);
		return;
	}*/
}

function CanEquipItem(item, slot){
	var itemTbl = ItemTable[Abilities.GetAbilityName(item)]
	if(slot && slot != "inventory"){
		if(itemTbl.Slot != slot){
			return false;
		}
	}
	return Players.GetLevel(Players.GetLocalPlayer()) >= itemTbl.RequiredLevel && true; //check for class requirement
}

function GetItemSlot(item){
	return ItemTable[Abilities.GetAbilityName(item)].Slot;
}

function GetParentPanel(item){
	for(var x in allInventoryPanels){
		if(allInventoryPanels[x].item == item){
			return allInventoryPanels[x];
		}
	}
}

function AddItemToEquipment(item, slot, invBypass){
	var itemTable = ItemTable[Abilities.GetAbilityName(item)];
	var itemSlot = itemTable.Slot;
	var parentPanel = GetParentPanel(item);
	
	if(!slot) slot = itemSlot;
	
	var target = $('#' + slot);
	if(CanEquipItem(item, slot)){
		var hasTargetItem = target.item;
		if(hasTargetItem){
			UnequipItem(slot, parentPanel);
		}
		
		target.item = item;
		ClearItem(target);
		GenerateItem(target);
		
		var t = {player:Game.GetLocalPlayerID(), item:item};
		GameEvents.SendCustomGameEventToServer(EQUIP_ITEM_EVENT, t);
		$.Msg("Item Equip Successful");
		
	}else{
		$.Msg("CANT EQUIP ITEM");
		return;
	}
}
function AddItemToCharms(itemTable, slot){

}
function DeleteInventoryItem(slot){ 

}
function DeleteCharm(slot){

}

function OnRecieveItemTable(keys){
	ItemTable = keys.itemTable
}

function FullClearItem(item){
	ClearItem(item);
	item.item = null;
	item.ided = null;
	item.stats = null;
}

function FullClearArray(arr){
	for(var x in arr){
		if(arr[x].item){
			ClearItem(arr[x]);
			arr[x].item = null;
			arr[x].ided = null;
			arr[x].stats = null;
		} 
	} 
} 
	 

function OnRecieveFullUpdate(keys){ 
	$.Msg("Full Update");
	var equipment = keys.equipment
	var charms = keys.charms
	var items = keys.inventory
	
	FullClearArray(allEquipmentPanels);
	FullClearArray(allInventoryPanels); 
	FullClearArray(allCharmPanels); 
	
	allCharms = [];
	allEquipmentItems = [];  
    allInventoryItems = []; 
	
	for(var x in equipment){  
		AddItemToInventory(equipment[x].entIndex, 1, true, equipment[x].stats);
		EquipItem(1);
	}
	
	for(var x in items){
	$.Msg("Item"+ items[x].entIndex);
		AddItemToInventory(items[x].entIndex, items[x].slot, items[x].ided, items[x].stats);
	}
	
}

function OnItemPickup(keys){ 
	if(keys.player != Game.GetLocalPlayerID()) return;
	var item = keys.item;
	AddItemToInventory(item,keys.slot,keys.ided,keys.stats); 
}
(function(){ 
	GameEvents.Subscribe(ADD_ITEM_EVENT, OnItemPickup);
	GameEvents.Subscribe(SEND_ITEM_TABLE_EVENT, OnRecieveItemTable);
	GameEvents.Subscribe(SEND_FULL_UPDATE, OnRecieveFullUpdate);
	$.Schedule(0.66 * Game.GetLocalPlayerID(), function(){
		if(!ItemTable){
			GameEvents.SendCustomGameEventToServer(REQUEST_ITEM_TABLE_EVENT, {} );
		}
	});
	var t = {player:Game.GetLocalPlayerID()}
	//if(!itemStats){
		GameEvents.SendCustomGameEventToServer(REQUEST_FULL_UPDATE, t );
	//}
}());