require("libraries/timers")

local ResetEventListeners
if not Interact then
	Interact = {}
	INTERACT_NPCs = {}
	ResetEventListeners = true
else
	ResetEventListeners = false
end


local REFRESH_RATE = 0.5
local RADIUS = 200
local tickers = {}
INTERACT_LastInteractUnit = {}
local range = function(a, b, step)
  if not b then
    b = a
    a = 1
  end
  step = step or 1
  local f =
    step > 0 and
      function(_, lastvalue)
        local nextvalue = lastvalue + step
        if nextvalue <= b then return nextvalue end
      end or
    step < 0 and
      function(_, lastvalue)
        local nextvalue = lastvalue + step
        if nextvalue >= b then return nextvalue end
      end or
      function(_, lastvalue) return lastvalue end
  return f, nil, a - step
end

local function shallowcopy(orig)
    local orig_type = type(orig)
    local copy
    if orig_type == 'table' then
        copy = {}
        for orig_key, orig_value in pairs(orig) do
            copy[orig_key] = orig_value
        end
    else -- number, string, boolean, etc
        copy = orig
    end
    return copy
end
local GenerateQuestStart = function(questName, questDesc, fireId)
	return {
		img="/exclamation",
		text="<tag:\"orangeHighlight\">[QUEST] " .. questName,
		goto={
			text=questDesc,
			portraitFx="",
			options={
				first={
					text="<tag:\"lightGreenHighlight\">Accept Quest",
					img="/check",
					fireId=fireId,
					goto={
						shortcut="root$refresh"
					}	
				},
				second={
					text="<tag:\"lightRedHighlight\">Maybe Later",
					img="/stop",
					goto={
						shortcut="root"
					}	
				}
			} 
		}
	}
end

local GenerateQuestComplete = function(questName, questThanks, fireId)
	return {
		img="/exclamation",
		text="<tag:\"greenHighlight\">[QUEST] " .. questName,
		goto={
			text=questThanks,
			portraitFx="",
			options={
				first={
					text="<tag:\"greenHighlight\">Claim Rewards",
					img="/check",
					fireId=fireId,
					goto={
						shortcut="root$refresh"
					}	
				}
			} 
		}
	}
end

local GenerateQuestTalk = function(questName, questChat, options, fireId)

	return {
		img="/exclamation",
		text="<tag:\"yellowHighlight\">[QUEST] " .. questName,
		id=fireId,
		goto={
			text=questChat,
			portraitFx="",
			options=type(options) == "table" and options or {
				first={
					text="Okay.",
					img="/chat",
					fireId=fireId
				}
			} 
		}
	}
end

INTERACT_last={}

local onEnter = function(npcTable, npc, target)
	local player = target:GetPlayerOwnerID()
	if npc:Attribute_GetIntValue("Interact::WindowShown", 0) == 0 then
		npc:Attribute_SetIntValue("Interact::WindowShown", 1)
		if INTERACT_LastInteractUnit[player] then
			INTERACT_LastInteractUnit[player]:Attribute_SetIntValue("Interact::WindowShown", 0)
		end
		INTERACT_LastInteractUnit[player] = npc
	end 
	INTERACT_last[player] = INTERACT_last[player] or {}
	INTERACT_last[player].tbl = npcTable
	INTERACT_last[player].unit = npc
	INTERACT_last[player].target = target
	local tbl = Quest.OnInteractGetOptions(npc,player)
	local oldOptions = npcTable.options
	local tblUse = npcTable.options
	if tbl then
		tblUse = shallowcopy(tblUse)
		for k,v in pairs(tbl) do
			if v.type == "starter" then
				local t = GenerateQuestStart(v.name,v.desc,v.id)
				table.insert(tblUse, t)
			elseif v.type == "complete" then
				local t = GenerateQuestComplete(v.name,v.desc,v.id)
				table.insert(tblUse, t)
			elseif v.type == "interact" then
				local t = GenerateQuestTalk(v.name,v.chat, v.options, v.id)
				table.insert(t.goto.options, v.id)
				table.insert(tblUse, t)
			end
		end
		--Table(tblUse)
		npcTable.options = tblUse
	end
	CustomNetTables:SetTableValue( "quest", "show", {player=player, show=false} );
	CustomGameEventManager:Send_ServerToAllClients("interact_show", {player=player, show=true, name=npc:GetUnitName()})   
    CustomGameEventManager:Send_ServerToAllClients("interact_set_flags", {player=player,name=npcTable.name, portrait=npcTable.portrait, text=npcTable.text, options=npcTable.options})   
    npcTable.options = oldOptions 

