window.App = Ember.Application.create();

App.initializer({
    name: "customAdapter",

    initialize: function (container, application) {
        application.register("my:manager", application.CustomAdapter);
        application.inject("controller", "customAdapter", "my:manager");
        application.inject("route", "customAdapter", "my:manager");
		application.inject("socketmanager", "customAdapter", "my:manager");
    }
});


EmberENV = {
	FEATURES: {
		'ember-htmlbars': true
	}
};

App.AppController = Ember.Controller.extend({
	
	notification : "",
	notificationIsError : false,

	init : function() {
		var self = this;
		App.currentSocketManager.register("notifications", function(data) {
			self.set('notification', data);
			self.set('notificationIsError', !self.notificationIsError);
		});
	}
  
});


$(function() {
	$('[data-toggle="popover"]').popover();
});
