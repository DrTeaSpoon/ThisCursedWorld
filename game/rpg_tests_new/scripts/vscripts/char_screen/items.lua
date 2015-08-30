require("bonus")
require("char_screen/custom_inventory")

GameRules.ItemDataTable = GameRules.ItemDataTable or {}
if not Items then
	Items = {}
	--[[CustomGameEventManager:RegisterListener( "mmoui_get_int_property", Dynamic_Wrap(MMOUI, 'getInt'))
	CustomGameEventManager:RegisterListener( "mmoui_get_abil_special", Dynamic_Wrap(MMOUI, 'getTable'))
	CustomGameEventManager:RegisterListener( "mmoui_get_class", Dynamic_Wrap(MMOUI, 'getClassification'))
	CustomGameEventManager:RegisterListener( "mmoui_get_identified", Dynamic_Wrap(MMOUI, 'getIdentified'))
	CustomGameEventManager:RegisterListener( "mmoui_identify_item", Dynamic_Wrap(MMOUI, 'identifyItem'))
	CustomGameEventManager:RegisterListener( "inventory_updated", Dynamic_Wrap(MMOUI, 'OnInventoryChanged'))]]
end

local lastTable = nil
lastItems = lastItems or {} 
GameRules.lastId = GameRules.lastId or {}
GameRules.itemManfiest = GameRules.itemManifest or LoadKeyValues("scripts/npc/custom_item_manifest.txt")

function Items:GetAbilitySpecial(item)
	if not GameRules.itemTable then return end
	local itemName = item:GetAbilityName()

	local requirements = {slot=GameRules.itemTable[itemName].Slot}
	local itemTable=GameRules.itemTable[itemName].AbilitySpecial or {}
	local customTable = {}
	if GameRules.ItemDataTable[item:GetEntityIndex()] and GameRules.ItemDataTable[item:GetEntityIndex()].CustomStatsCompiled then
		for k,v in pairs(GameRules.ItemDataTable[item:GetEntityIndex()].CustomStatsCompiled) do
			customTable[k] = v
		end
	end
	return {requirements=requirements, basic=itemTable, custom=customTable}

end

function Items:GetItemWidth(item)
	return GameRules.itemTable[item].Width or 1
end

function Items:GetItemHeight(item)
	return GameRules.itemTable[item].Height or 1
end

function Items:IsCustomItem(item) --Checks if an item hould use custom data
	return GameRules.ItemDataTable[item:GetEntityIndex()].IsCustom
end

function Items:IsActiveCustomItem(item)
	return GameRules.ItemDataTable[item:GetEntityIndex()].CustomStatsCompiled
end

function Items:IsIdentified(item)
	return GameRules.ItemDataTable[item:GetEntityIndex()] and GameRules.ItemDataTable[item:GetEntityIndex()].ided 
end

function Items:IsItemSetup(item) --Checks if an item was setup. 
	if GameRules.ItemDataTable[item:GetEntityIndex()] then
		lastTable = GameRules.ItemDataTable [item:GetEntityIndex()].dataTable
		return true 
	else
		return false
	end
end
-- GameRules.ItemDataTable = {}

function Items:SetupItem(item) --Sets up an item for customdata if it hasnt been already
	lastTable = nil
	if not GameRules.itemTable then return end
	for k,v in pairs(GameRules.itemTable) do
		if k == item:GetAbilityName() then
			lastTable = v
			break
		end
	end
	if not lastTable then
	--	print("ERROR : ITEM NOT FOUND " + item:GetUnitName())
		return
	end
	GameRules.ItemDataTable[item:GetEntityIndex()] = GameRules.ItemDataTable[item:GetEntityIndex()] or {}
	if GameRules.ItemDataTable[item:GetEntityIndex()].ided then
		return
	end
	if not lastTable.CustomStats then
		--print("NOT CUSTOM")
		GameRules.ItemDataTable[item:GetEntityIndex()].IsCustom = false
		return
	end
--	print("CUSTOM!!")
	GameRules.ItemDataTable [item:GetEntityIndex()].IsCustom = true

	local tbl = GameRules.ItemDataTable [item:GetEntityIndex()] 

	if lastTable.AutoIdentified then
		tbl.ided = true
	else
		tbl.ided = false
	end
	tbl.hihih = "hihi"
	tbl.CustomStats = lastTable.CustomStats
	tbl.Stats = {}
	Items:GenerateStats(item)
