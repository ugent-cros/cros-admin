/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for the dashboard
 * @class DashboardController
 * @namespace App
 * @constructor
 * @extends Ember.ObjectController
 */
App.DashboardController = Ember.Controller.extend({
    v : false,
    /**
     * Contains all messages received
     *
     * @public
     * @property notifications {Array|Object}
     */
	notifications: Ember.A([]),

    init : function() {
        this._super();

        this.fetchLocations();
		this.registerForEvents();
    },

    /**
     * Contains all locations of both drones and basestations in the system.
     *
     * @public
     * @property locations {Array|Object}
     */
    locations : undefined,

    /**
     * This function will fetch all locations from the REST-api and enter them in the list.
     *
     * @private
     * @method fetchLocations
     */
    fetchLocations : function() {
        var self = this;

        // get all drone locations
        this.adapter.find("drone", null, null).then(function(data) {
            $.each(data.resource,function(i,d) {
                var currentId = d.id;
                self.adapter.find("drone", d.id, "location").then(function(data) {
                    var locs = self.get("locations") || Ember.A();
                    locs.pushObject(Ember.Object.create({
                        lat : data.location.latitude,
                        lon : data.location.longitude,
                        type : "drone",
                        id : currentId
                    }));
                    self.set("locations", locs);
                });
            });
        });

        // get all basestation locations
        this.adapter.find("basestation", null, null).then(function(data) {
            $.each(data.resource,function(i,d) {
                var currentId = d.id;
                self.adapter.find("basestation", d.id, null).then(function(data) {
                    var locs = self.get("locations") || Ember.A();
                    locs.pushObject(Ember.Object.create({
                        lat : data.location.latitude,
                        lon : data.location.longitude,
                        type : "basestation",
                        id : currentId
                    }));
                    self.set("locations", locs);
                });
            });
        });
    },
	
	registerForEvents: function() {
		var self = this;
		this.socketManager.register("droneAssigned", 0, "dashboard", function(data, id) {
			self.adapter.find('drone', data.droneId).then(function(data){
				var message = data.name + ' got assigned to assignment #' + id;
				var notifications = self.get('notifications');
				notifications.unshiftObject({ number: notifications.length, message: message, link:'assignment', id: id, seen: false, time: self.getTime() });
			});
        });
		this.socketManager.register("assignmentStarted", 0, "dashboard", function(data, id) {
			var message = 'Started assignment #' + id;
			var notifications = self.get('notifications');
			notifications.unshiftObject({ number: notifications.length, message: message, link:'assignment', id: id, seen: false, time: self.getTime() });
        });
		this.socketManager.register("assignmentProgressed", 0, "dashboard", function(data, id) {
			self.adapter.find('assignment', id).then(function(assignment){
				if(assignment.assignedDrone != null) {
					var message = assignment.assignedDrone.name + ' reached the next checkpoint (' + data.progress + ' of ' + assignment.route.length + ')';
					var notifications = self.get('notifications');
					var found = false;
					for(var i = 0; i < self.notifications.length; ++i) {
						var n = self.notifications[i];
						if(n.link == 'drone' && n.id == assignment.assignedDrone.id) {
							Ember.set(self.notifications[i], 'message', message);
							Ember.set(self.notifications[i], 'seen', false);
							Ember.set(self.notifications[i], 'time', self.getTime());
							found = true;
							break;
						}
					}
				}
				if(!found) 
					notifications.unshiftObject({ number: notifications.length, message: message, link:'drone', id: assignment.assignedDrone.id, seen: false, time: self.getTime() });
			});
        });
		this.socketManager.register("assignmentCompleted", 0, "dashboard", function(data, id) {
			self.adapter.find('assignment', id).then(function(assignment){
				var message = 'Completed Assignment #' + id;
				var notifications = self.get('notifications');
				found = false;
				for(var i = 0; i < self.notifications.length; ++i) {
					var n = self.notifications[i];
					if(n.link == 'drone' && n.id == assignment.assignedDrone.id) {
						Ember.set(self.notifications[i], 'message', message);
						Ember.set(self.notifications[i], 'seen', false);
						Ember.set(self.notifications[i], 'id', id);
						Ember.set(self.notifications[i], 'link', 'assignment');
						Ember.set(self.notifications[i], 'time', self.getTime());
						found = true;
						break;
					}
				}
				if(!found) 
					notifications.unshiftObject({ number: notifications.length, message: message, link:'assignment', id: id, seen: false, time: self.getTime() });
			});
        });

        this.socketManager.register("locationChanged", 0, "dashboard", function(data,id) {
            var locs = self.get("locations");
            if (!locs)
                return;

            var current = locs.filter(function(t) {return t.id === parseInt(id) && t.type === "drone";})[0];
            if (!current)
                return;
            current.set("lat", data.latitude);
            current.set("lon", data.longitude);
        });
    },

    /**
     * This function returns the current time.
     * @returns {string} The current time
     */
	getTime: function() {
		var dt = new Date();
		return '(' + dt.toLocaleTimeString() + ')';
	},
	
	actions: {
        /**
         * Whenever one clicks on a notification in the dashboard this function will update the 'seen' status of these notifications.
         * Afterwards it will make the transition to the correct route.
         *
         * @public
         * @method notificationClicked
         * @param item the notification on which has been clicked
         */
		notificationClicked: function(item) {
			var notifications = this.get('notifications');
			for(var i = 0; i < notifications.length; ++i) {
				var n = notifications[i];
				// All linked notifications
				if(n.link == item.link && n.id == item.id)
					Ember.set(notifications[i], 'seen', true);
			}
			this.transitionToRoute(item.link, item.id);
		},

        /**
         * This method will remove all notifications which are marked as seen from the list.
         *
         * @public
         * @method removeSeenNotifications
         */
		removeSeenNotifications: function() {
			var removed = 0;
			var notifications = this.get('notifications');
			for(var i = notifications.length - 1; i >=0; --i) {
				if(notifications[i].seen) {
					notifications.removeAt(i);
					removed++;
				} else
					Ember.set(notifications[i], 'number', notifications[i].number - removed);
			}
		}
	},

    /**
     * Whether any notifications are currently in the list.
     *
     * @public
     * @property notificationsAvailable {boolean}
     */
	notificationsAvailable: function() {
		return this.notifications.length > 0;
	}.property('notifications.@each'),

    /**
     * Whether any of the notifications has been seen.
     * @public
     * @property isEnabled {boolean}
     */
	isEnabled: function() {
		var enabled = false;
		var notifications = this.get('notifications');
		for(var i = 0; i < notifications.length; ++i) {
			if(notifications[i].seen == true) {
				enabled = true;
				break;
			}
		}
		return enabled;
	}.property('notifications.@each.seen')
});