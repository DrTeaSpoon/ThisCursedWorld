"use strict";
var itemName;
var itemDescription;
var item;
var hasAbilSpecial = false;
var ided = 0;
var itemStats = null;

function GetColor(color){
	color = Items.GetItemColor(color);
	if(color == -16732885){ //green
		return "00aa00";
	}else if(color == -126533){ //purple
		return "753adb";
	}else if(color == -16736538){ //orange
		return "ffa500";
	}else if(color == -161510){ //blue
		return "3131fd";
	}else{
		return "dddddd";
	}
}

function RecievedAbilSpecial(abilSpecial, cust)
{
	if(!abilSpecial){
		hasAbilSpecial = true;
		return;
	}
	if(ided == 0){ //isUnid'd
		hasAbilSpecial = true;
		return;
	}
	//$.GetContextPanel().style.height = "fit-children";
	var spc = $('#AbilSpecial');
	var lvl = Abilities.GetLevel(item);
	spc.RemoveAndDeleteChildren();
	//abilSpecial.sort();
	var i = 1;
	while(true){
		var x = "0" + i;
		if(!abilSpecial[x]) break;
		for(var y in abilSpecial[x]){
			if(y != "var_type"){
				var tby = $.CreatePanel('Label', spc, '');
				tby.AddClass("abilSpecial");
				tby.html = true;
				tby.style.marginLeft = "10px";
				var txt = $.Localize("DOTA_Tooltip_ability_" + itemName + "_" + y);
				if(txt == "DOTA_Tooltip_ability_" + itemName + "_" + y) break;
				var hasCent = false;
				var hasPlus = false;
				if(txt.substring(0,1) == "%"){
					hasCent = true;
					txt = txt.substring(1, txt.length);
				}
				if(txt.substring(0,2) == "+$"){
					hasPlus = true;
					//txt = $.Localize("DOTA_SHOP_TAG_" + txt.substring(2, txt.length).toUpperCase());
					txt = $.Localize("dota_ability_variable_" + txt.substring(2, txt.length));
				}
				var ib = 1;
				var hasLvl = false;
				if(typeof abilSpecial[x][y] == "string"){
					var procTxt = abilSpecial[x][y];
					var b = (""+procTxt).indexOf(" ");
					var nueTxt = "<font color='434931ff'>";
					while(b >= 0){
						hasLvl = true;
						
						if(lvl == ib){
							nueTxt = nueTxt + (ib != 1 ? "/" : "") + "</font><font color='#ffff44ff'>" + procTxt.substring(0,b)+"</font><font color='434931ff'>";
						}else{
							nueTxt = nueTxt + (ib != 1 ? "/" : "") + procTxt.substring(0,b) 
						}	
						ib = ib + 1;
						procTxt = procTxt.substring(b+1, procTxt.length);
						b = procTxt.indexOf(" ");
						if(ib > 30) break;
						if(procTxt.length <= 0) break;
					}
					if(hasLvl){
						if(lvl == ib){
							nueTxt = nueTxt + (ib != 1 ? "/" : "") + "</font><font color='#ffff44ff'>" + procTxt+"</font><font color='434931ff'>";
						}else{
							nueTxt = nueTxt + "/" + procTxt 
						}	
					}
				}
				
				
				if(!hasLvl){
					if(hasPlus){
						tby.text = "    + <font color='#ffff44ff'>" + abilSpecial[x][y] + "</font> " + txt;
					}else if(hasCent){
						tby.text = "    " + txt + " <font color='#ffff44ff'>" + abilSpecial[x][y] + "%</font>";
					}else{
						tby.text = "    " + txt + " <font color='#ffff44ff'>" + abilSpecial[x][y] + "</font>";
					}
				}else{
					if(hasPlus){
						tby.text = "    + " + nueTxt + " " + txt;
					}else if(hasCent){
						tby.text = "    " + txt + nueTxt + "%";
					}else{
						tby.text = "    " + txt + " " + nueTxt;
					}
				}
			}
		}
		i = i + 1;
	}
	
	var hasDiv = false;
	for(var x in cust){
		if(!hasDiv){
			var tby = $.CreatePanel('Label', spc, '');
			tby.AddClass("abilSpecial");
			tby.html = true;
			tby.text = " "
			hasDiv = true;
		}
		var tby = $.CreatePanel('Label', spc, '');
		tby.AddClass("abilSpecial");
		tby.html = true;
				tby.style.marginLeft = "10px";
		var lclTxt = $.Localize("Custom_Inventory_Stat_"+x).toUpperCase();
		
		var hasCent = false;
		var hasPlus = false;
		if(lclTxt.substring(0,1) == "%"){
			hasCent = true;
			lclTxt = lclTxt.substring(1, lclTxt.length);
		}
		if(lclTxt.substring(0,2) == "+$"){
			hasPlus = true;
			//txt = $.Localize("DOTA_SHOP_TAG_" + txt.substring(2, txt.length).toUpperCase());
			lclTxt = lclTxt.substring(2, lclTxt.length);
		}
		var ib = 1;
		var hasLvl = false;
		var procTxt = cust[x];
		var b = (""+procTxt).indexOf(" ");
		var nueTxt = "<font color='434931ff'>";
		while(b >= 0){
			hasLvl = true;
			
			if(lvl == ib){
				nueTxt = nueTxt + (ib != 1 ? "/" : "") + "</font><font color='#ffff44ff'>" + procTxt.substring(0,b)+"</font><font color='434931ff'>";
			}else{
				nueTxt = nueTxt + (ib != 1 ? "/" : "") + procTxt.substring(0,b) 
			}	
			ib = ib + 1;
			procTxt = procTxt.substring(b+1, procTxt.length);
			b = procTxt.indexOf(" ");
			if(ib > 30) break;
			if(procTxt.length <= 0) break;
		}
		if(hasLvl){
			if(lvl == ib){
				nueTxt = nueTxt + (ib != 1 ? "/" : "") + "</font><font color='#ffff44ff'>" + procTxt+"</font><font color='434931ff'>";
			}else{
				nueTxt = nueTxt + "/" + procTxt 
			}	
		}
		
		var lblText
		if(!hasLvl){
			if(hasPlus){
				if(!hasCent){
					lblText = "    + <font color='#ffff44ff'>" + cust[x] + "</font> " + lclTxt;
				}else{
					lblText = "    + <font color='#ffff44ff'>" + cust[x] + "%</font> " + lclTxt;
				}
			}else if(hasCent){
				lblText = "    " + lclTxt + " <font color='#ffff44ff'>" + cust[x] + "%</font>";
			}else{
				lblText = "    " + lclTxt + " <font color='#ffff44ff'>" + cust[x] + "</font>";
			}
		}else{
			if(hasPlus){
				if(!hasCent){
					lblText = "    + " + nueTxt + " " + lclTxt;
				}else{
					lblText = "    + " + nueTxt + "<font color='#ffff44ff'>%</font> " + lclTxt;
				}
			}else if(hasCent){
				lblText = "    " + lclTxt + nueTxt + "%";
			}else{
				lblText = "    " + lclTxt + " " + nueTxt;
			}
		}
		//tby.text = "    + <font color='#ffff44ff'>" + cust[x] + "</font> " + x;
		tby.text = lblText;
	}

	var itemDesc = itemDescription;
	while(itemDesc.indexOf("%%%") >= 0){
		itemDesc = itemDesc.replace("%%%", "%^");
	}
	var indof = itemDesc.indexOf("%"); 
	var maxCycleCount = 30;
	while(indof >= 0){
		var temp = itemDesc.indexOf("%", indof+1);
		
		if(temp - indof > 1){
			var tag = itemDesc.substring(indof+1, temp);
			var rep = "(UNKNOWN)";
			end: for(var x in abilSpecial){
				for(var y in abilSpecial[x]){
					if(y == tag){
						rep = abilSpecial[x][y];
					}
				}
			}
			itemDesc = itemDesc.substring(0, indof) + rep + itemDesc.substring(temp+1, itemDesc.length);
		}else{
			break;
			//theres two percent marks in front of eachother wtf
		}	 
		
		indof = itemDesc.indexOf("%");
		maxCycleCount--;
		if(maxCycleCount <= 0) break; 
	}
	while(itemDesc.indexOf("^") >= 0){
		itemDesc = itemDesc.replace("^", "%");
	}
	if(ided){
		if(itemDesc != "DOTA_Tooltip_ability_" + itemName + "_Description"){
			$("#ItemDesc").text = "    " + itemDesc;
		}else{
			$("#ItemDesc").visible = false;
		}
	}
			$("#ItemDesc").hittest = false;
	hasAbilSpecial = true;
	//$.GetContextPanel().style.margin = "-" + ($.GetContextPanel().contentheight * (453.0/324.0)) + "px, -250px, -250px, -250px";
}

