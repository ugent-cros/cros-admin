App.DroneController = Ember.Controller.extend({
  
	battery : "N/A",
  
	init : function() {
		var self = this;
		App.currentSocketManager.register("batteryPercentageChanged", function(data) {
			self.set('battery', data.percent);
			$('.batteryStatus').css('width', data.percent + '%');
			if(data.percent < 25)
				$('.batteryStatus').css('background-color', '#F00');
			else
				$('.batteryStatus').css('background-color', '#0A0');
		});
	}
  
});