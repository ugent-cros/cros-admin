/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for a assignment object
 * @class AssignmentController
 * @namespace App
 * @constructor
 * @extends Ember.Controller
 */
App.AssignmentController = Ember.Controller.extend({
	
	init : function() {
        this._super();
		this.registerForEvents();
	},

    /**
     * The string of the current progress status.
     *
     * @public
     * @property progressText {String}
     */
	progressText: function() {
		var model = this.get('model');
		if(model.progress == model.route.length) {
			return 'completed';
		} else if (!model.scheduled) {
			return 'pending';
		} else {
			return 'in progress';
		}
	}.property('model.progress'),

    /**
     * The css class to label the current progress
     *
     * @public
     * @property progressLabel {String}
     */
	progressLabel: function() {
		var model = this.get('model');
		if(model.progress == model.route.length) {
			return 'label-success';
		} else if (!model.scheduled) {
			return 'label-default';
		} else {
			return 'label-info';
		}
	}.property('model.progress'),

    /**
     * A list of the checkpoint locations of this assignment.
     *
     * @public
     * @property checkpointLocations {Array|Object}
     */
    checkpointLocations : function() {
        var route = this.get('model').route;
        var result = [];
        $.each(route, function(index,data) {
            result.push(Ember.Object.create({lat : data.location.latitude, lon : data.location.longitude}));
        });
        return result;
    }.property('model'),

    /**
     * This function will set the location of the drone that has been assigned to this assignment.
     *
     * @public
     * @method updateDroneLocation
     * @param location The new location of the drone
     */
    updateDroneLocation : function(location) {
        this.set('droneLocation', Ember.Object.create({
            lat : location.latitude,
            lon : location.longitude
        }));
    },
	
	registerForEvents: function() {
		var self = this;
		this.socketManager.register("droneAssigned", 0, "assignment", function(data, id) {
			self.adapter.find('assignment', id).then(function(assignment){
				self.set('model', assignment);
			});
		});
		this.socketManager.register("assignmentStarted", 0, "assignment", function(data, id) {
			self.adapter.find('assignment', id).then(function(assignment){
				self.set('model', assignment);
			});
		});
		this.socketManager.register("assignmentProgressed", 0, "assignment", function(data, id) {
			self.adapter.find('assignment', id).then(function(assignment){
				self.set('model', assignment);
			});
		});
		this.socketManager.register("assignmentCompleted", 0, "assignment", function(data, id) {
			self.adapter.find('assignment', id).then(function(assignment){
				self.set('model', assignment);
			});
		});
        this.socketManager.register("locationChanged", 0, "assignment", function(data, id) {
            var assignedId = self.get("model.assignedDrone.id");
            if (assignedId && self.get("model.assignedDrone.id") === parseInt(id))
                self.updateDroneLocation(data);
        });
	},

    actions : {
        emergency: function(){
            this.adapter.find('drone',this.get("model.assignedDrone.id"),"emergency").then(function(data){
                console.log(data);
            });
        }
    }

});