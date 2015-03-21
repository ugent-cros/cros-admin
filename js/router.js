App.Router.map(function(){
    this.resource('dashboard');
    this.resource('drones');
    this.resource('assignments');
    this.resource('basestations');
    this.resource('users');
    this.resource('login');
});

App.BaseRoute = Ember.Route.extend({
    beforeModel: function() {
        if(!this.customAdapter.linkLibrary.hasOwnProperty("login")) {
            this.customAdapter.find("home");
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

App.DashboardRoute = App.AuthRoute.extend({});

App.DronesRoute = App.AuthRoute.extend({
    model: function() {
        return this.customAdapter.find('drones');
    }
});

App.LoginRoute = App.BaseRoute.extend({});