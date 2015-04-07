App.Router.map(function(){
	this.resource('App', { 'path' : '/' }, function() {
		this.resource('dashboard');
		this.resource('drones');
		this.resource('drones-add', { path: '/drones/add' });
		this.resource('drone', { path: '/drones/:drone_id' });
		this.resource('drone-edit', { path: '/drones/:drone_id/edit' });
		this.resource('assignments');
		this.resource('assignments-add', { path: '/assignments/add' });
		this.resource('assignment', { path: '/assignments/:assignment_id' });
		this.resource('basestations');
		this.resource('basestation', { path: '/basestations/:basestation_id' });
		this.resource('users');
		this.resource('users-add', { path: '/users/add' });
		this.resource('user', { path: '/users/:user_id' });
		this.resource('user-edit', { path: '/drones/:user_id/edit' });
        this.resource('unauthorised');
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

    afterModel: function() {
        NProgress.done();
    },

    checkStatus : function(response, self) {
        switch (response.status) {
            case 401 :
                self.transitionTo("unauthorised");
                break;
        }
    },

    fetch: function(params) {
        var self = this;
        var promise = this.customAdapter.find(params.store,params.id,params.action,params.options);
        if (params.callback) {
            return promise.then(params.callback).fail(function(jxhr) {
                self.checkStatus(jxhr,self);
            });
        }
        return promise.fail(function(jxhr) {
            self.checkStatus(jxhr,self);
        });
    },
	
	actions: {
		loading : function(transition, originRoute) {
			NProgress.start();
            return true;
		}
	}
});

App.AuthRoute = App.BaseRoute.extend({
    beforeModel: function() {
        this._super();

        if (!App.AuthManager.get("isLoggedIn")) {
            this.transitionTo('login');
        }

        if (!App.currentSocketManager) {
            App.currentSocketManager = App.SocketManager.create({url: this.customAdapter.host + this.customAdapter.linkLibrary["datasocket"]});
        }

        App.currentSocketManager.initConnection();
    }
});

App.AppRoute = App.BaseRoute.extend({});

App.UnauthorisedRoute = App.BaseRoute.extend({});

App.DashboardRoute = App.AuthRoute.extend({});

App.DashboardController = Ember.Controller.extend({
	v : false
});

App.DronesRoute = App.AuthRoute.extend({
    model: function() {
        return this.fetch({store:'drone', callback: function(data) {
            return data.resource;
        }});
    }
});

App.AssignmentsRoute = App.AuthRoute.extend({
    model: function() {
        return this.fetch({store:'assignment', callback: function(data) {
            return data.resource;
        }});
    }
});

App.BasestationsRoute = App.AuthRoute.extend({
    model: function() {
        return this.fetch({store:'basestation', callback: function(data) {
            return data.resource;
        }});
    }
});

App.UsersRoute = App.AuthRoute.extend({
    model: function() {
        return this.fetch({store:'user', callback: function(data) {
            return data.resource;
        }});
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
        return this.fetch({store:'drone', id: params.drone_id });
    },
	
	setupController: function(controller, model) {
		this._super(controller,model);
		controller.initRegistration(model.id);
    },
	
	renderTemplate: function() {
		this._super('drone', 'drones');
	}
});

App.DronesAddRoute = App.PopupRoute.extend({
	renderTemplate: function() {
		this._super('drones-add', 'drones');
	}
});

App.AssignmentRoute = App.PopupRoute.extend({
    model: function(params) {
        return this.fetch({store:'assignment', id: params.assignment_id});
    },
	renderTemplate: function() {
		this._super('assignment', 'assignments');
	}
});

App.AssignmentsAddRoute = App.PopupRoute.extend({
	setupController: function (controller, model) {
		this._super(controller, model);
		this.customAdapter.find('basestation').then(function(data){
			controller.set('basestations', data.resource);
		})
	},
	renderTemplate: function() {
		this._super('assignments-add', 'assignments');
	}
});

App.BasestationRoute = App.PopupRoute.extend({
    model: function(params) {
        return this.fetch({store:'basestation', id: params.basestation_id });
    },
	renderTemplate: function() {
		this._super('basestation', 'basestations');
	}
});

App.UserRoute = App.PopupRoute.extend({
    model: function(params) {
        return this.fetch({store:'user', id: params.user_id });
    },
	renderTemplate: function() {
		this._super('user', 'users');
	}
});

App.UserEditRoute = App.PopupRoute.extend({
	model: function(params) {
		if(params.user_id)
			return this.fetch({store:'user', id: params.user_id });
		else
			return new Object();
	},
	renderTemplate: function() {
		this._super('user-edit', 'users');
	}
});

App.UsersAddRoute = App.UserEditRoute.extend({
	controllerName: 'user-edit',
});

App.LoginRoute = App.BaseRoute.extend({
	renderTemplate : function() {
		this.render('login', {into: ''});
	}
});