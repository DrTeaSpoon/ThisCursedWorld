require("quest/questListener")
idCounter = 0
function range(a, b, step)
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

QuestGenerator = {
        name = "",
        started = {},
        enabled = {},
        activeStageNo = {},
        id=0,
        minLevel = 0,
        shouldRunAgain = {},
        active = {},
        pendingComplete={},
        reqsFilled = {},
        minLevel = 0,
        maxPartySize = 2,
        minPartySize = 0,
        stages = {},
        starters = {},
        activeStage = {},
        bounty = {},
        prereqs = {}
      }
  Quest = {
    activeQuests = {}
  }

local GetPlayerHero = function(player)
  --print(PlayerInstanceFromIndex(1):GetAssignedHero():GetUnitName()) --[[Returns:handle
  --Get a script instance of a player by index.
  --]]
  return PlayerResource:GetPlayer(player):GetAssignedHero() --[[Returns:handle
  Get a script instance of a player by index.
  ]]
end

local PlayerReady = function(player)
  return PlayerResource:GetPlayer(player):GetAssignedHero() ~= nil
end

local function deepcopy(o, seen)
  seen = seen or {}
  if o == nil then return nil end
  if seen[o] then return seen[o] end

  local no
  if type(o) == 'table' then
    no = {}
    seen[o] = no

    for k, v in next, o, nil do
      no[deepcopy(k, seen)] = deepcopy(v, seen)
    end
    setmetatable(no, deepcopy(getmetatable(o), seen))
  else -- number, string, boolean, etc
    no = o
  end
  return no
end


function Quest:HandleRewards(stt,i)
  for k,v in pairs(stt) do
    if k == "expReward" then
      GetPlayerHero(i):AddExperience(v,0,false,false)
    elseif k == "goldReward" then
      PlayerResource:ModifyGold(i, v, true, 0)
    elseif k == "itemReward" then
      if type(v) == "table" then
        local hero = GetPlayerHero(i)
        for kk,vv in pairs(v) do
          local item = CreateItem(kk, hero, hero)
          if vv > 1 then
            item:SetCurrentCharges(vv)
          end
          hero:AddItem(item)
        end
      else
        local hero = GetPlayerHero(i)
        if string.find(v, " ") then 
          local charges = string.sub(v, 0, string.find(v, " "))
          local item = CreateItem(string.sub(v,string.find(v," ")+1, string.len(v)), hero, hero)
          item:SetCurrentCharges(charges)
          hero:AddItem(item)
        else
          hero:AddItem(CreateItem(v, hero, hero))
        end
      end
    elseif k == "questEnable" then
      for kk,vv in pairs(Quest.activeQuests) do
        if vv.name == v then
          vv.enabled[i] = true
          vv:updatePrereqs()
        end
      end
    end
  end
end
idc = 0

QuestGenerator.__index = QuestGenerator

--QuickClass(QuestGenerator);

local unitHasItem = function(unit, itemName, charges)
  local count = 0
  for i in range(0,5) do
    local item = unit:GetItemInSlot(i)
    if item then
      if item:GetAbilityName() == itemName then
        if not charges then return true end
        count= count + (item:GetCurrentCharges() < 1 and 1 or item:GetCurrentCharges() )
        if count > charges then return true end
      end
    end
  end
  return false
end

