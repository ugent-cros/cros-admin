/**
 * The router object contains the routes to all the resources.
 * No hierarchy was used here, except for 'login' and 'unavailable'. This is because they need a different template than all other pages.
 */
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

/**
 * @module cros-admin
 * @submodule routers
 */

/**
 * This route is the main route to the application.
 * @class AppRoute
 * @namespace App
 * @constructor
 * @extends App.BaseRoute
 */
App.AppRoute = App.BaseRoute.extend({});

/**
 * @module cros-admin
 * @submodule routers
 */

/**
 * This route is the route to the unauthorised page
 * @class UnauthorisedRoute
 * @namespace App
 * @constructor
 * @extends App.BaseRoute
 */
App.UnauthorisedRoute = App.BaseRoute.extend({});

/**
 * @module cros-admin
 * @submodule routers
 */

/**
 * This route is the route to the dashboard page
 * @class DashboardRoute
 * @namespace App
 * @constructor
 * @extends App.AuthRoute
 */
App.DashboardRoute = App.AuthRoute.extend({});

/**
 * @module cros-admin
 * @submodule routers
 */

/**
 * This route is the route to the unavailable page
 * @class UnavailableRoute
 * @namespace App
 * @constructor
 * @extends Ember.Route
 */
App.UnavailableRoute = Ember.Route.extend({

    setupController : function() {
        this._super();
        var self = this;

        // if response from server, continue to home page
        this.adapter.find("home").then(function() {
            self.transitionTo("App");
        });
    }

});

/**
 * @module cros-admin
 * @submodule routers
 */

/**
 * This route is the route to the login page
 * @class LoginRoute
 * @namespace App
 * @constructor
 * @extends App.BaseRoute
 */
App.LoginRoute = App.BaseRoute.extend({
	renderTemplate : function() {
		this.render('login', {into: ''});
	}
});