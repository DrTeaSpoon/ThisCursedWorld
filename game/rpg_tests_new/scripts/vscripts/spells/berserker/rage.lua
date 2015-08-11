function ResetTimer(delay, unit)
	Timers:RemoveTimer("RageTimer:"..unit:GetEntityIndex())
	Timers:CreateTimer("RageTimer:"..unit:GetEntityIndex(), {callback = function()
		local count = unit:GetModifierStackCount("berserker_rage_buff", unit)
		if count > 0 then unit:SetModifierStackCount("berserker_rage_buff", unit, count-1) end
		return 0.5
	end, endTime=delay})
end

function DestroyTimer(unit)
	Timers:RemoveTimer("RageTimer:"..unit:GetEntityIndex())
end

function OnCreated(keys)
	local unit = keys.caster
	ResetTimer(2, unit)
end

function OnDestroyed(keys)
	local unit = keys.caster
	DestroyTimer(unit)
end


function OnAttackLanded(keys)
	local unit = keys.caster
	local ability = keys.ability
	local maxStack = ability:GetLevelSpecialValueFor("max_count", ability:GetLevel() - 1)

	if not unit:HasModifier("berserker_rage_buff") then return end
	ResetTimer(2, unit)
	local count = unit:GetModifierStackCount("berserker_rage_buff", unit)
	if count < maxStack then
		unit:SetModifierStackCount("berserker_rage_buff", unit, count+1)
	end
end