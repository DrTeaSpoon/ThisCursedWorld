--stats to handle:
-- fire/ice/cold/light/spell/magic dmg/res
--evas rating/hit rating/spell that
-- bounty gold/xp
require("bonus")

	  GameRules.asd = LoadKeyValues("scripts/npc/npc_abilities_custom.txt")
if not StatHandler then
	--print("STAT HANDLER INIT")
	StatHandler = {}
	if not GameRules.itemTable then
	  GameRules.itemTable = LoadKeyValues("scripts/npc/items.txt")
	  local tempTable = LoadKeyValues("scripts/npc/npc_items_custom.txt")
	  for k,v in pairs(tempTable) do
	    GameRules.itemTable[k] = v
	  end
	  GameRules.unitTable = LoadKeyValues("scripts/npc/units.txt") or {}
	  local tempTable = LoadKeyValues("scripts/npc/npc_units_custom.txt")
	  for k,v in pairs(tempTable) do
	    GameRules.unitTable[k] = v
	  end
	 end
    GameRules.shopTable = LoadKeyValues("scripts/shops.txt")
	ListenToGameEvent('npc_spawned', Dynamic_Wrap(StatHandler, 'OnNPCSpawned'), StatHandler)
    ListenToGameEvent('entity_killed', Dynamic_Wrap(StatHandler, 'OnEntityKilled'), StatHandler)
	
end

function StatHandler:FindClearSpaceInTrigger(unit, trigger)
	
end

function StatHandler:MoveToNext(unit, trigger)

end

function StatHandler:OnNPCSpawned(keys)
  --print("/////////////SPAWN///////////")
  local npc = EntIndexToHScript(keys.entindex)
  Bonus.InitializeBonus(npc)
  self:CreateStatsFromTable(npc)
  --print("/////////////DONE SPAWN///////////")

end


function StatHandler:OnEntityKilled(keys)
 -- print("/////////////KILL///////////")
  local killedUnit = EntIndexToHScript( keys.entindex_killed )
 -- print("On Entity Killed")
  if killedUnit.BonusTable and killedUnit.BonusTable.RespawnTime then
  --	print("Has respawn Time : " .. killedUnit.BonusTable.RespawnTime)
  	local name = killedUnit:GetUnitName()
  	local team = killedUnit:GetTeam()
  	local pos = killedUnit.BonusTable.OriginalPosition
  	local time = killedUnit.BonusTable.RespawnTime
  	Timers:CreateTimer(time, function()
 	--	   print("/////////////SPAWN 2///////////")
  	--		print("Spawned!" .. time)
  			CreateUnitByName(name, pos, false, nil, nil, team) --[[Returns:handle
  			Creates a DOTA unit by its dota_npc_units.txt name ( szUnitName, vLocation, bFindClearSpace, hNPCOwner, hUnitOwner, iTeamNumber )
  			]]
 	--	   print("/////////////done SPAWN 2///////////")
  		end)
  end
  --print("/////////////DONE KILL///////////")

end
local function parse(unit, stat, value)
	if type(value) ~= "string" then
		unit["SetBonus"..stat](unit,value)
	elseif string.find(value, " ") then
		local i = string.find(value,"-")
		local ib = string.find(value,"+")
		local ic = string.find(value," ")
		if not ib then
			print("ERROR : IB NOT FOUND ", stat)
		end

		if i then
			local id = string.find(value,"-",i+1)

			local first = tonumber(string.sub(value, 1, i-1))
			local second = tonumber(string.sub(value, i+1, ic-1))
			local third = tonumber(string.sub(value, ib+1, id-1))
			local fourth = tonumber(string.sub(value, id+1))

			--PrintTable(unit)
			unit["SetBonus"..stat.."Minimum"](unit,first + third * unit:GetLevel())
			unit["SetBonus"..stat.."Maximum"](unit,second + fourth * unit:GetLevel())

		else

			local first = tonumber(string.sub(value, 1, ic))
			local third = tonumber(string.sub(value, ib))


			unit["SetBonus"..stat](unit,first + third * unit:GetLevel())

		end
	else
		local i = string.find(value,"-")
		if i then
			local prev = tonumber(string.sub(value, 1, i-1))
			local nex = tonumber(string.sub(value, i+1))

			unit["SetBonus"..stat.."Minimum"](unit, prev)
			unit["SetBonus"..stat.."Maximum"](unit, nex)
		else
			unit["SetBonus"..stat](unit,tonumber(value))
		end
	end
end

function StatHandler:CreateStatsFromTable(unit)
	--print("CREATE STATS FROM TABLE")
	if not GameRules.unitTable then return end
--	print("CREATE STATS FROM TABLE1")
	local unitTable = GameRules.unitTable[unit:GetUnitName()]
	if not unitTable then return end
	--print("CREATE STATS FROM TABLE2 .. " .. unit:GetUnitName())
	if not unit:IsRealHero() and unitTable.RespawnTime then
	--	print("Has Respawn Time")
		unit.BonusTable.RespawnTime = unitTable.RespawnTime
		Timers:CreateTimer(function() unit.BonusTable.OriginalPosition = unit:GetAbsOrigin() end)
		--print(unit:GetAbsOrigin())
		for _,v in pairs(Bonus.KVStats) do
			if unitTable[v] then
				parse(unit, v, unitTable[v])
			end
		end
	else
		--print("HERO TIME : ", unit:IsRealHero(), unitTable.RespawnTime)
		--PrintTable(unitTable)
	end
end