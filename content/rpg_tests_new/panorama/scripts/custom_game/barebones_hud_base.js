(function(){var superctx = $.GetContextPanel().GetParent();for(var x in superctx.data){$[x] = superCtx.data[x];}})();
function AddToGlobalNamespace(name, func){
	$.GetContextPanel().GetParent().data()[name] = func;
}


var ComputePanelAbsPosition = function(panel){
	var xy = {x: 0, y: 0};
	var cc = 0;
	while(panel.id != "CustomUIRoot" || cc > 30){
		xy.x += panel.actualxoffset;
		xy.y += panel.actualyoffset;
		panel = panel.GetParent();
		cc++;
	}
	xy.x *= (1920 / panel.contentwidth);
	xy.y *= (1080 / panel.contentheight);
	return xy;
}

function DisplayTooltip(panel, x, y, facedir){
	var panelAddedMargin = 5;
	var arrowAddedMargin = 5;
	panel.hittest = false;
	
	if(typeof x !== "number"){
		facedir = y;
		var host = x;
		var xy = ComputePanelAbsPosition(host);
		x = xy.x;
		y = xy.y;
	}
	
	if(!facedir || facedir == "auto"){
		facedir = y >= (1080/2) ? "up" : "down";
	}
	//"up" case
	var container = $("#TooltipMainPanel");
	var arrow = $("#TooltipArrow");
	var panelContainer = $("#TooltipPanelContainer");
	
	container.style.flowChildren = "up";
	panelContainer.RemoveAndDeleteChildren();
	panelContainer.AddChild(panel);
	
	/*
	if(facedir == "up"){
		
	}else if(facedir == "down"){
	
	}else if(facedir == "left"){
	
	}else if(facedir == "right"){
	
	}else{
		$.Msg("INVALID FACING : " + facedir);
	}*/
}

function TopNotification( msg ) {
  AddNotification(msg, $('#TopNotifications'));
}

function BottomNotification(msg) {
  AddNotification(msg, $('#BottomNotifications'));
}

function TopNotificationHeroImage( msg ) {
  AddNotificationHeroImage(msg, $('#TopNotifications'));
}

function BottomNotificationHeroImage(msg) {
  AddNotificationHeroImage(msg, $('#BottomNotifications'));
}

function AddNotification(msg, panel) {
  var newNotification = true;
  var lastNotification = panel.GetChild(panel.GetChildCount() - 1)
  $.Msg(msg)

  msg.continue = msg.continue || false;
  //msg.continue = true;

  if (lastNotification != null && msg.continue) 
    newNotification = false;

  if (newNotification){
    lastNotification = $.CreatePanel('Panel', panel, '');
    lastNotification.AddClass('NotificationLine')
    lastNotification.hittest = false;
  }

  var notification = $.CreatePanel('Label', lastNotification, '');

  if (typeof(msg.duration) != "number"){
    $.Msg("[Notifications] Notification Duration is not a number!");
    msg.duration = 3
  }
  
  if (newNotification){
    $.Schedule(msg.duration, function(){
      $.Msg('callback')
      lastNotification.DeleteAsync(0);
    });
  }

  notification.html = true;
  var text = msg.text || "No Text provided";
  notification.text = $.Localize(text)
  notification.hittest = false;
  notification.AddClass('TitleText');
  if (msg.class)
    notification.AddClass(msg.class);
  else
    notification.AddClass('NotificationMessage');

  if (msg.style){
    for (var key in msg.style){
      var value = msg.style[key]
      notification.style[key] = value;
    }
  }
}

function AddNotificationHeroImage(msg, panel) {
	$.Msg("AddNotificationHeroImg");
  var newNotification = true;
  $.Msg(msg)
  var lastNotification = panel.GetChild(panel.GetChildCount() - 1)
  msg.continue = msg.continue || false;
  //msg.continue = true;

  if (lastNotification != null && msg.continue) 
    newNotification = false;

  if (newNotification){
    lastNotification = $.CreatePanel('Panel', panel, '');
    lastNotification.AddClass('NotificationLine')
    lastNotification.hittest = false;
  }

  var notification = $.CreatePanel('DOTAHeroImage', lastNotification, '');

  if (typeof(msg.duration) != "number"){
    $.Msg("[Notifications] Notification Duration is not a number!");
    msg.duration = 3
  }
  
  if (newNotification){
    $.Schedule(msg.duration, function(){
      $.Msg('callback')
      lastNotification.DeleteAsync(0);
    });
  }

  notification.heroimagestyle = msg.imagestyle || "icon";
  notification.heroname = msg.hero
  notification.hittest = false;
  
  if (msg.class)
    notification.AddClass(msg.class);
  else
    notification.AddClass('HeroImage');

  if (msg.style){
    for (var key in msg.style){
      var value = msg.style[key]
      notification.style[key] = value;
    }
  }
}

$.GlobalFunction = function(){
	$.Msg("Hi");
} 

AddToGlobalNamespace("GlobalFunction", $.GlobalFunction);

(function () {
  GameEvents.Subscribe( "top_notification", TopNotification );
  GameEvents.Subscribe( "top_notification_heroimage", TopNotificationHeroImage );
  GameEvents.Subscribe( "bottom_notification", BottomNotification );
  GameEvents.Subscribe( "bottom_notification_heroimage", BottomNotificationHeroImage );
})();


