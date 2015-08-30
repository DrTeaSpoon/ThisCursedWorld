if not CustomInventory then
	CustomInventory = {}
	CustomInventory.CurrentItemTable = {}
	CustomInventory.Inventory = {}
	CustomInventoryInit = true;
else
	CustomInventoryInit = false;
end

local INVENTORY_ROWS = 6
local INVENTORY_COLS = 15
local CHARM_ROWS = 6
local CHARM_COLS = 4
local EQUIPMENT_OPTIONS = {"Helm", "Shoulders", "Chest", "Gloves", "Pants", "Necklace", "RingLeft", "RingRight", "Belt",  "Boots", "WeaponLeft", "SoulLeft", "WeaponRight", "SoulRight"}

local ADD_ITEM_EVENT = "custom_inventory_on_item_pickup" --lua to panorama

local REQUEST_DROP_ITEM_EVENT = "custom_inventory_on_request_item_drop" --the server requests this from lua
local DROP_ITEM_EVENT = "custom_inventory_on_item_drop" --panorama to lua

local REQEUST_EQUIP_ITEM_EVENT = "custom_inventory_on_request_item_equip" --lua to panorama
local EQUIP_ITEM_EVENT = "custom_inventory_on_item_equip" --lua to panorama

local REQEUST_UNEQUIP_ITEM_EVENT = "custom_inventory_on_request_item_unequip" --lua to panorama
local UNEQUIP_ITEM_EVENT = "custom_inventory_on_item_unequip" --lua to panorama

local REQUEST_FULL_UPDATE = "custom_inventory_on_request_full_update" --p-l
local SEND_FULL_UPDATE = "custom_inventory_on_full_update" --l-p

local ITEM_CHANGE_SLOT_EVENT = "custom_inventory_on_item_change_position" --p-l

--Functons
function CustomInventory:_InitializeInventory(hero)
	return {charms={}, equipment={}, inventory={}}
end

function CustomInventory:_Pad(int)
	local max = INVENTORY_COLS * INVENTORY_ROWS
	if max > 10000 then
		if int > 10000 then
			return "" .. int
		elseif int > 1000 then
			return "0" .. int
		elseif int > 100 then
			return "00" .. int
		elseif int > 10 then
			return "000" .. int
		else
			return "0000" .. int
		end
	elseif max > 1000 then
		if int > 1000 then
			return "" .. int
		elseif int > 100 then
			return "0" .. int
		elseif int > 10 then
			return "00" .. int
		else
			return "000" .. int
		end
	elseif max > 100 then
		if int > 100 then
			return "" .. int
		elseif int > 10 then
			return "0" .. int
		else
			return "00" .. int
		end
	elseif max > 10 then
		if int > 10 then
			return "" .. int
		else 
			return "0" .. int
		end
	else
		return "" .. int
	end
end

function CustomInventory:_IsSlotOpen(table, slot, w, h) 
	local slotX = ((slot - 1) % INVENTORY_COLS) + 1
	local slotY = math.floor((slot - 1) / INVENTORY_COLS) + 1
	if slotX + w - 1 > INVENTORY_COLS then return false end
	if slotY + h - 1 > INVENTORY_ROWS then return false end
	
	for i=1,w do
		for ib=1,h do
			if table["slot"..CustomInventory:_Pad(slotX + i - 1 + (slotY + ib - 2) * INVENTORY_COLS)] then
				return false
			end
		end
	end
	return true
end

function CustomInventory:_FindFreeSlot(item,hero,stats, ided)
	CustomInventory.Inventory[hero:GetEntityIndex()] = CustomInventory.Inventory[hero:GetEntityIndex()] or CustomInventory:_InitializeInventory(hero)
	local playerTable = CustomInventory.Inventory[hero:GetEntityIndex()].inventory
	local itemTable = GameRules.itemTable[item:GetAbilityName()]
	local itemWidth = itemTable.Width or 1
	local itemHeight = itemTable.Height or 1
	local primary = true

	for i = 1,(INVENTORY_COLS * INVENTORY_ROWS) do
		local slotX = ((i - 1) % INVENTORY_COLS) + 1
		local slotY = math.floor((i - 1) / INVENTORY_COLS) + 1
		if CustomInventory:_IsSlotOpen(playerTable,i,itemWidth,itemHeight) then
			for ib=1,itemWidth do
				for ic=1,itemHeight do
					local id = slotX + ib - 1 + (slotY + ic - 2) * INVENTORY_COLS
					local tt = {}
					playerTable["slot"..CustomInventory:_Pad(id)] = tt
					tt.item = item
					tt.entIndex = item:GetEntityIndex()
					tt.primary = primary
					primary = false
					tt.slot = i
					tt.stats = stats
					tt.ided = ided
				end
			end
			return i
		end
	end
	return -1