function QuestGenerator:startNextStage(player)
  idc = idc + 1
  self.iddd = idc

  self.activeStageNo[player] = (self.activeStageNo[player] or 0) + 1
  self.active[player] = true
  CustomGameEventManager:Send_ServerToAllClients("quest_flag", {flag="clearLines",id=self.id, player=player})  
  if self.activeStage[player] then
    local stage = self.stages["Stage"..self.activeStageNo[player]]
    if stage then
      self.activeStage[player] = stage
    else
      stage = self.stages.Turnin
      if stage and not self.pendingComplete[player] then
        self.activeStage[player] = stage
        self.pendingComplete[player] = true
        self.active[player] = false
        if stage.type == "interactType" then
          AddPendingComplete(NPC.firstOf(stage.target), self.name, player)
        else
          AddPendingComplete(NPC.named(stage.target), self.name, player)
        end
        CustomGameEventManager:Send_ServerToAllClients("quest_flag", {flag="pendingComplete",id=self.id, player=player})  
        CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {id=self.id, lineIndex=0, lineText=self.activeStage[player].text, player=player, flashLine="true", completed="false"});
      else
        if self.activeStage[player].target then
          if self.activeStage[player].type == "interactType" then
            RemovePendingComplete(NPC.firstOf(self.activeStage[player].target), self.name, player)
          else
            RemovePendingComplete(NPC.named(self.activeStage[player].target), self.name, player)
          end
        end
        local stg = self.stages.onFinish
        self.activeStage[player] = {}
        self.activeStageNo[player] = 0
        self.shouldRunAgain[player] = false
        self.active[player] = false
        self.pendingComplete[player] = false
        self.started[player] = false
        Quest.showMessage("Quest Completed : " .. self.name)
        CustomGameEventManager:Send_ServerToAllClients("quest_flag", {flag="completeWithFade", id=self.id, player=player})  
        if stage then
          Quest:HandleRewards(stg,player)
        end
      end
      --terminate quest
      return
    end

  else
    self.activeStage[player] = self.stages.Stage1
  end

  local i = 0
  for k,v in pairs(self.activeStage[player]) do
    if k == "say" then
      self.activeStage[player][k] = nil
      Say(nil,v,false)
    elseif k == "execute" then
      self.activeStage[player][k] = nil
      local b = loadstring(string.gsub(v,"'","\""))
      if b ~= nil then
       b() 
      else
        print("Error : lua code has invalid syntax formatting : " .. v)
      end
    else    
      v.c_count = v.c_count or {}
      v.c_completed = v.c_completed or {}
      v.c_line = v.c_line or {}
      v.c_count[player] = 0
      v.c_completed[player] = false
      local text = string.gsub(v.text, "%%c", "".. (v.c_count[player] or 0))
      text = string.gsub(text, "%%m", "".. (v.count or 1)) 
      v.c_line[player] = i
      if v.hint then
        CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {player=player,id=self.id, lineIndex=i, lineText=text, hint=v.hint, flashLine="true", completed="false"})   
      else
        CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {player=player,id=self.id, lineIndex=i, lineText=text, flashLine="true", completed="false"})   
      end
      i = i + 1
    end
  end
  --set v_counts for all of them to 0, v_completed to 0
end

function Quest.showMessage(msg)
  Say(nil, msg, false)
end

function Quest.parseLine(line,cur,max)
  return string.gsub(string.gsub(line, "%%c", "".. (cur or 0)), "%%m", "".. (max or 1))
end

function Quest.OnTrigger(hero, triggerName, isEnter)
  local player = hero:GetPlayerOwnerID()
  for k,v in pairs(Quest.activeQuests) do
    if v.active[player] then
      for kk,vv in pairs(v.activeStage[player]) do
        if vv.c_completed and not vv.c_completed[player] and vv.type == (isEnter and "enter" or "exit") and vv.target == triggerName then
          vv.c_completed[player] = true
          CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {player=player,id=v.id, lineIndex=vv.c_line[player], lineText=vv.text, flashLine="true", completed="true"})
          v:updateState(player)
        end
      end
    end
  end
end

