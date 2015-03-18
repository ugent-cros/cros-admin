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