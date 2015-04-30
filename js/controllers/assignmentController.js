/**
 * Created by matthias on 4/04/2015.
 */

/**
 * Created by matthias on 3/04/2015.
 */

App.AssignmentController = Ember.Controller.extend({
	
	init : function() {
        this._super();
		this.registerForEvents();
	},

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

    checkpointLocations : function() {
        var route = this.get('model').route;
        var result = [];
        $.each(route, function(index,data) {
            result.push(Ember.Object.create({lat : data.location.latitude, lon : data.location.longitude}));
        });
        return result;
    }.property('model'),

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
	}

});