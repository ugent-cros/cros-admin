App.DroneController = Ember.ObjectController.extend({
  
	battery : "N/A",
	altitude : -1,
    location : [0,0],
  
	init : function() {
	},
	
	initRegistration: function(id) {
		var self = this;
        // TODO: set back to 'id' after testing
        App.currentSocketManager.register("batteryPercentageChanged", 0, function(data) {
			self.set('battery', data.percent);
			$('.batteryStatus').css('width', data.percent + '%');
			if(data.percent < 25)
				$('.batteryStatus').css('background-color', '#F00');
			else
				$('.batteryStatus').css('background-color', '#0A0');
		});

        // TODO: set back to 'id' after testing
		App.currentSocketManager.register("altitudeChanged", 0, function(data) {
			self.set("altitude", data.altitude.toFixed(2));
		});

        // TODO: set back to 'id' after testing
        App.currentSocketManager.register("locationChanged", 0, function(data) {
            self.set('location',[data.longitude,data.latitude]);
            // todo: do something with gpsheight...?
        });
	},

    getClass: function(){
        var label = "label "
        var status = this.get('status');
        if(status == "AVAILABLE")
            return label + "label-success";
        else if(status == "IN_FLIGHT")
            return label + "label-info";
        else if(status == "UNAVAILABLE" || status == "UNKNOWN")
            return label + "label-default";
        else if(status == "CHARGING")
            return label + "label-primary";
        else if(status == "EMERGENCY_LANDED" || status == "DECOMMISSIONED")
            return label + "label-warning";
    }.property('status')
});

App.DroneEditController = Ember.Controller.extend({
	actions: {
		save: function(){
			console.log('Do some saving here!');
			console.log(this.model);
		}
	}
});