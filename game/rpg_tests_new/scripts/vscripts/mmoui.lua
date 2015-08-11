require("bonus")
require("char_screen/custom_inventory")
require("char_screen/items")
GameRules.ItemDataTable = GameRules.ItemDataTable or {}

if not MMOUI then
	MMOUI = {}
	CustomGameEventManager:RegisterListener( "mmoui_get_int_property", Dynamic_Wrap(MMOUI, 'getInt'))
	CustomGameEventManager:RegisterListener( "mmoui_get_abil_special", Dynamic_Wrap(MMOUI, 'getTable'))
	CustomGameEventManager:RegisterListener( "mmoui_get_class", Dynamic_Wrap(MMOUI, 'getClassification'))
	CustomGameEventManager:RegisterListener( "mmoui_get_identified", Dynamic_Wrap(MMOUI, 'getIdentified'))
	CustomGameEventManager:RegisterListener( "mmoui_identify_item", Dynamic_Wrap(MMOUI, 'identifyItem'))
	CustomGameEventManager:RegisterListener( "inventory_updated", Dynamic_Wrap(MMOUI, 'OnInventoryChanged'))
end
local lastTable = nil
lastItems = lastItems or {} 
GameRules.lastId = GameRules.lastId or {}
GameRules.itemManfiest = GameRules.itemManifest or LoadKeyValues("scripts/npc/custom_item_manifest.txt")

--note to self: two arguments are because the first is "self"

function MMOUI.OrderUnitIdentifyItem(unit) --Orders a unit to cast the identify_item, which is just a dummy abil
	print("order idnetif")
	if not unit:HasAbility("identify_item") then
		unit:AddAbility("identify_item")

	end
	for i=0,14 do
		if unit:GetAbilityByIndex(i) and unit:GetAbilityByIndex(i):GetAbilityName() == "identify_item" then
			--print("CAST")
			unit:GetAbilityByIndex(i):SetLevel(2)
			unit:CastAbilityNoTarget(unit:GetAbilityByIndex(i), unit:GetPlayerOwnerID())
			return
		end
	end
	--print("ERROR : FAILED TO CAST IDENTIFY ITEM")
end


function MMOUI:OnInventoryChanged(keys) --for now, whenever the inventory was changed, completely reparse the entire inventory
	if keys.PlayerID == nil then return end
	if not PlayerResource then return end
	local unit = PlayerResource:GetPlayer(keys.PlayerID)
	if not unit then return end
	unit = unit:GetAssignedHero()
	if not unit then return end

	Bonus.InitializeBonus(unit)
	if lastItems[unit:GetEntityIndex()] then
		for k,v in pairs(lastItems[unit:GetEntityIndex()]) do
			Items:RemoveBonuses(v,unit)
		end
	end
	lastItems[unit:GetEntityIndex()] = {}
	for i=0,40 do
		local item = unit:GetItemInSlot(i)
		if item and item.GetAbilityName then
			Items:ApplyBonuses(item,unit)
			if Items:IsCustomItem(item) and Items:IsActiveCustomItem(item) and Items:IsIdentified(item) then
			 	table.insert(lastItems[unit:GetEntityIndex()], item)
			end
		end
	end
--	print("DONE")
	unit:ReduceMana(1)
end
for i=0,15 do
	MMOUI:OnInventoryChanged({PlayerID=i})
end

--------------------------
--Events for talking to Panorama
-------------------

function OnIdentifyItemCastFinished(keys) --When the abil finishes, tell everyones
	local killedUnit = EntIndexToHScript( keys.caster_entindex ) 	
	local lastId = GameRules.lastId[killedUnit:GetPlayerOwnerID()]
	local itemIded = lastId
	local player = killedUnit:GetPlayerOwnerID()
	print("IDED",itemIded)
	print("INeX", itemIded:GetAbilityName())
	print("INedX", itemIded:GetEntityIndex())
	if not Items:IsItemSetup(itemIded) then
		Items:SetupItem(itemIded)
	end

	if not Items:IsCustomItem(itemIded) then 
		return
	end
	Items:IdentifyItem(itemIded,player)

	MMOUI:OnInventoryChanged({PlayerID=killedUnit:GetPlayerOwnerID()})
	GameRules.lastId[killedUnit:GetPlayerOwnerID()] = -1

	CustomGameEventManager:Send_ServerToAllClients("mmoui_on_item_identified", {player=killedUnit:GetPlayerOwnerID(), item=lastId:GetEntityIndex()})
end

function MMOUI:identifyItem(keys) --Identifies the given item
	--print("ID ITEM! : " .. keys.itemIndex)
	--print("PLAYER ! .. " .. keys.player)
	local item = EntIndexToHScript(keys.item)
	GameRules.lastId[keys.player] = EntIndexToHScript(keys.item)
	local tbl = GameRules.ItemDataTable[item:GetEntityIndex()]
	if tbl.ided == false then
		MMOUI.OrderUnitIdentifyItem(PlayerResource:GetPlayer(keys.player):GetAssignedHero())
	end
end

function MMOUI.getIdentified(keys,b) --Returns whether or not an item was identified
	local item = EntIndexToHScript(keys.item)
	local tbl = GameRules.ItemDataTable [item:GetEntityIndex()]
	local ided = false
	if tbl then
		ided = tbl.ided
	end
	CustomGameEventManager:Send_ServerToAllClients("mmoui_return_identified", {player=b.player, itemIndex=b.itemIndex, is=(ided and 1 or 0)})
end


function MMOUI:getTable(keys) --Returns the AbilSpecial of an item
	local item = EntIndexToHScript(keys.item)
	if not item then return end
	if not GameRules.itemTable then return end
	local itemName = item:GetAbilityName()

--	print("ITEM : " .. item:GetAbilityName())
	local newt = GameRules.itemTable[itemName].AbilitySpecial
--	print(keys.player)
	--print("NEWT : " .. newt)
	local t =  {player=keys.player, itemIndex=keys.itemIndex, itemTable=GameRules.itemTable[itemName].AbilitySpecial or {}}

	if GameRules.ItemDataTable[item:GetEntityIndex()] and GameRules.ItemDataTable[item:GetEntityIndex()].CustomStatsCompiled then
--		print("1")
		t.customTable = {}
		for k,v in pairs(GameRules.ItemDataTable[item:GetEntityIndex()].CustomStatsCompiled) do
			t.customTable[k] = v
		end
	elseif GameRules.ItemDataTable[item:GetEntityIndex()] and GameRules.ItemDataTable[item:GetEntityIndex()].ided == false then
	--	print("UNIDDED")
		t = {player=keys.player, itemIndex=keys.itemIndex, ided=0}
	end
	CustomGameEventManager:Send_ServerToAllClients("mmoui_return_abil_special", t)
end


function MMOUI.getClassification(keys) --unused
	for k,v in pairs(GameRules.shopTable) do
		for kk,vv in pairs(v) do

		end
	end
end

function MMOUI.getInt(keys) --unused
	if keys.propertyId == 0 then
		CustomGameEventManager.Send_ServerToAllClients("mmoui_return_int_property", {player=keys.player, propertyId=keys.propertyId, value=keys.unit:GetAbilityPoints()})
	elseif keys.propertyId == 1 then
		CustomGameEventManager.Send_ServerToAllClients("mmoui_return_int_property", {player=keys.player, propertyId=keys.propertyId, value=keys.unit:GetAbilityPoints()})
	end
end
