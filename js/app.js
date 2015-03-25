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
	notificationIsError : function() {
		return this.get('notification') !== "";
	}.property('notification'),

	init : function() {
		var self = this;
		App.currentSocketManager.register("notification",null, function(data) {
			self.set('notification', data);
		});
	}
  
});


$(function() {
	$('[data-toggle="popover"]').popover();
});
