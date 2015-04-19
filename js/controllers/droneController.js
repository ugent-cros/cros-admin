App.DroneController = Ember.ObjectController.extend({
  
	battery : "N/A",
	altitude : -1,
    location : [0,0],

    initialization : function() {
        var self = this;
        // fetch initial data
        this.adapter.find("drone", this.get("model.id"), "battery").then(function(data) {
            self.set("battery", data.battery);
        });
        this.adapter.find("drone", this.get("model.id"), "altitude").then(function(data) {
            self.set("altitude", data.altitude);
        });
        this.adapter.find("drone", this.get("model.id"), "location").then(function(data) {
            self.set("location", [data.location.latitude,data.location.longitude]);
        });


        this.socketManager.register("batteryPercentageChanged", this.get("model.id"), "drone", function(data) {
            self.set('battery', data.percent);
            $('.batteryStatus').css('width', data.percent + '%');
            if(data.percent < 25)
                $('.batteryStatus').css('background-color', '#F00');
            else
                $('.batteryStatus').css('background-color', '#0A0');
        });

        this.socketManager.register("altitudeChanged", this.get("model.id"), "drone", function(data) {
            self.set("altitude", data.altitude.toFixed(2));
        });

        this.socketManager.register("locationChanged", this.get("model.id"), "drone", function(data) {
            self.set('location',[data.latitude, data.longitude]);
            // todo: do something with gpsheight...?
        });
    }.observes("model"),

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