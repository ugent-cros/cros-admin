App = Ember.Application.create();

App.Router.map(function(){
    this.resource('dashboard');
    this.resource('drones');
    this.resource('assignments');
    this.resource('basestations');
    this.resource('users');
});