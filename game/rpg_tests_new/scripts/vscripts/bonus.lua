print("Link Modifier!")
LinkLuaModifier( "bonus_modifier", LUA_MODIFIER_MOTION_NONE )

Bonus = Bonus or {}

Bonus.KVStats = {
	"FireDamage",
	"FireDamageMaximum",
	"FireDamageMinimum",

	"IceDamage",
	"IceDamageMaximum",
	"IceDamageMinimum",

	"PoisonDamage",
	"PoisonDamageMaximum",
	"PoisonDamageMinimum",
	"PoisonDamageDurationStretch", --stretch decreases the DPS
	"PoisonDamageDurationConstant", --constant maintains a constant DPS,

	"LightningDamage",
	"LightningDamgeMaximum",
	"LightningDamageMinimum",

	"MagicDamage",
	"MagicDamageMaximum",
	"MagicDamageMinimum",

	"FireResistance",
	"IceResistance",
	"PoisonResistance",
	"LightningResistance",
	"AllResistance", 

	"PoisonLengthReduction",
	"CurseLengthReduction",

	"EvasionRating",
	"HitRating",
	"SpellEvasionRating",
	"SpellHitRating",

	"GoldFind",
	"MagicFind",

	"GoldBounty",
	"ExpBounty",


}

Bonus.NonKVStats = {
	"Damage",
	"AttackSpeed",
	"Armor",
	"Strength",
	"Agility",
	"Intelligence",
	"AllStats",

	"Health",
	"HealthPercent",
	"HealthRegenConstant",
	"HealthRegenPercent",
	"MoveSpeedConstant",
	"MoveSpeedPercent"
}




local StatsToAdd = {
	FireDamageMinimum = "fireDmgMin",
	FireDamageMaximum = "fireDmgMax",
	IceDamageMinimum = "iceDmgMin",
	IceDamageMaximum = "iceDmgMax",
	LightningDamageMinimum = "lightDmgMin",
	LightningDamageMaximum = "lightDmgMax"
}

function Bonus.InitializeBonus(unit)
	if not unit.BonusTable then
		unit.BonusTable = {}
		Bonus.BonusId = (Bonus.BonusId or -1) + 1
		unit.BonusTable.BonusId = Bonus.BonusId 
		--print("BONUS ID : " .. unit.BonusTable.BonusId)
		--[[bonus.SetupBonusInd(unit, "Damage", "dmg")
		Bonus.SetupBonusInd(unit, "Armor", "armor")
		Bonus.SetupBonusInd(unit, "AttackSpeed", "aspd")
		Bonus.SetupBonusInd(unit, "Health", "life")
		Bonus.SetupBonusInd(unit, "HealthRegenConstant", "lifeRegenConstant")
		Bonus.SetupBonusInd(unit, "HealthRegenPercent", "lifeRegenPercent")
		Bonus.SetupBonusInd(unit, "Mana", "mana")
		Bonus.SetupBonusInd(unit, "ManaRegenConstant", "manaRegenConstant")
		Bonus.SetupBonusInd(unit, "ManaRegenPercent", "manaRegenPercent")
		Bonus.SetupBonusInd(unit, "Strength", "str")
		Bonus.SetupBonusInd(unit, "Agility", "agility")
		Bonus.SetupBonusInd(unit, "Intelligence", "int")
		Bonus.SetupBonusInd(unit, "MoveSpeedConstant", "mspd")
		Bonus.SetupBonusInd(unit, "MoveSpeedPercent", "mspdPercent")-]]
		--for k,v in pairs(StatsToAdd) do
		--	Bonus.SetupBonusInd(unit, k,v)
		--end
		for k,v in pairs(Bonus.KVStats) do
			Bonus.SetupBonusInd(unit, v,v)
		end
		for k,v in pairs(Bonus.NonKVStats) do
			Bonus.SetupBonusInd(unit, v,v)
		end
		Bonus.SetupBonusRaw(unit)

		unit:RemoveModifierByName("bonus_modifier") 
		unit:AddNewModifier(unit, nil, "bonus_modifier", {}) 

		--unit:SetBonusDamage(500)
		--unit:AddBonusArmor(510)

	end
end

function Bonus.SetupBonusRaw(unit)
	unit["SetBonus"] = function(self,name,key)
		if self["SetBonus"..name] then
			self["SetBonus"..name](self,key);
		else
			self.BonusTable[name] = key
		end
	end
	unit["AddBonus"] = function(self,name,key)
		if self["AddBonus"..name] then
			self["AddBonus"..name](self,key);
		else
			self.BonusTable[name] = (self.BonusTable[name] or 0) + key
		end
	end
	unit["SubtractBonus"] = function(self,name,key)
		if self["SubtractBonus"..name] then
			self["SubtractBonus"..name](self,key);
		else
			self.BonusTable[name] = (self.BonusTable[name] or 0) - key
		end
	end
	unit["GetBonus"] = function(self,name,key)
		if self["GetBonus"..name] then
			return self["GetBonus"..name](self,key);
		else
			return (self.BonusTable[name] or 0)
		end
	end
end

function HandleToString(userData)
	local d = {}
	d[userData.__self] = 0
	for k,v in pairs(d) do
		return k
	end
end

local Set = function(key, unit, value)
	local tbl = CustomNetTables:GetTableValue("bonus", key) or {}
	tbl[string.format("%d", unit:GetEntityIndex())] = value
	CustomNetTables:SetTableValue("bonus", key, tbl)
end

local Check = function(internalName, unit, key)
	if internalName == "Mana" or internalName == "ManaPercent" or internalName == "Health" or internalName == "HealthPercent" then
		local abil = unit:GetAbilityByIndex(0)
		if abil then
			if abil:GetLevel() > 0 then
				local lvl = abil:GetLevel()
				abil:SetLevel(0)
				abil:SetLevel(lvl)
			else
				abil:SetLevel(1)
				abil:SetLevel(0)
			end
			if internalName == "Mana" or internalName == "ManaPercent" then
			--	unit:SetMana(unit:GetMana() + key)
			else
			--	unit:SetHealth(unit:GetHealth() + key)
			end
		end 

	end
end

function Bonus.SetupBonusInd(unit, funcName, internalName)
	unit.BonusTable[internalName] = 0
	unit["SetBonus"..funcName] = function(self,key)
		Set(internalName, unit, key)
		self.BonusTable[internalName] = key
		Check(internalName, unit, key)
	end
	unit["AddBonus"..funcName] = function(self,key)
		Set(internalName, unit, self.BonusTable[internalName] + key)
		self.BonusTable[internalName] = (self.BonusTable[internalName] or 0) + key
		Check(internalName, unit, (self.BonusTable[internalName] or 0) - key)
	end
	unit["SubtractBonus"..funcName] = function(self,key)
		Set(internalName, unit, self.BonusTable[internalName] - key)
		self.BonusTable[internalName] = (self.BonusTable[internalName] or 0) - key
		Check(internalName, unit, (self.BonusTable[internalName] or 0) - key)
	end
	unit["GetBonus"..funcName] = function(self,key)
		return self.BonusTable[internalName]
	end
end
