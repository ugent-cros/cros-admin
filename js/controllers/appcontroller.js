/**
 * Created by matthias on 30/03/2015.
 */

App.AppController = Ember.Controller.extend({
    notification : {},
	
	notificationType: function() {
		if(this.get('notification').message) {
			$('#notificationSlider').slideDown('slow');
			return 'alert alert-success';
		}
		return '';
	}.property('notification'),

    init : function() {
        this._super();
		this.registerForEvents();

        var self = this;
        if(this.socketManager) {
            this.socketManager.register("notification",null, function(data) {
                if (data.action === "clear") {
                    self.set('notification', {});
                } else {
                    self.set('notification', { message: message, link:'assignment', id: id });
                }
            });
        }
    },

    actions : {
        logout: function(){
            this.authManager.logout();
            this.socketManager.disconnect();
            this.transitionToRoute('login');
        },

        dismiss : function() {
            this.set('notification', {});
			$('#notificationSlider').hide();
        }
    },
	
	registerForEvents: function() {
		var self = this;
		this.socketManager.register("droneAssigned", 0, "application", function(data, id) {
			self.handleEvent(data, id, function(data, id) {
				self.adapter.find('drone', data.assignedDroneID).then(function(data) {
					var message = data.name + ' got assigned to assignment #' + id;
					self.set('notification', { message: message });
				});
			});
		});
		this.socketManager.register("assignmentStarted", 0, "application", function(data, id) {
			self.handleEvent(data, id, function(data, id) {
				var message = 'Started assignment #' + id;
				self.set('notification', { message: message });
			});
		});
		this.socketManager.register("assignmentProgressChanged", 0, "application", function(data, id) {
			self.handleEvent(data, id, function(data, id) {
				self.adapter.find('assignment', id).then(function(assignment){
					var message = assignment.assignedDrone.name + ' reached the next checkpoint (' + data.progress + ' of ' + assignment.route.length + ')';
					self.set('notification', { message: message });
				});
			});
		});
		this.socketManager.register("assignmentCompleted", 0, "application", function(data, id) {
			self.handleEvent(data, id, function(data, id) {
				var message = 'Completed assignment #' + id;
				self.set('notification', { message: message });
			});
		});
	},
	
	handleEvent: function(data, id, func) {
		var self = this;
		$('#notificationSlider').slideUp('slow', function() {
			func(data, id);
			$('#notificationSlider').slideDown('slow');
			var timeout = self.get('timeout');
			if(timeout)
				clearTimeout(timeout);
			timeout = setTimeout(function() { 
				self.set('notification', {});
				$('#notificationSlider').hide();
			}, 5000);
			self.set('timeout', timeout);			
		});
	}
});