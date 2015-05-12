App.Router.map(function(){
	this.resource('App', { path : '/' }, function() {
		this.resource('dashboard', { path : '/'});
		this.resource('drones');
		this.resource('drones-add', { path: '/drones/add' });
		this.resource('drone', { path: '/drones/:drone_id' });
        this.resource('manualControl', { path: '/drones/:drone_id/control' });
		this.resource('drone-edit', { path: '/drones/:drone_id/edit' });
		this.resource('assignments');
		this.resource('assignments-add', { path: '/assignments/add' });
		this.resource('assignment', { path: '/assignments/:assignment_id' });
		this.resource('basestations');
        this.resource('basestations-add', { path: '/basestations/add' });
        this.resource('basestation-edit', { path: '/basestations/:basestation_id/edit' });
		this.resource('basestation', { path: '/basestations/:basestation_id' });
		this.resource('users');
		this.resource('users-add', { path: '/users/add' });
		this.resource('user', { path: '/users/:user_id' });
		this.resource('user-edit', { path: '/users/:user_id/edit' });
        this.resource('unauthorised');
	});
	this.resource('login');
    this.resource('unavailable');
});

App.AppRoute = App.BaseRoute.extend({});

App.UnauthorisedRoute = App.BaseRoute.extend({});

App.DashboardRoute = App.AuthRoute.extend({});

App.UnavailableRoute = Ember.Route.extend({

    setupController : function() {
        this._super();
        var self = this;

        this.adapter.find("home").then(function() {
            self.transitionTo("App");
        });
    }

});

App.LoginRoute = App.BaseRoute.extend({
	renderTemplate : function() {
		this.render('login', {into: ''});
	}
});