function Quest.OnInventoryChanged()
  local tbl = {}
  local tblUsed = false
  for i in range(0,9) do
      if PlayerResource:IsValidPlayer(i) and PlayerReady(i) then
      for k,v in pairs(Quest.activeQuests) do
        if v.started[i] then
          for kk,vv in pairs(v.activeStage[i]) do
            if not vv.c_completed[i] and (vv.type == "item" or vv.type == "itemType") then
              tblUsed = true
              table.insert(tbl, {quest=v, stg=vv, type=vv.target})
            end
          end
        end
      end
      if tblUsed then
        for k,v in pairs(tbl) do
          local prevCount = v.stg.c_count[i]
          v.stg.c_count[i] = 0
          local hero = GetPlayerHero(i)
          for ib in range(0,5) do
            local item = hero:GetItemInSlot(ib)
            if item then
              if item:GetAbilityName() == v.type then
                v.stg.c_count[i] = v.stg.c_count[i] + (item:GetCurrentCharges() < 1 and 1 or item:GetCurrentCharges() )
              end
            end
          end
          if v.stg.c_count[i] ~= prevCount then
            if v.stg.c_count[i] >= v.stg.count then
              v.stg.c_completed[i] = true
              CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {player=i,id=v.quest.id, lineIndex=v.stg.c_line[i], lineText=Quest.parseLine(v.stg.text,v.stg.count,v.stg.count), flashLine="true", completed="true"})
              v.quest:updateState(i)
            else
              CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {player=i,id=v.quest.id, lineIndex=v.stg.c_line[i], lineText=Quest.parseLine(v.stg.text,v.stg.c_count[i],v.stg.count), flashLine="true", completed="false"})
            end
          end
        end
      end
    end
  end
end

function Quest.OnInteract(player, npcName, id)
  for k,v in pairs(Quest.activeQuests) do
    if v.id == id then
      if not v.started[player] then
        v:disableStarters(player)
        v:updateState(player)
        Quest.showMessage("Quest Accepted : " .. v.name)
      elseif v.pendingComplete[player] then
        v:startNextStage(player)
         break
      elseif v.active[player] then
        for kk,vv in pairs(v.activeStage[player]) do
          if vv.type == "interact" or vv.type == "interactType" then
            if vv.target == npcName then -- TODO: WAIT For game engine fixs
              vv.c_completed[player] = true
              print("ME : " .. v.name .. " REMOVING " .. npcName)
              RemovePendingQuest(npcName, v.name, player)
              CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {player=player,id=v.id, lineIndex=vv.c_line[player], lineText=vv.text, flashLine="true", completed="true"})
              v:updateState(player)
            end 
          end
        end
      end
    end
  end
end

function Quest.OnInteractGetOptions(npc, i)
  local tbl = {}
  local tblUsed = false
  for k,v in pairs(Quest.activeQuests) do

    if not v.started[i] and v.shouldRunAgain[i] and v.enabled[i] and v.reqsFilled[i] then
      if v.starters then
        for kk,vv in pairs(v.starters) do
          if (vv.type == "interactType" and vv.target == npc:GetUnitName()) or (vv.type == "interact" and vv.target == npc:GetName()) then
            tblUsed = true
            local bb = {
              type="starter",
              name=v.name,
              desc=v.desc,
              player=i,
              id=100000+v.id
            }
            table.insert(tbl, bb)
          end
        end
      end
    elseif v.pendingComplete[i] then
     if v.activeStage[i].target == npc:GetUnitName() then
        tblUsed = true
        local bb = {
          type="complete",
          name=v.name,
          desc=v.activeStage.thanksText,
          player=i,
          id=100000+v.id
        }
        table.insert(tbl, bb)
      end
    elseif v.activeStage[i] then
      for kk,vv in pairs(v.activeStage[i]) do
        if vv.type == "interact" or vv.type == "interactType" then
          if vv.target == npc:GetUnitName() then
            tblUsed = true
            local bb = {
              type="interact",
              name=v.name,
              chat=vv.chat,
              options=vv.options,
              player=i,
              id=100000+v.id
            }
            table.insert(tbl, bb)
          end
        end
      end
    end
  end
  if tblUsed then
    return tbl
  end
end