end


function Items:ApplyBonuses(item,unit) --Goes through an item, checks if it was unidentified, if so applies its Bonuses
--	print("Parse Item!")
	if not Items:IsItemSetup(item) then
		Items:SetupItem(item)
	end
	if not Items:IsCustomItem(item) then return end

	--print("KK!")
	local itemTable = GameRules.ItemDataTable [item:GetEntityIndex()]

	if not itemTable.ided then
		return
	end
	Bonus.InitializeBonus(unit)
	for k,v in pairs(itemTable.CustomStatsCompiled) do
	--	print("ADD " .. k .. ":" .. v)
		unit:AddBonus(k,v)
	end
end

function Items:RemoveBonuses(item, unit)
	local abilTable = GameRules.ItemDataTable[item:GetEntityIndex()]
	Bonus.InitializeBonus(unit)
	for k,v in pairs(abilTable.CustomStatsCompiled) do
	--	print("REMOVE " .. k .. ":" .. v)
	--	print("UNIT " .. unit:GetUnitName() )
		unit:SubtractBonus(k, v)
	end
end

function Items:_PassesRequirements(stat, slot, ilvl)
	local symbol = string.find(stat, "=")
	local symbolIndex = symbol
	local symbolSize = 1
	if symbol then
		local sub = string.sub(stat, symbol-1, symbol-1)
		if sub == "<" or sub == ">" then
			symbol = sub + "="
			symbolSize = 2
		else
			symbol = "="
		end
	else
		local i2 = string.find(stat, ">")
		local i3 = string.find(stat, "<")
		local i4 = string.find(stat, "!")
		if i2 then
			symbol = ">"
			symbolIndex = i2
		elseif i3 then
			symbol = "<"
			symbolIndex = i3
		elseif i4 then
			symbol = "!"
			symbolIndex = i4
		else
			print("[ERROR] Invalid Symbol for stat " .. stat)
			return 1/0
		end
	end

	local left = string.sub(stat, 1, symbolIndex-1)
	local right = string.sub(stat, symbolIndex+symbolSize)

	if not left then
		print("[ERROR] No LHO for stat " .. stat)
		return 1/0
	elseif not right then
		print("[ERROR] No RHO for stat" .. stat)
		return 1/0
	end

	if left == "type" then
		if symbol ~= "=" then
			print("[ERROR] Invalid Symbol for stat " .. stat)
			return 1/0
		end

		return slot == right
	elseif left == "lvl" then
		right = tonumber(right)
		if symbol == "=" then
			return ilvl == right
		elseif symbol == "!=" then
			return ilvl ~= right
		elseif symbol == ">" then
			return ilvl > right
		elseif symbol == "<" then
			return ilvl < right
		elseif symbol == "<=" then
			return ilvl <= right
		else
			return ilvl >= right
		end
	else
		print("[ERROR] Invalid LHO for stat ", left, stat)
		return 1/0
	end

end

function Items:_SubParseTable(value, slot, ilvl)
	local t = {}
	for k,v in pairs(value) do
		local tb = Items:_SubParseStat(k,v,slot,ilvl)
		table.insert(t, tb)
	end
	return t
end

function Items:_SplitTable(pString, pPattern)
   local Table = {}  -- NOTE: use {n = 0} in Lua-5.0
   local fpat = "(.-)" .. pPattern
   local last_end = 1
   local s, e, cap = pString:find(fpat, 1)
   while s do
      if s ~= 1 or cap ~= "" then
     table.insert(Table,cap)
      end
      last_end = e+1
      s, e, cap = pString:find(fpat, last_end)
   end
   if last_end <= #pString then
      cap = pString:sub(last_end)
      table.insert(Table, cap)
   end
   return Table
end

function Items:_SubParseStat(stat, value, slot, ilvl)
	if string.sub(stat, 1, 2) == "if" then
		--for token in string.gmatch(stat, "[^%s]+") do
		local hasPassed = 0
		for k,token in pairs(Items:_SplitTable(stat, " ")) do
			if token ~= "if" then
				if token == "or" then
					if hasPassed == 1 then
						goto good
					else
						hasPassed = 3
					end
				elseif token == "and" then
					if hasPassed == -1 then
						return 
					else
						hasPassed = -1
					end
				elseif Items:_PassesRequirements(token,slot,ilvl) then
					if hasPassed == 0 then
						hasPassed = 1
					elseif hasPassed == -1 then
						return 
					elseif hasPassed == 3 then
						goto good
					end
				else
					hasPassed = -1
				end
			end
		end
		if hasPassed == -1 then
			return
		end
		::good::
		return Items:_SubParseTable(value, slot, ilvl)
	elseif tonumber(stat) and type(value) == "table" then
		return Items:_SubParseTable(value, slot, ilvl)
	else
		if type(value) ~= "table" then
			value = {range=value}
		end
		value.distribution = value.distribution or "even"
		value.weight = value.weight or 1
		value.clvl = value.clvl or ilvl
		return {key=stat, value=value}
	end