end

local SendLastNPC = function(player)
	if not INTERACT_last[player] then return end
	onEnter(INTERACT_last[player].tbl, INTERACT_last[player].unit, INTERACT_last[player].target )
end

local onExit = function(npcTable, npc, target)
	if npc:Attribute_GetIntValue("Interact::WindowShown", 1) == 1 then
		CustomNetTables:SetTableValue( "quest", "show", {player=target:GetPlayerOwnerID(), show=true} );
   		CustomGameEventManager:Send_ServerToAllClients("interact_show", {player=target:GetPlayerOwnerID(), show=false, name=npc:GetUnitName()})   
   		npc:Attribute_SetIntValue("Interact::WindowShown", 0)
   		INTERACT_LastInteractUnit[target:GetPlayerOwnerID()] = nil
	end
end

INTERACT_marks = INTERACT_marks or {types={}}


local addMark = function(unit, typeOf,player)
	local mark = nil
	local markParticle = nil
	INTERACT_marks[unit.__self].types[player] = typeOf
	if typeOf == "turnin" then
		mark = "particles/quest_handin_green.vpcf"
	elseif typeOf == "start" then
		mark = "particles/quest_mark_yellow.vpcf"
	elseif typeOf == "startMain" then
		mark = "particles/quest_mark_yellow.vpcf"
	elseif typeOf == "talk" then
		mark = "particles/quest_mark_yellow.vpcf"
	else
		mark = "particles/quest_mark_yellow.vpcf"
	end

		--mark = "particles/quest_handin_green.vpcf"
	--	mark = "particles/quest_handin_green.asdf"
	if not player then
		markParticle = ParticleManager:CreateParticle(mark, PATTACH_OVERHEAD_FOLLOW, unit)
		INTERACT_marks[unit.__self].global = markParticle
	else
	--	markParticle = ParticleManager:CreateParticleForPlayer(mark, PATTACH_OVERHEAD_FOLLOW, unit, PlayerResource:GetPlayer(player))
		print('Unit : ' .. unit:GetUnitName())
		markParticle = ParticleManager:CreateParticle(mark, PATTACH_OVERHEAD_FOLLOW, unit)
		INTERACT_marks[unit.__self][player] = markParticle
	end
	return markParticle

end

local removeMark = function(unit,player)
	if player then
		if INTERACT_marks[unit.__self] then
			ParticleManager:DestroyParticle(INTERACT_marks[unit.__self][player], false)
			INTERACT_marks[unit.__self][player] = nil
		end
	else
		ParticleManager:DestroyParticle(INTERACT_marks[unit.__self].global, false)
		INTERACT_marks[unit.__self].global = nil
	end
end

local addMarkType = function(unit,player)
end
local removeMarkType = function(unit,player)
end


