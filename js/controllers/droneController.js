App.DroneController = Ember.Controller.extend({
  
	battery : "N/A",
  
	init : function() {
		var self = this;
		App.currentSocketManager.register("batteryPercentageChanged", null, function(data) {
			self.set('battery', data.percent);
		});
	}
  
});