function UpdateItem()
{
	$.GetContextPanel().visible = false;
	//$.GetContextPanel().style.height = "fit-children";
	//$.GetContextPanel().style.margin = "-" + (300 * (453.0/324.0)) + "px, -250px, -250px, -250px";
	item = $.GetContextPanel().GetAttributeInt( "item", -1 );
	var itemIndex = $.GetContextPanel().GetAttributeInt( "itemIndex", -1 );
	var queryUnit = $.GetContextPanel().GetAttributeInt( "queryUnit", -1 );
	itemName = Abilities.GetAbilityName( item );
	var t = {player:Game.GetLocalPlayerID(), itemIndex:itemIndex, item:item}
	if(!itemStats){
		GameEvents.SendCustomGameEventToServer("mmoui_get_abil_special", t );
	}
	var hotkey = Abilities.GetKeybind( item, queryUnit ); 
	var itemDisplayName = "[" + hotkey + "] " + $.Localize("DOTA_Tooltip_Ability_" + itemName);
	if(itemDisplayName == "[" + hotkey + "] " + "DOTA_Tooltip_Ability_" + itemName) itemDisplayName ="[" + hotkey + "] " + $.Localize("DOTA_Tooltip_ability_" + itemName);
	if(itemDisplayName == "[" + hotkey + "] " + "DOTA_Tooltip_ability_" + itemName) itemDisplayName =  "[" + hotkey + "] " + "Unknown";
	
	itemDisplayName = "<font color='#" + GetColor(item) + "ff'>" + itemDisplayName + "</font>";
	itemDescription = $.Localize("DOTA_Tooltip_ability_" + itemName + "_Description");
	var itemLore = $.Localize("DOTA_Tooltip_ability_" + itemName + "_Lore");
	
	var chargeCount = 0;
	var hasCharges = false;
	var altChargeCount = 0;
	var hasAltCharges = false;
	
	if ( Items.ShouldDisplayCharges( item ) )
	{
		hasCharges = true;
		chargeCount = Items.GetCurrentCharges( item );
		itemDisplayName = "(" + chargeCount + "x)" + itemDisplayName;
	}
	
	$("#ItemName").html = true;
	$("#ItemName").text = itemDisplayName;
	$("#ItemName").html = true;
	$("#ItemImage").itemname = itemName;
	$("#ItemImage").contextEntityIndex = item;
	if(itemDescription != "DOTA_Tooltip_ability_" + itemName + "_Description"){
		$("#ItemDesc").text = "    " + itemDescription;
	}else{
		$("#ItemDesc").visible = false;
	}
	if(itemLore == "" || itemLore == null || itemLore == "DOTA_Tooltip_ability_" + itemName + "_Lore"){
		$('#ItemLore').visible = false;
	}else{
		$("#ItemLore").text = itemLore;
	}
	
	if(Items.IsSellable(item) && Items.GetCost(item) != 0){
		$('#SellPrice').text = "Sell Price: " + (Items.GetCost(item) / 2);
	}else{
		$('#SellPrice').visible = false;
	}
	
	if(false){
	//gold cost
	}else{
		$('#GoldCost').visible= false;
	}
	if(false){
	//health cost
	}else{
		$('#HealthCost').visible= false;
	}
	if(Abilities.GetManaCost(item) > 0){
		$("#ManaCost").visible = true;
		$("#ManaCostText").text = Abilities.GetManaCost(item);
	}else{
		$("#ManaCost").visible = false;
	}  
	
	if(Abilities.GetCooldown(item) > 0){ 
		$("#Cooldown").visible = true;
		$("#CooldownText").text = Abilities.GetCooldown(item);
	}else{
		$("#Cooldown").visible = false
	}
			$.GetContextPanel().style.height = "700px";
	var check = function(){
		if(hasAbilSpecial && $.GetContextPanel().contentheight != 0){
			$.GetContextPanel().style.margin = "-" + ($.GetContextPanel().contentheight * (1)) + "px, -250px, -250px, -250px";
			//$.GetContextPanel().style.height = "fit-children";
			$.GetContextPanel().visible = true;
			
		}else if(hasAbilSpecial){
			$.GetContextPanel().visible = true;
			$.Schedule(0.01, check);
		}else{
			$.Schedule(0.01, check);
		 
		}
	}
	$.Schedule(0.03, check);
}

