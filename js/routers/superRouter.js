/**
 * Created by matthias on 11/04/2015.
 */

App.BaseRoute = Ember.Route.extend({
    beforeModel: function() {
        if(!this.adapter.linkLibrary.hasOwnProperty("login")) {
            this.adapter.find("home");
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
        var promise = this.adapter.find(params.store,params.id,params.action,params.options);
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

        if (!this.authManager.get("isLoggedIn")) {
            this.transitionTo('login');
        } else {
            this.socketManager.initConnection();
        }
    }
});

App.PopupRoute = App.AuthRoute.extend({
    renderTemplate: function(resource, resources) {
        this.render(resources);
        this.render(resource, {
            into: 'App',
            outlet: 'modal'
        });
        this.set('resource', resource);
    },
    actions: {
        willTransition: function(transition) {
            this.controllerFor(this.get('resource')).send('reset');
        }
    }
});