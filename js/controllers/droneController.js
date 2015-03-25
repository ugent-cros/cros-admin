App.DroneController = Ember.Controller.extend({
  
	battery : "N/A",
  
	init : function() {
	},
	
	initRegistration: function(id) {
		var self = this;
		App.currentSocketManager.register("batteryPercentageChanged", id, function(data) {
			self.set('battery', data.percent);
		});
	}
  
});