end

function Items:_BakeTables(tbl)
	for k,_ in pairs(tbl) do
		if k == "key" then
			return {b= tbl}
		end
	end
	local t = {}
	for _,v in pairs(tbl) do
		if type(v) == "table" then
			local tbl2 = Items:_BakeTables(v)
			for k,v in pairs(tbl2) do
				table.insert(t, v)
			end
		else
			print("INVALID SOMETHING : " .. tostring(tbl))
		end
	end
	return t
end

local it = LoadKeyValues("scripts/npc/custom_item_manifest.txt")
function Items:_GetDefinedProperty(property, slot, ilvl)
	return Items:_BakeTables(Items:_SubParseTable(it.groups[property], slot, ilvl))
end

function Items:GenerateStats(item) --Generates the custom stats of an item
	--print("Generate Stats : " .. item:GetAbilityName())
	local abilTable = GameRules.ItemDataTable[item:GetEntityIndex()]
	local itemTb = GameRules.itemTable[item:GetAbilityName()]
---	PrintTable(abilTable)
	if abilTable.CustomStatsCompiled then return end
	abilTable.CustomStatsCompiled = {}
	for _,v in pairs(abilTable.CustomStats) do
		for k,vv in pairs(v) do
			if k == "DefinedProperty" then
				local t = Items:_GetDefinedProperty(vv, itemTb.Slot, 5)
				local combinedWeight = 0
				for k,v in pairs(t) do
					combinedWeight = combinedWeight + tonumber(v.value.weight)
				end
				
				local i = RandomFloat(0, combinedWeight)

				local lastWeight = 0
				local target = 0
				for k,v in pairs(t) do
					target = v
					if lastWeight + tonumber(v.value.weight) >= i then
						break
					end
					lastWeight = lastWeight + tonumber(v.value.weight)
				end

				for k,v in pairs(it.psuedostats) do
					if k == target.key then
						local count = 0
						for _,_ in pairs(v) do
							count = count + 1
						end
						local rand = RandomInt(1, count)
						if rand < 10 then
							rand = "0" .. rand
						else
							rand = "" .. rand
						end
						target.key = v[rand]
					end
				end
				if target then
					local min = string.find(target.value.range, " ")
					local value = 0
					if min then
						local minVal = tonumber(string.sub(target.value.range, 1, min-1))
						local maxVal = tonumber(string.sub(target.value.range, min+1, string.len(vv)))
						value = RandomInt(minVal, maxVal)
					else
						value = target.value.range
					end

					for key,vvv in pairs(abilTable.CustomStatsCompiled) do
						if key == target.key then
							abilTable.CustomStatsCompiled[key] = vvv + value
							goto skip
						end
					end	
			
					abilTable.CustomStatsCompiled[target.key] = value
					::skip::

				else
					print("[ERROR] INVALID TARGET")
				end
			else
				if type(vv) == "table" then goto doubleskip end
			--	print("hi")
			--	PrintTable(vv)
				local min = string.find(vv, " ")
				local minVal = tonumber(string.sub(vv, 1, min-1))
				local maxVal = tonumber(string.sub(vv, min+1, string.len(vv)))
				local value = RandomInt(minVal, maxVal)
			--	print(k .. ":" .. value)

				for key,vvv in pairs(abilTable.CustomStatsCompiled) do
					if key == k then
						vvv = vvv + value
						goto skip
					end
				end	
		
				abilTable.CustomStatsCompiled[k] = value
			end
			::skip::
		end
		:: doubleskip ::
	end

end

function Items:IdentifyItem(item)
	GameRules.ItemDataTable[item:GetEntityIndex()].ided = true
	if not GameRules.ItemDataTable[item:GetEntityIndex()] then
		Items:GenerateStats(item)
	end
end

function Items:OrderIdentify(unit, item)

end