end

--System Mechanics
function CustomInventory:AddItem(item, hero)

end

function CustomInventory:DropItem(item, hero)

end

function CustomInventory:EquipItem(item, hero)

end

function CustomInventory:UnEquipItem(item, hero)

end

function CustomInventory:EquipCharm(item, hero)

end

function CustomInventory:UnEquipCharm(item, hero)

end

function CustomInventory:OnItemPickup(item, hero, isUnequip, targetSlot)
	Items:SetupItem(item)
	if Items:IsCustomItem(item) then
		if isUnequip then
			if targetSlot then
				local tt = {}
				playerTable["slot"..CustomInventory:_Pad(targetSlot)] = tt
				tt.item = item
				tt.entIndex = item:GetEntityIndex()
				tt.primary = true
				tt.slot = targetSlot
				tt.stats = Items:GetAbilitySpecial(item)
				tt.ided = Items:IsIdentified(item)
			else
				local slot = CustomInventory:_FindFreeSlot(item,hero, Items:GetAbilitySpecial(item), Items:IsIdentified(item))
			end
		else
			hero:DropItemAtPositionImmediate(item, hero:GetAbsOrigin())
			item:SetAbsOrigin(Vector(0,0,0))
			item:SetOwner(hero)

			local slot = CustomInventory:_FindFreeSlot(item,hero, Items:GetAbilitySpecial(item), Items:IsIdentified(item))
			CustomGameEventManager:Send_ServerToPlayer(hero:GetPlayerOwner(), ADD_ITEM_EVENT, {player=hero:GetPlayerOwnerID(), slot=slot, item=item:GetEntityIndex(), ided=Items:IsIdentified(item), stats=Items:GetAbilitySpecial(item)})
		end
	end

end


function CustomInventory:OnItemDropped(item, hero)

end


function CustomInventory:OnItemEquipped(keys)
	local item = keys.item
	PrintTable(keys)
	local player = keys.player
	local target = keys.targetSlot
	local unit = PlayerResource:GetPlayer(player):GetAssignedHero() 
	local t = {entIndex= item, stats=Items:GetAbilitySpecial(EntIndexToHScript(item))}
	CustomInventory.Inventory[unit:GetEntityIndex()].equipment[target]= t;
	for k,v in pairs(CustomInventory.Inventory[unit:GetEntityIndex()].inventory) do
		print("ENUMING" .. item)
 		if v.entIndex == item then
 			CustomInventory.Inventory[unit:GetEntityIndex()].inventory[k] = nil
 			print("REMOVING GG " .. k) 
 			goto gg
 		end
	end
	::gg::
	print("Equipped", target, item)
	Items:ApplyBonuses(EntIndexToHScript(item), unit)
end

function CustomInventory:OnItemUnequipped(keys)
	local item = keys.item
	local player = keys.player
	local target = keys.targetSlot
	local unit = PlayerResource:GetPlayer(player):GetAssignedHero()
	CustomInventory:OnItemPickup(EntIndexToHScript(item), unit, true, target)
	Items:RemoveBonuses(EntIndexToHScript(item), unit)

end

