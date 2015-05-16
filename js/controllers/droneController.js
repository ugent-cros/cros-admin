/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for a drone object
 * @class DroneController
 * @namespace App
 * @constructor
 * @extends ObjectController
 */
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
            self.set("location", Ember.Object.create({lat : data.location.latitude, lon: data.location.longitude}));
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
            self.set('location',Ember.Object.create({lat : data.latitude, lon : data.longitude}));
            // todo: do something with gpsheight...?
        });

        this.socketManager.register("droneStatusChanged", this.get("model.id"), "drone", function(data) {
            self.set('model.status',data.newStatus);
        });
    }.observes("model"),

    cantControl : function() {
        return this.get("model.status") !== "AVAILABLE" && this.get("model.status") !== "MANUAL_CONTROL";
    }.property("model.status"),

    /**
     * Determine the color of the label
     */
    getModelClass: function(){
        var label = "label "
        var status = this.get('model.status');
        if(status == "AVAILABLE")
            return label + "label-success";
        else if(status == "FLYING" || status == "MANUAL_CONTROL")
            return label + "label-warning";
        else if(status == "UNKNOWN" || status == "INACTIVE")
            return label + "label-default";
        else if(status == "CHARGING")
            return label + "label-primary";
        else if(status == "EMERGENCY" || status == "ERROR" || status == "UNREACHABLE")
            return label + "label-danger";
        else
            return label + "label-default";
    }.property('model.status'),

    /**
     * Check if a drone can be deleted or not, since a flying drone cannot be deleted
     */
    isNotDeletable: function(){
        return this.get("model.status") !== "AVAILABLE" && this.get("model.status") !== "MANUAL_CONTROL";
    }.property("model.status"),

    controlError : "",
    hasControlError : function() {
        return this.get("controlError") !== "";
    }.property("controlError"),

    actions: {

        /**
         * Perform an emergency call to the drone with the given id
         * @param {number} id - id of the drone
         */
        emergency: function(id){
            this.adapter.find('drone',id,"emergency").then(function(data){
                console.log(data);
            });
        }
    }
});

App.DroneEditController = Ember.Controller.extend({
	actions: {
		save: function(){
			console.log(this.model);
		}
	}
});