local onPeriodic = function()
	for k,v in pairs(INTERACT_NPCs) do
		local tabl = v
		v = v.unit
		local npcUnit = v
		if not v or v:IsNull() then
			break
		end
		--print("UNIT : " .. v:GetUnitName() )
		INTERACT_marks[v.__self] = INTERACT_marks[v.__self] or {types={}}
		--for i in range(0,9) do
		--	if PlayerResource:IsValidPlayer(i) then
		--		if tabl.hasComplete[i] == true then
		--			if INTERACT_marks[v.__self].types[i] and INTERACT_marks[v.__self].types[i] ~= "turnin" then
		--				removeMark(v,nil,i)
		--			end
		--			if not INTERACT_marks[v.__self][i] then
		--				addMark(v,"turnin",i)
		--			end
		--		elseif tabl.hasNew[i] == true then
		--			if not INTERACT_marks[v.__self][i] then
		----				addMark(v,nil,i)
		--			end
		----		elseif INTERACT_marks[v.__self][i] then
		--			removeMark(v,i)
		--		end
		--	end
		--end


		local units = FindUnitsInRadius(0, v:GetAbsOrigin(), nil, RADIUS, DOTA_UNIT_TARGET_TEAM_BOTH, DOTA_UNIT_TARGET_ALL, DOTA_UNIT_TARGET_FLAG_PLAYER_CONTROLLED, 0, true)
		local pid = v.__self;
		tickers[pid] = tickers[pid] or {}
		local used = tickers[pid]
		local slateRemovalT = {}
		local slateRemovalU = {}
		for k,v in pairs(used) do
			for kk,vv in pairs(units) do
				if v==vv then
					slateRemovalU[kk] = vv
					slateRemovalT[k] = v
					break
				end
			end
		end
		for kk,vv in pairs(slateRemovalU) do
			table.remove(units, kk)
		end
		local u = nil
		for k,v in pairs(units) do
			table.insert(used, v)
			if v["AddExperience"] then 
				onEnter(tabl.table,npcUnit,v)
				u=v
			end
		end

		for k,v in pairs(units) do
			table.remove(used, k)
		end

		for k,v in pairs(slateRemovalT) do
			table.remove(used, k)
		end


		for k,v in pairs(used) do
			onExit(tabl.table,npcUnit,v)
			table.remove(used, k)
			if v:Attribute_GetIntValue("Interact::WindowShown", 1) then
				--hide
				v:Attribute_SetIntValue("Interact::WindowShown", 0)
			end
		end

		for k,v in pairs(units) do
			table.insert(used, v)
		end
		for k,v in pairs(slateRemovalT) do
			table.insert(used, v)
		end


	end

	return REFRESH_RATE
end

InteractAddQuestStarter = function(npc, questName, questDesc, id)
	for k,v in pairs(INTERACT_NPCs) do
		if v.unit:GetUnitName() == npc then
			local t = GenerateQuestStart(questName,questDesc,id)
			table.insert(v.table.options,t)
		end 
	end 
end


AddPendingQuest = function(target, questName, player, tag)
	for k,v in pairs(INTERACT_NPCs) do
		if v.unit== target then
			if not player then
			--	v.hasNew.global = true
			else
				print("Add Pending : " .. target:GetUnitName() .. ":" .. v.unit:GetUnitName())
				INTERACT_marks[v.unit.__self] = INTERACT_marks[v.unit.__self] or {types={}}
				v.hasNew[player] = (v.hasNew[player] or 0) + 1
				print("Has New : " .. v.hasNew[player])
				v.hasComplete[player] = v.hasComplete[player] or 0

				if v.hasNew[player] == 1 then
					if v.hasComplete[player] <= 0 then

						addMark(v.unit, nil, player)
					end
				end
			end
		end
	end
end

AddPendingComplete = function(target, questName, player)
	for k,v in pairs(INTERACT_NPCs) do
		if v.unit == target then
			if not player then
			--	v.hasComplete.global = true
			else
				INTERACT_marks[v.unit.__self] = INTERACT_marks[v.unit.__self] or {types={}}
				v.hasComplete[player] = (v.hasComplete[player] or 0) + 1
				v.hasNew[player] = v.hasNew[player] or 0

				if v.hasComplete[player] == 1 then
					if v.hasNew[player] > 0 then
						removeMark(v.unit, player)
					end
					addMark(v.unit, "turnin", player)
				end
			end
		end
	end
end
RemovePendingQuest = function(target, questName, player)
	for k,v in pairs(INTERACT_NPCs) do
		if v.unit == target then
			if not player then
			--	v.hasNew.global = false
			else
				print("Remove Pending : " .. v.unit:GetUnitName())
				INTERACT_marks[v.unit.__self] = INTERACT_marks[v.unit.__self] or {types={}}
				v.hasNew[player] = (v.hasNew[player] or 0) - 1
				print("Remove ID : " .. v.hasNew[player])
				v.hasComplete[player] = v.hasComplete[player] or 0

				if v.hasNew[player] == 0 then
					if v.hasComplete[player] <= 0 then
						removeMark(v.unit, player)
					end
				end
			end
		end
	end
