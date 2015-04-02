App.DroneController = Ember.Controller.extend({
  
	battery : "N/A",
	altitude : -1,
  
	init : function() {
	},
	
	initRegistration: function(id) {
		var self = this;
		App.currentSocketManager.register("batteryPercentageChanged", id, function(data) {
			self.set('battery', data.percent);
			$('.batteryStatus').css('width', data.percent + '%');
			if(data.percent < 25)
				$('.batteryStatus').css('background-color', '#F00');
			else
				$('.batteryStatus').css('background-color', '#0A0');
		});
		
		App.currentSocketManager.register("altitudeChanged", id, function(data) {
			self.set("altitude", data.altitude.toFixed(2));
		});
	}
});

App.DroneEditController = Ember.Controller.extend({
	actions: {
		save: function(){
			console.log('Do some saving here!');
			console.log(this.model);
		}
	}
});