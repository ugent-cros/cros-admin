App.DroneController = Ember.Controller.extend({
  
	battery : "N/A",
  
	init : function() {
		var self = this;
		App.currentSocketManager.register("batteryPercentageChanged", function(data) {
			self.set('battery', data.percent);
		});
	}
  
});