end
RemovePendingComplete = function(target, questName, player)
	for k,v in pairs(INTERACT_NPCs) do
		if v.unit == target then
			if not player then
			--	v.hasComplete.global = false
			else
				INTERACT_marks[v.unit.__self] = INTERACT_marks[v.unit.__self] or {types={}}
				v.hasComplete[player] = (v.hasComplete[player] or 0) - 1
				v.hasNew[player] = v.hasNew[player] or 0

				if v.hasComplete[player] == 0 then
					removeMark(v.unit, player)
					if v.hasNew[player] > 0 then
						addMark(v.unit, nil, player)
					end
				end
			end
		end
	end
end

local optionsCourier = {
	
}

QuestNPCs = QuestNPCs or {}
QuestNPCTypes = QuestNPCTypes or {}
INTERACT_NPCs = INTERACT_NPCs or {}
InteractListener = InteractListener or {}
Interact = Interact or {}
NPCTypes = NPCTypes or {}

function InteractListener:onInteractRefresh(data)
	SendLastNPC(data.player)
end

function Interact.registerNPC(name)

end

function Interact.registerNPCType(name)

end

NPC = {}
NPC.__index = NPC

function NPC.create(name)
	local tbl = {table = LoadKeyValues("scripts/vscripts/quest/npcs/"..name..".txt")}
	setmetatable(tbl, NPC)
	return tbl
end

function NPC:apply(npc)
	print("NPC : ", npc:GetUnitName())
	if not npc then
		print("[ERROR] [Interact] Null NPC Passed")
	end
	table.insert(INTERACT_NPCs, {unit=npc, table=self.table, hasNew={}, hasComplete={}, lastId=-1})
end

function NPC:applyAll(npcname)

end

function NPC:applyType(npcClassName)
		table.insert(INTERACT_NPCs, {unit=npc, table=tbl, hasNew={}, hasComplete={}, lastId=-1})
end

NPC.named = function(name)
	local unit = nil
	
	local b = FindUnitsInRadius(1, Vector(0,0,0), nil, 999999999.0,DOTA_UNIT_TARGET_TEAM_BOTH,DOTA_UNIT_TARGET_ALL,0,-1,false);
	for k,v in pairs(b) do
		if v:GetName() == name then
			return v
		end
	end
end

NPC.firstOf = function(name)
	local unit = nil
	
	local b = FindUnitsInRadius(1, Vector(0,0,0), nil, 999999999.0,DOTA_UNIT_TARGET_TEAM_BOTH,DOTA_UNIT_TARGET_ALL,0,-1,false);
	for k,v in pairs(b) do
		if v:GetUnitName() == name then
			return v
		end
	end
end

function Interact.init()
	local unit = nil
 --[[	while true do
		 unit = Entities:FindByName(unit, "npc_dota_base");
		 if unit == nil then
		 	break
		 end
		 if unit:GetUnitName() == "npc_dota_flying_courier" then
		 	--addMark(unit, "handin")
			table.insert(INTERACT_NPCs, {unit=unit, table=optionsCourier, hasNew={}, hasComplete = {}, lastId=-1})
			break
		end
	end
     ]]--
	CustomGameEventManager:RegisterListener( "interact_refresh_options", Dynamic_Wrap(InteractListener, 'onInteractRefresh'))
end

function Interact.wipe()
	for i in range(0,9) do
		CustomGameEventManager:Send_ServerToAllClients("interact_show", {player=i, show=false, name=""})   
	end
	for k,v in pairs(INTERACT_NPCs) do
		for i in range(0,9) do
			if (v.hasNew[i] ~= nil and v.hasNew[i] > 0) or (v.hasComplete[i] ~= nil and v.hasComplete[i] > 0) then
				removeMark(v.unit, i)
			end
			v.hasNew[i] = 0
			v.hasComplete[i] = 0
		end
	end
	INTERACT_NPCs = {}
end

	Interact.wipe()
	Timers:CreateTimer(onPeriodic)