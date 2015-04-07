window.App = Ember.Application.create();

App.initializer({
    name: "customAdapter",

    initialize: function (container, application) {
        application.register("my:manager", application.CustomAdapter);
        application.inject("controller", "customAdapter", "my:manager");
        application.inject("component", "customAdapter", "my:manager");
        application.inject("route", "customAdapter", "my:manager");
        application.inject("component", "customAdapter", "my:manager");
		application.inject("socketmanager", "customAdapter", "my:manager");
    }
});

EmberENV = {
    FEATURES: {
        'ember-htmlbars': true
    }
};


$(function() {
    $('[data-toggle="popover"]').popover();
});