function QuestGenerator:OnKill(killed, killer)
  local update = false
  local i = killer:GetPlayerOwnerID()
  --Todo : 
  if not self.activeStage[i] or self.pendingComplete[i] or not self.active[i] then return end
  for k,v in pairs(self.activeStage[i]) do 
    if not ( k == "onTransition" ) and not v.c_completed[i] then
      if v.type == "killType"  then
        if killed:GetUnitName() == v.target then
          update = true
          v.c_count[i] = v.c_count[i] + 1
          local text = string.gsub(v.text, "%%c", "".. (v.c_count[i] or 0))
          text = string.gsub(text, "%%m", "".. (v.count or 1)) 


          if v.count == nil or v.c_count[i] >= v.count then
            v.c_completed[i] = true
            CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {player=i,id=self.id, lineIndex=v.c_line[i], lineText=text, flashLine="true", completed="true"})
          else
            CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {player=i,id=self.id, lineIndex=v.c_line[i], lineText=text, flashLine="true", completed="false"})
          end

        end
      elseif v.type == "killGroup" then
        for kk,vv in pairs(self.groups[v.target]) do
          if kk == killed:GetUnitName() then
            update = true
            v.c_count[i] = v.c_count[i] + (vv.weight or 1)
            local text = string.gsub(v.text, "%%c", "".. (v.c_count[i] or 0))
            text = string.gsub(text, "%%m", "".. (v.count or 1)) 


            if v.count == nil or v.c_count[i] >= v.count then
              v.c_completed[i] = true
              CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {player=i,id=self.id, lineIndex=v.c_line[i], lineText=text, flashLine="true", completed="true"})
            else
              CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {player=i,id=self.id, lineIndex=v.c_line[i], lineText=text, flashLine="true", completed="false"})
            end
          end
        end
      elseif v.type == "kill" then
        if killed:GetName() == v.target then
          update = true
          v.c_count[i] = v.c_count[i] + 1
          local text = string.gsub(v.text, "%%c", "".. (v.c_count[i] or 0))
          text = string.gsub(text, "%%m", "".. (v.count or 1)) 


          if v.count == nil or v.c_count[i] >= v.count then
            v.c_completed[i] = true
            CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {player=i,id=self.id, lineIndex=v.c_line[i], lineText=text, flashLine="true", completed="true"})
          else
            CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {player=i,id=self.id, lineIndex=v.c_line[i], lineText=text, flashLine="true", completed="false"})
          end
        end
      end
    end
  end
  if update then
    self:updateState(i)
  end
  update = false
end

function QuestGenerator.parseQuest(fileName)
	o = LoadKeyValues(fileName) 
    o.id = idCounter
    table.insert(Quest.activeQuests,o)--Quest.activeQuestsinsert.(self)
    o.shouldRunAgain = {}
    idCounter = idCounter + 1
	  setmetatable(o, QuestGenerator)
    o.shouldRunAgain = {}
    o.activeStageNo = {}
    o.activeStage = {}
    o.active = {}
    o.started = {}
    o.pendingComplete = {}
    o.enabled = {}
    o.reqsFilled = {}
    for i in range(0,9) do

      o.shouldRunAgain[i] = true
      o.activeStageNo[i] = 0
      o.activeStage[i] = nil
      o.active[i] = false

      o.started[i] = false
      o.pendingComplete[i] = false
      o.enabled[i] = o.defaultActive == "true"
      o.reqsFilled[i] = false

    end
  if not o.defaultActive then return o end
  if o.prereqs or o.minLevel then
    o:updatePrereqs()
  elseif o.starters then
    for k,v in pairs(o.starters) do
      if v.type == "interact" then
          --AddPendingQuest(v.target, o.name)
   --     InteractAddQuestStarter(v.target, o.name, o.desc, o.minLevel)
      end
    end
  end
	return o 
