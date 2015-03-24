App.Router.map(function(){
	this.resource('App', { 'path' : '/' }, function() {
		this.resource('dashboard');
		this.resource('drones');
		this.resource('drone', { path: '/drones/:drone_id' });
		this.resource('assignments');
		this.resource('basestations');
		this.resource('users');
	});
	this.resource('login');
});

App.BaseRoute = Ember.Route.extend({
    beforeModel: function() {
        if(!this.customAdapter.linkLibrary.hasOwnProperty("login")) {
            this.customAdapter.find("home");
        }
    },
	
	setupController: function (controller, model) {
		this._super(controller, model);
		
		NProgress.done();
	},
	
	actions: {
		loading : function(transition, originRoute) {
			NProgress.start();
		},
	}
});

App.AuthRoute = App.BaseRoute.extend({
    beforeModel: function() {
        this._super();
        
        if (this.customAdapter.token().authToken == "") {
            this.transitionTo('login');
        }
    }
});

App.DashboardRoute = App.AuthRoute.extend({});

App.DronesRoute = App.AuthRoute.extend({
    model: function() {
        return this.customAdapter.find('drone').then(function(data){
			return data.resource;
		});
    }
});

App.PopupRoute = App.AuthRoute.extend({	
	renderTemplate: function(resource, resources) {
		this.render(resources);
		this.render(resource, {
			into: 'App',
			outlet: 'modal'
		});
	}
});

App.DroneRoute = App.PopupRoute.extend({
    model: function(params) {
        return this.customAdapter.find('drone', params.drone_id);
    },
	renderTemplate: function() {
		this._super('drone', 'drones');
	}
});

App.LoginRoute = App.BaseRoute.extend({
	renderTemplate : function() {
		this.render('login', {into: ''});
	}
});