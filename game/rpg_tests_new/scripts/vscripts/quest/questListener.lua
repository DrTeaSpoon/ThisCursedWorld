globalIndex = (globalIndex or -1) + 1
local localIndex = globalIndex + 1
local flop = false
if not QuestListener then
	QuestListener = {}


	function QuestListener.registerEvents()
		--local n = CDotaQuest:new()
		--n:SetTextReplaceString("HorzArrow(Vector a, Vector b, float c, int d, int")
		ListenToGameEvent("dota_player_gained_level", Dynamic_Wrap(QuestListener, 'OnLevelUp'), QuestListener)
		ListenToGameEvent("dota_item_picked_up", Dynamic_Wrap(QuestListener, 'OnItemPickedUp'), QuestListener)
		ListenToGameEvent("entity_killed", Dynamic_Wrap(QuestListener, 'onUnitDeath'), QuestListener)

		CustomGameEventManager:RegisterListener( "interact_click_option_new", Dynamic_Wrap(QuestListener, 'onInteractFire'))
		CustomGameEventManager:RegisterListener( "inventory_updated", Dynamic_Wrap(QuestListener, 'OnInventoryChanged'))
	end
	QuestListener.registerEvents()
end

function QuestListener:onRandomEvent(keys)
	localIndex = localIndex + 1
	if flop then
		flop = false
	else
		flop = true
	end
end

function QuestListener:OnLevelUp(keys)
	Quest.onLevel(keys.level, keys.player-1)
end


function QuestListener:onInteractFire(keys)

	if keys.player then 

	end
	if keys.id >= 100000 then
		--TODO : when volvo fixes sending CustomGameEvent strings
		--Quest.OnInteract(0, keys.name, keys.id - 100000)
		Quest.OnInteract(keys.player, INTERACT_LastInteractUnit[keys.player]:GetUnitName(), keys.id - 100000)
	end
end

function QuestListener:OnItemPickedUp(keys)

  local heroEntity = EntIndexToHScript(keys.HeroEntityIndex)
  local itemEntity = EntIndexToHScript(keys.ItemEntityIndex)
  local player = PlayerResource:GetPlayer(keys.PlayerID)
  local itemname = keys.itemname
end


function QuestListener:OnInventoryChanged(keys)
	Quest.OnInventoryChanged()
end
function QuestListener:onUnitDeath(keys)
	local killedUnit = EntIndexToHScript( keys.entindex_killed )
	local killerEntity = nil

	if keys.entindex_attacker ~= nil then
	  killerEntity = EntIndexToHScript( keys.entindex_attacker )
	end
	if Quest ~= nil then
		for k,v in pairs(Quest.activeQuests) do
			v:OnKill(killedUnit, killerEntity)
		end
	end
end