function UpdateItemUnidentified(){
	$.GetContextPanel().visible = false;
	
	var itemIndex = $.GetContextPanel().GetAttributeInt( "itemIndex", -1 );
	item = $.GetContextPanel().GetAttributeInt( "item", -1 );
	var queryUnit = $.GetContextPanel().GetAttributeInt( "queryUnit", -1 );
	itemName = Abilities.GetAbilityName( item );
	var t = {player:Game.GetLocalPlayerID(), item:item, itemIndex: itemIndex}
	if(!itemStats){
		GameEvents.SendCustomGameEventToServer("mmoui_get_abil_special", t );
	}
	var hotkey = Abilities.GetKeybind( item, queryUnit ); 
	var itemDisplayName = "[" + hotkey + "] " + $.Localize("DOTA_Tooltip_Ability_" + itemName);
	itemDescription = $.Localize("DOTA_Tooltip_ability_" + itemName + "_Description");
	var itemLore = $.Localize("DOTA_Tooltip_ability_" + itemName + "_Lore");
	$('#ItemName').html = true;
	$("#ItemName").text = "<font color='#" + GetColor(item) + "ff'>Unidentified Item</font>";
	$("#ItemName").style.marginTop = "25px";
	$("#ItemName").html = true;
	$("#ItemImage").itemname = itemName;
	$("#ItemImage").contextEntityIndex = item;
	$("#ItemDesc").text = "This item is currently unidentified and unusable. Right click the item to identify it.";
	$("#ItemLore").text = "This item could be anything from a salmon to a Mjolnir. Who knows!?";

	$('#SellPrice').visible = false;

	$('#GoldCost').visible= false;

	$('#HealthCost').visible= false;
	$("#ManaCost").visible = false;

	$("#Cooldown").visible = false
	
	var bad = 0;
			$.GetContextPanel().style.height = "700px";
	var check = function(){
		if(hasAbilSpecial && $.GetContextPanel().contentheight != 0){
		//	$.GetContextPanel().style.margin = "-" + ($.GetContextPanel().contentheight * (453.0/324.0)) + "px, -250px, -250px, -250px";
			//$.GetContextPanel().style.height = "fit-children";
			
		}else if(hasAbilSpecial){
			bad = bad + 1;
			$.GetContextPanel().visible = true;
			$.Schedule(0.01, check);
		}else{
			bad = bad + 1000000;
		}
		$.Schedule(0.01, check);
	}
	$.Schedule(0.01, check);
	
}

function onAbilSpecial(data)
{
	if(data.player != Game.GetLocalPlayerID()){
		return;
	}
	var index = data.itemIndex

	if(index != $.GetContextPanel().GetAttributeInt( "itemIndex", -1 )){
		return;
	}
	RecievedAbilSpecial(data.itemTable, data.customTable);
}
(function()
{
	$.GetContextPanel().style.zIndex = "999999";
	if($.GetContextPanel().data().ided !== null){
		itemStats = $.GetContextPanel().data().stats;
		ided = $.GetContextPanel().data().ided; 
		
		if(ided){
			UpdateItem(); // initial update of dynamic state
		}else{ 
			UpdateItemUnidentified(); 
		}
			$('#UnidImage').visible = !ided;
			RecievedAbilSpecial(itemStats.basic, itemStats.custom);
	}else{
		GameEvents.Subscribe("mmoui_return_abil_special", onAbilSpecial); 
		 
		ided = $.GetContextPanel().GetAttributeInt("ided", 0); 
		if(ided == 1){
			$('#UnidImage').visible = false;
			UpdateItem(); // initial update of dynamic state
		}else{
			UpdateItemUnidentified();
		}
	}
})();
