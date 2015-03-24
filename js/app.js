window.App = Ember.Application.create();

App.initializer({
    name: "customAdapter",

    initialize: function (container, application) {
        application.register("my:manager", application.CustomAdapter);
        application.inject("controller", "customAdapter", "my:manager");
        application.inject("route", "customAdapter", "my:manager");
    }
});


EmberENV = {
	FEATURES: {
		'ember-htmlbars': true
	}
};