function CustomInventory:OnItemChangedInventorySlots(keys)
	local item = keys.item
	local player = keys.player
	local unit = PlayerResource:GetPlayer(player):GetAssignedHero()
	local invTable= CustomInventory.Inventory[unit:GetEntityIndex()].inventory
	local newSlot = keys.slot
	local slotX = ((newSlot - 1) % INVENTORY_COLS) + 1
	local slotY = math.floor((newSlot - 1) / INVENTORY_COLS) + 1
	local offset 
	local itemWidth = Items:GetItemWidth(EntIndexToHScript(item):GetAbilityName())
	local itemHeight = Items:GetItemHeight(EntIndexToHScript(item):GetAbilityName())
	local stats = nil
	local ided = nil
	for k,v in pairs(invTable) do
		if type(v) == "table" and v.entIndex == item then
			if v.primary then
				offset = v.slot
			end
			stats = v.stats or stats
			ided = v.ided or ided
			invTable[k] = nil
		end
	end
	local primary = true 
	stats = Items:GetAbilitySpecial(EntIndexToHScript(item))
	ided = Items:IsIdentified(EntIndexToHScript(item))
	for ib=1,itemWidth do
		for ic=1,itemHeight do
			local id = slotX + ib - 1 + (slotY + ic - 2) * INVENTORY_COLS
			local oldTable = invTable["slot"..CustomInventory:_Pad(id)]
			--if oldTable then
			--	local new = 0 --(offset + (slotX + ib - 1) + (slotY + ic - 2) * INVENTORY_COLS)

				--print("MOVING TO OLD " ..  new)
				--invTable["slot"..CustomInventory:_Pad(new)] = oldTable
			--end
			local tt = {}
			invTable["slot"..CustomInventory:_Pad(id)] = tt
			tt.item = EntIndexToHScript(item)
			tt.entIndex = item
			tt.primary = primary
			primary = false
			tt.slot = id
			tt.stats = stats
			tt.ided = ided
		end
	end
end

function CustomInventory:OnInventoryChanged(keys)
	if keys.PlayerID == nil then return end
	if not PlayerResource then return end
	local unit = PlayerResource:GetPlayer(keys.PlayerID)
	if not unit then return end
	unit = unit:GetAssignedHero()
	if not unit then return end
	CustomInventory.CurrentItemTable[unit:GetEntityIndex()] = CustomInventory.CurrentItemTable[unit:GetEntityIndex()] or {}
	local tbl = CustomInventory.CurrentItemTable[unit:GetEntityIndex()]
	for i = 0,6 do
		local item = unit:GetItemInSlot(i)
		if item then	
			for k,v in pairs(tbl) do
				if item:GetEntityIndex() == v then
					goto skip
				end
			end
			CustomInventory:OnItemPickup(item, unit)
			table.insert(tbl, item:GetEntityIndex())
			::skip::
		end
	end
	for k,v in pairs(tbl) do
		for i = 0,6 do
			if unit:GetItemInSlot(i) and unit:GetItemInSlot(i):GetEntityIndex() == v then
				goto skip2
			end
		end
		--on item remove
		CustomInventory:OnItemDropped(unit, v)
		for kk,vv in pairs(tbl) do
			if vv == v then
				table.remove(tbl, kk)
			end
		end
		::skip2::
	end

end

function CustomInventory:OnRequestFullUpdate(keys)
	local player = keys.player
	local unit = PlayerResource:GetPlayer(player):GetAssignedHero()
	if not unit then return end
	local invTable = CustomInventory.Inventory[unit:GetEntityIndex()]
	if not invTable then return end

	local charms = {} 
	local equipment = {}
	local inventory = {}

	for k,v in pairs(invTable.inventory) do
		if v.primary then
			local t = {}
			t.entIndex = v.entIndex
			t.slot = v.slot
			t.stats = v.stats
			t.ided = Items:IsIdentified(v.item)
		table.insert(inventory, t)
		end
	end 

	for k,v in pairs(invTable.equipment) do
		local t = {}
		t.entIndex = v.entIndex
		t.slot = k
		t.stats = v.stats
		t.ided = v.ided
		table.insert(equipment, t)
	end
	print("EQUIPMENT")
	PrintTable(equipment)
	local t = {player=player, charms=charms, equipment=equipment, inventory=inventory}
	CustomGameEventManager:Send_ServerToAllClients(SEND_FULL_UPDATE, t)


end

function CustomInventory:RegisterEvents()
	CustomGameEventManager:RegisterListener( "inventory_updated", Dynamic_Wrap(CustomInventory, 'OnInventoryChanged'))
	CustomGameEventManager:RegisterListener(EQUIP_ITEM_EVENT, Dynamic_Wrap(CustomInventory, 'OnItemEquipped'))
	CustomGameEventManager:RegisterListener(UNEQUIP_ITEM_EVENT, Dynamic_Wrap(CustomInventory, 'OnItemUnequipped'))
	CustomGameEventManager:RegisterListener(REQUEST_FULL_UPDATE, Dynamic_Wrap(CustomInventory, 'OnRequestFullUpdate'))
	CustomGameEventManager:RegisterListener(ITEM_CHANGE_SLOT_EVENT, Dynamic_Wrap(CustomInventory, 'OnItemChangedInventorySlots'))
	
end
if CustomInventoryInit then
	CustomInventory:RegisterEvents()
end