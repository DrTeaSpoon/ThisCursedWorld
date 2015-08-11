function OnAbilityStart(keys)
	local caster = keys.caster
	local vector = caster:GetForwardVector()
	local angleAdd = 45 * (3.141 / 180.0)
	local angle = math.atan2(vector.y, vector.x) + angleAdd
	vector = Vector(math.cos(angle), math.sin(angle))
	local particle = ParticleManager:CreateParticle("particles/units/heroes/hero_tidehunter/tidehunter_anchor_hero_swipe_blur.vpcf", PATTACH_ABSORIGIN, caster) 
	ParticleManager:SetParticleControlForward(particle, 0, vector)
end

function OnSpellStart(keys)
	local caster = keys.caster
	local ability = keys.ability
	local stackCount = caster:GetModifierStackCount("berserker_rage_buff", unit)
	local factor = ability:GetLevelSpecialValueFor("damage_factor_per_stack", (ability:GetLevel() - 1)) 
	local stackFactor = ability:GetLevelSpecialValueFor("stacks_consumed_perecentage", (ability:GetLevel() - 1)) / 100.0
	local rawDamage = ability:GetLevelSpecialValueFor("damage_factor", (ability:GetLevel() - 1)) 
	caster:SetModifierStackCount("berserker_rage_buff", unit, stackCount / stackFactor)
	caster.LastCleaveDamage = (rawDamage + factor * stackCount) * caster:GetAttackDamage()
	print("Raw DAmage, stackfactor, stackcount, cleave:", rawDamage, stackFactor, stackCount, caster.LastCleaveDamage)

end

function OnProjectileHit(keys)
	local caster = keys.caster
	local target = keys.target
	local damageTable = {victim=target, attacker=caster, damage=caster.LastCleaveDamage, damage_type = DAMAGE_TYPE_PHYSICAL}
	print("Dealign Dmg ", caster.LastCleaveDamage)
	ApplyDamage(damageTable)
end