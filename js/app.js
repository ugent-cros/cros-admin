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

$(function() {
    $('[data-toggle="popover"]').popover();
});

App.MyTableComponent = Ember.Component.extend({
    columns: ['test', '#']
});

App.DronesController = Ember.ObjectController.extend({
    columns : ['#','Name','Status','Actions']
});

var drones = [{
    id: '1',
    name: "bebop",
    status: 'Available'
}, {
    id: '2',
    name: "AR drone 2",
    status: 'In flight'
}]


