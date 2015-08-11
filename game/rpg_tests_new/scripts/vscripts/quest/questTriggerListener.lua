
OnStartTouch = function(keys)
	Quest.OnTrigger(keys.activator, keys.caller:GetName(), true)
end

OnEndTouch = function(keys)
	Quest.OnTrigger(keys.activator, keys.caller:GetName())
end