end
function QuestGenerator:updateState(player)
  if not self.started[player] then
    self.activeStage[player] = nil
    self:startNextStage(player)
    self.started[player] = true  
     CustomGameEventManager:Send_ServerToAllClients("quest_create", {id=self.id, name=self.name, player=player})
          
    return
  end

  local notdone = false
  for k,v in pairs(self.activeStage[player]) do 
    if ( k == "say" ) or (k == "execute") then
    else
      notdone = notdone or not v.c_completed[player]
    end
  end
  if not notdone then
    self:startNextStage(player)
  end
end

local short = function(b,new,tag) --LUA lambdas are glitchy for this stuff
  if tag == "and" then
      return b and new
  else 
      return b or new
  end
end



local ParsePrereqs = function(quest, reqTable, player, tag)
  tag = tag or "and"
  local b = false
  if tag == "and" then
    b = true
  end
  for k,v in pairs(reqTable) do
    if string.sub(k, 1, 2) == "or:" then
      if tag == "and" then
        b = b and ParsePrereqs(quest,v, player, "or")
      else
        b = b or ParsePrereqs(quest,v, player,"or")
      end
    elseif string.sub(k, 1, 3) == "and:" then
      if tag == "and" then
        b = b and ParsePrereqs(quest,v, player)
      else
        b = b or ParsePrereqs(quest,v, player)
      end
    else
      --bah i have to actually parse it now?
      if k == "trigger" then
        b = short(b,(QuestListener.triggerBase[v.target .. ":p" .. player] or QuestListener.triggerBase[v.target]), tag)
      elseif k == "hasItem" or k == "consumeItem" then
        b = short(b, PlayerReady(player) and unitHasItem(GetPlayerHero(player), k.target, k.charges), tag)
      elseif k == "heroIs" then
        b = short(b, PlayerReady(player) and GetPlayerHero(player):GetUnitName() == k.target, tag)
      end 
    end
  end 
  return b
end

function Quest.UpdatePrereqs()
  for k,v in pairs(Quest.activeQuests) do
    v:updatePrereqs();
  end
end 

function QuestGenerator:updatePrereqs()
  for i in range(0,9) do

    if PlayerResource:IsValidPlayer(i) then
      if not self.started[i] and self.prereqs and self.enabled[i] then
        local b = ParsePrereqs(self,self.prereqs, i) and PlayerReady(i) and ((not self.minLevel) or GetPlayerHero(i):GetLevel() >= self.minLevel)
        if b then
          if not self.startersActive then
            Quest.showMessage("Quest " .. self.name .. " Now Available")
            self.enabled[i] = true
            self.reqsFilled[i] = true
            self:enableStarters(i)
          end
        else
          if self.startersActive then
            self:disableStarters(i)
          end
        end
      end
    end
  end
end

function QuestGenerator:enableStarters(player)
  for k,v in pairs(self.starters) do
    if v.type == "interact" then
        AddPendingQuest(NPC.named(v.target), o.name,player)
 --     InteractAddQuestStarter(v.target, o.name, o.desc, o.minLevel)
    elseif v.type == "interactType" then
        print("TARGET : " .. v.target)
        AddPendingQuest(NPC.firstOf(v.target), o.name,player)
    end
  end
end

function QuestGenerator:disableStarters(player)
  --self:enableStarters(player)
  --if true then return end
    for k,v in pairs(self.starters) do
      if v.type == "interact" then
              print("2 ME : " .. self.name .. " REMOVING " .. v.target)
          RemovePendingQuest(NPC.named(v.target), o.name,player)
   --     InteractAddQuestStarter(v.target, o.name, o.desc, o.minLevel)
      elseif v.type == "interactType" then
          RemovePendingQuest(NPC.firstOf(v.target), o.name,player)
      end
    end
end

function Quest.onLevel(level,player)
  for k,v in pairs(Quest.activeQuests) do
    if v.enabled[player] and not v.reqsFilled[player] and v.minLevel <= level then
      v:updatePrereqs()
    end
  end
end

function Quest.updateAll()
  for k,v in pairs(Quest.activeQuests) do
    v:updatePrereqs()
  end
end

function QuestGenerator:pushCountUpdate(line, text)

