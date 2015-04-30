/**
 * Created by matthias on 14/04/2015.
 */

App.DashboardController = Ember.Controller.extend({
    v : false,
	notifications: Ember.A([]),

    init : function() {
        this._super();

        this.fetchLocations();
		this.registerForEvents();
        this.fetchStatuses();
    },

    locations : undefined,

    fetchLocations : function() {
        var self = this;

        // get all drone locations
        this.adapter.find("drone", null, null).then(function(data) {
            $.each(data.resource,function(i,d) {
                self.adapter.find("drone", d.id, "location").then(function(data) {
                    var locs = self.get("locations") || [];
                    locs.pushObject([data.location.latitude, data.location.longitude, "drone"]);
                    self.set("locations", locs);
                });
            });
        });

        // get all basestation locations
        this.adapter.find("basestation", null, null).then(function(data) {
            $.each(data.resource,function(i,d) {
                self.adapter.find("basestation", d.id, null).then(function(data) {
                    var locs = self.get("locations") || [];
                    locs.pushObject([data.location.latitude, data.location.longitude,"basestation"]);
                    self.set("locations", locs);
                });
            });
        });
    },

    statuses :{UNAVAILABLE: 0, FLYING: 0, AVAILABLE:0, CHARGING:0},
    total : 0,

    fetchStatuses : function() {
        var self = this;

        // get all drone locations
        this.adapter.find("drone", null, null).then(function(data) {
            $.each(data.resource,function(i,d) {
                self.adapter.find("drone", d.id, null).then(function(data) {
                    var status = data.status;
                    var statuses = self.get('statuses');
                    statuses[status] = statuses[status] + 1;
                    self.set('statuses', statuses);
                    self.set('total', self.get('total')+1);
                });
            });
        });
    },

    debug : function () {
        console.log(this.get('statuses'));
    }.observes('statuses'),
	
	registerForEvents: function() {
		var self = this;
		this.socketManager.register("droneAssigned", 0, "dashboard", function(data, id) {
			self.adapter.find('drone', data.assignedDroneID).then(function(data){
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
		this.socketManager.register("assignmentProgressChanged", 0, "dashboard", function(data, id) {
			self.adapter.find('assignment', id).then(function(assignment){
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
	},
	
	getTime: function() {
		var dt = new Date();
		return '(' + dt.toLocaleTimeString() + ')';
	},
	
	actions: {
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
	
	notificationsAvailable: function() {
		return this.notifications.length > 0;
	}.property('notifications.@each'),
	
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