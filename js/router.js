App.Router.map(function(){
	this.resource('App', { 'path' : '/' }, function() {
		this.resource('dashboard');
		this.resource('drones');
		this.resource('drone', { path: '/drones/:drone_id' });
		this.resource('assignments');
		this.resource('assignment', { path: '/assignments/:assignment_id' });
		this.resource('basestations');
		this.resource('basestation', { path: '/basestations/:basestation_id' });
		this.resource('users');
		this.resource('user', { path: '/users/:user_id' });
        this.resource('unauthorised');
	});
	this.resource('login');
});

App.BaseRoute = Ember.Route.extend({
    beforeModel: function() {
        if(!this.customAdapter.linkLibrary.hasOwnProperty("login")) {
            this.customAdapter.find("home");
        }
		
		if (!App.currentSocketManager) {
			App.currentSocketManager = App.SocketManager.create({ url : this.customAdapter.host + this.customAdapter.linkLibrary["datasocket"] });
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
        
        if (this.customAdapter.token().authToken == "") {
            this.transitionTo('login');
        }
    }
});

App.AppRoute = App.AuthRoute.extend({});

App.UnauthorisedRoute = App.BaseRoute.extend({});

App.DashboardRoute = App.AuthRoute.extend({});

App.DashboardController = Ember.Controller.extend({
	v : false
});

App.DronesRoute = App.AuthRoute.extend({
    model: function() {
        var self = this;
        return this.customAdapter.find('drone').then(function(data){
            return data.resource;
		}).fail(function(jxhr) {
            self.checkStatus(jxhr,self);
        });
    }
});

App.AssignmentsRoute = App.AuthRoute.extend({
    model: function() {
        var self = this;
        return this.customAdapter.find('assignment').then(function(data){
            return data.resource;
        }).fail(function(jxhr) {
            self.checkStatus(jxhr,self);
        });
    }
});

App.BasestationsRoute = App.AuthRoute.extend({
    model: function() {
        var self = this;
        return this.customAdapter.find('basestation').then(function(data){
            return data.resource;
        }).fail(function(jxhr) {
            self.checkStatus(jxhr,self);
        });
    }
});

App.UsersRoute = App.AuthRoute.extend({
    model: function() {
        var self = this;
        return this.customAdapter.find('user').then(function(data){
            return data.resource;
        }).fail(function(jxhr) {
            self.checkStatus(jxhr,self);
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
        var self = this;
        return this.customAdapter.find('drone', params.drone_id).fail(function(jxhr) {
            self.checkStatus(jxhr,self);
        });
    },
	
	setupController: function(controller, model) {
		this._super(controller,model);
		controller.initRegistration(model.id);
    },
	
	renderTemplate: function() {
		this._super('drone', 'drones');
	}
});

App.AssignmentRoute = App.PopupRoute.extend({
    model: function(params) {
        var self = this;
        return this.customAdapter.find('assignment', params.assignment_id).fail(function(jxhr) {
            self.checkStatus(jxhr,self);
        });
    },
	renderTemplate: function() {
		this._super('assignment', 'assignments');
	}
});

App.BasestationRoute = App.PopupRoute.extend({
    model: function(params) {
        var self = this;
        return this.customAdapter.find('basestation', params.basestation_id).fail(function(jxhr) {
            self.checkStatus(jxhr,self);
        });
    },
	renderTemplate: function() {
		this._super('basestation', 'basestations');
	}
});

App.UserRoute = App.PopupRoute.extend({
    model: function(params) {
        var self = this;
        return this.customAdapter.find('user', params.user_id).fail(function(jxhr) {
            self.checkStatus(jxhr,self);
        });
    },
	renderTemplate: function() {
		this._super('user', 'users');
	}
});

App.LoginRoute = App.BaseRoute.extend({
	renderTemplate : function() {
		this.render('login', {into: ''});
	}
});