end

function QuestGenerator:flushInit()
  CustomGameEventManager:Send_ServerToAllClients("quest_create", {name=self.name, id=self.id, players=self.players})
end

function QuestGenerator:flushStage() 
  i = 0;
  for k,v in pairs(self.activeStage) do 
    if not ( k == "onTransition" ) then
      CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {id=self.id, lineIndex=i, lineText=v.text, flashLine="false"})
      if not (v.hint == nil) then
        CustomGameEventManager:Send_ServerToAllClients("quest_set_sub_line", {id=self.id, lineIndex=i, lineSubIndex = 0, lineText=v.hint, flashLine="false"})
      end
      i = i + 1;
    end
  end
end

function QuestGenerator:eventFlush()
--[[
CustomGameEventManager:Send_ServerToAllClients("quest_create", {name="Temp Quest", id=5, players=99}) 
  CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {id=5, lineIndex=0, lineText="11b1b", flashLine="false"})
  CustomGameEventManager:Send_ServerToAllClients("quest_set_sub_line", {id=5, lineIndex=0, lineSubIndex=0, lineText="1s11 bb", flashLine="false"})
  CustomGameEventManager:Send_ServerToAllClients("quest_create", {name="Temp Quest", id=6, players=99}) 
  CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {id=6, lineIndex=0, lineText="11b1b", flashLine="false"})
  CustomGameEventManager:Send_ServerToAllClients("quest_set_sub_line", {id=6, lineIndex=0, lineSubIndex=0, lineText="1s11 bb", flashLine="false"})

  CustomGameEventManager:Send_ServerToAllClients("quest_create", {name="Temp Quest", id=4, players=99}) 
  CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {id=4, lineIndex=0, lineText="11b1b", flashLine="false"})
  CustomGameEventManager:Send_ServerToAllClients("quest_set_sub_line", {id=4, lineIndex=0, lineSubIndex=0, lineText="1s11 bb", flashLine="false"})


  CustomGameEventManager:Send_ServerToAllClients("quest_create", {name="Temp Quest", id=7, players=99}) --
  CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {id=7, lineIndex=0, lineText="11b1b", flashLine="false"})
  CustomGameEventManager:Send_ServerToAllClients("quest_set_sub_line", {id=7, lineIndex=0, lineSubIndex=0, lineText="1s11 bb", flashLine="false"})

  CustomGameEventManager:Send_ServerToAllClients("quest_create", {name="Temp Quest", id=8, players=99}) --
  CustomGameEventManager:Send_ServerToAllClients("quest_set_line", {id=8, lineIndex=0, lineText="11b1b", flashLine="false"})
  CustomGameEventManager:Send_ServerToAllClients("quest_set_sub_line", {id=8, lineIndex=0, lineSubIndex=0, lineText="1s11 bb", flashLine="false"})
 ]]--

end 


function Quest.create(filename)
  return QuestGenerator.parseQuest("scripts/vscripts/quest/quests/"..filename..".txt")
end

function QuestGenerator:activate(activate, player)
  self.active[player] = activate
  self:updatePrereqs()
end
HasQuestInit = HasQuestInit or {has = false}
function Quest.initScripts()
  for i in range(0,9) do
    CustomGameEventManager:Send_ServerToAllClients("quest_flag", {flag="clearAll",id=0, player=i})  
  end
  --a = QuestGenerator.parseQuest("scripts/vscripts/quest/sampleQuest2.txt")
  --a = QuestGenerator.parseQuest("scripts/vscripts/quest/sampleQuest.txt")

    --local newItem = CreateItem("item_potion_of_healing", nil, nil)
     --   hell1 = Vector(0, 0, 40)
     --   CreateItemOnPositionSync(hell1, newItem)

end

function Quest.init()
  print("[QUEST] Init")
  HasQuestInit.has = true
  Quest.initScripts()
end



if HasQuestInit.has then
  Quest.initScripts()
end