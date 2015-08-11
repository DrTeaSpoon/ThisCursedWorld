
function Dash(keys)
	--PrintTable(keys)
	local point = keys.target_points[1]
	local caster = keys.caster
	local casterPos = caster:GetAbsOrigin()
	local pid = caster:GetPlayerID()
	local difference = point - casterPos
	local ability = keys.ability
	local range = ability:GetLevelSpecialValueFor("distance", (ability:GetLevel() - 1))
	print("DASH! RANGE : " .. range)
	ProjectileManager:ProjectileDodge(caster)

	if difference:Length2D() > range then
		point = casterPos + (point - casterPos):Normalized() * range
	end
	print("KK")
	FindClearSpaceForUnit(caster, point, false)	
end