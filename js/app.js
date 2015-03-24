App = Ember.Application.create();

App.Router.map(function(){
    this.resource('dashboard');
    this.resource('drones');
    this.resource('assignments');
    this.resource('basestations');
    this.resource('users');
});

$(document).ready(function() {
    $('ul#dock li').click(function() {
        $('li.active').removeClass('active');
        $(this).addClass('active');
    });
});

App.MyTableComponent = Ember.Component.extend({
    columns: ['test', '#']
});

App.DronesRoute = Ember.Route.extend({
    model: function(){
        return drones
    }
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