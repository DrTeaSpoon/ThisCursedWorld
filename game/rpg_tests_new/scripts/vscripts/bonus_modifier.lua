bonus_modifier = class({})

function HandleToString(userData)
	local d = {}
	d[userData.__self] = 0
	for k,v in pairs(d) do
		return k
	end
end

function bonus_modifier:DeclareFunctions()
	local funcs = {
		func1 = MODIFIER_PROPERTY_BASEATTACK_BONUSDAMAGE,
		func2 = MODIFIER_PROPERTY_ATTACKSPEED_BONUS_CONSTANT,
		func3 = MODIFIER_PROPERTY_PHYSICAL_ARMOR_BONUS,
		func4 = MODIFIER_PROPERTY_EXTRA_HEALTH_BONUS,
		func5 = MODIFIER_PROPERTY_EXTRA_HEALTH_PERCENTAGE,
		func6 = MODIFIER_PROPERTY_HEALTH_REGEN_CONSTANT,
		func7 = MODIFIER_PROPERTY_HEALTH_REGEN_PERCENTAGE,
		func8 = MODIFIER_PROPERTY_EXTRA_MANA_BONUS,
		func9 = MODIFIER_PROPERTY_MANA_REGEN_CONSTANT,
		func10 = MODIFIER_PROPERTY_MANA_REGEN_PERCENTAGE,
		func11 = MODIFIER_PROPERTY_STATS_STRENGTH_BONUS,
		func12 = MODIFIER_PROPERTY_STATS_INTELLECT_BONUS,
		func15 = MODIFIER_PROPERTY_STATS_AGILITY_BONUS,
		func13 = MODIFIER_PROPERTY_MOVESPEED_BONUS_CONSTANT,
		func14 = MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE
	}
	return funcs
end
function PrintTable(t, indent, done)
  --print ( string.format ('PrintTable type %s', type(keys)) )
  if type(t) ~= "table" then return end

  done = done or {}
  done[t] = true
  indent = indent or 0

  local l = {}
  for k, v in pairs(t) do
    table.insert(l, k)
  end

  table.sort(l)
  for k, v in ipairs(l) do
    -- Ignore FDesc
    if v ~= 'FDesc' then
      local value = t[v]

      if type(value) == "table" and not done[value] then
        done [value] = true
        print(string.rep ("\t", indent)..tostring(v)..":")
        PrintTable (value, indent + 2, done)
      elseif type(value) == "userdata" and not done[value] then
        done [value] = true
        print(string.rep ("\t", indent)..tostring(v)..": "..tostring(value))
        PrintTable ((getmetatable(value) and getmetatable(value).__index) or getmetatable(value), indent + 2, done)
      else
        if t.FDesc and t.FDesc[v] then
          print(string.rep ("\t", indent)..tostring(t.FDesc[v]))
        else
          print(string.rep ("\t", indent)..tostring(v)..": "..tostring(value))
        end
      end
    end
  end
end
local Get = function(unit, key)

	if IsServer() then
		return unit:GetParent().BonusTable[key]
	else
		local tbl = CustomNetTables:GetTableValue("bonus", key)
		if tbl then
			return tbl[string.format("%d", unit:GetParent():GetEntityIndex())] or 0
		else
			return 0
		end
	end
end

function bonus_modifier:GetModifierBaseAttack_BonusDamage(k)
	--self.dmgInc = (self.dmgInc or 0) + 1
	--print("HI")
	return Get(self,"Damage")
end

function bonus_modifier:GetModifierAttackSpeedBonus_Constant(k)
	return Get(self,"AttackSpeed")
	--return self:GetParent().BonusTable.aspd
end

function bonus_modifier:GetModifierExtraHealthBonus(k)
	return Get(self, "Health")
	--return self:GetParent().BonusTable.life
end

function bonus_modifier:GetModifierExtraHealthPercentage(k)
	return Get(self, "HealthPercent")
	--return self:GetParent().BonusTable.lifePercent
end

function bonus_modifier:GetModifierConstantHealthRegen(k)
	return Get(self, "HealthRegenConstant")
	--return self:GetParent().BonusTable.lifeRegenConstant
end

function bonus_modifier:GetModifierHealthRegenPercentage(k)
	return Get(self, "HealthRegenPercent")
	--return self:GetParent().BonusTable.lifeRegenPercentage
end

function bonus_modifier:GetModifierExtraManaBonus(k)
	return Get(self, "Mana")
	--return self:GetParent().BonusTable.mana
end

function bonus_modifier:GetModifierConstantManaRegen(k)
	return Get(self, "ManaRegenConstant")
	--return self:GetParent().BonusTable.manaRegenConstant
end

function bonus_modifier:GetModifierPercentageManaRegen(k)
	return Get(self, "ManaRegenPercent")
	--return self:GetParent().BonusTable.manaRegenPercent
end

function bonus_modifier:GetModifierBonusStats_Strength(k)
	return Get(self, "Strength")
	--return self:GetParent().BonusTable.str
end

function bonus_modifier:GetModifierBonusStats_Agility(k)
	return Get(self, "Agility")
	--return self:GetParent().BonusTable.agi
end

function bonus_modifier:GetModifierBonusStats_Intellect(k)
	return Get(self, "Intelligence")
	--return self:GetParent().BonusTable.int
end

function bonus_modifier:GetModifierMoveSpeedBonus_Percentage(k)
	return Get(self, "MoveSpeedPercent")
	--return self:GetParent().BonusTable.mspdPercent
end


function bonus_modifier:GetModifierMoveSpeedBonus_Constant(k)
	return Get(self, "MoveSpeedConstant" )
end


function bonus_modifier:GetModifierPhysicalArmorBonus(k)
	return Get(self, "Armor")
	
end

function bonus_modifier:IsHidden()
	return true
end
function bonus_modifier:IsBuff()
	return true
end
function bonus_modifier:IsDebuff()
	return false
end
 
--------------------------------------------------------------------------------
 
function bonus_modifier:IsStunDebuff()
	return false
end
 
--------------------------------------------------------------------------------
 