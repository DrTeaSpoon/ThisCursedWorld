-- This is the entry-point to your game mode and should be used primarily to precache models/particles/sounds/etc

require('internal/util')
require('quest/interact')
require('quest/quest')
require('bonus')
require('mmoui')
require('spawn/statHandler')
require('libraries/CosmeticLib')

SetupQuests = function()
  quest_setup = true
  local npc = NPC.create("Simonsen")
  npc:apply(NPC.named("first_npc_traveller"))
  CosmeticLib:ReplaceWithSlotName(NPC.named("first_npc_traveller"), "weapon", 5447)
  
  local testQuest = Quest.create("sampleQuest2")
  local test2 = Quest.create("sampleQuest")

  Bonus.InitializeBonus(NPC.named("first_npc_traveller"))
end
GameRules:SendCustomMessage("hi", 0, 0)
if quest_setup then
  SetupQuests()
end