function OnSpellStart(keys)
	local unit = keys.caster
	local abil = keys.ability
	local stackCount = unit:GetModifierStackCount("berserker_rage_buff", unit) + 1
	local factor = abil:GetLevelSpecialValueFor("health_restored_per_stack", (abil:GetLevel() - 1)) / 100.0
	unit:SetModifierStackCount("berserker_rage_buff", unit, 0)
	unit:Heal(factor * stackCount * unit:GetMaxHealth(), unit)
end