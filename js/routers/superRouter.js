/**
 * Created by matthias on 11/04/2015.
 */

/**
 * @module cros-admin
 * @submodule routers
 */

/**
 * This is a generic route which contains functionality that should be available in every other routers.
 * This mainly consists of setting the progress bar, fetching with the adapter and checking response status.
 *
 * @class BaseRoute
 * @namespace App
 * @constructor
 * @extends Ember.Route
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

    /**
     * When a request has failed, check the response status.
     * If this response status is "unauthorised", redirect to an unauthorised page.
     * TODO: this should actually check for "Forbidden" however, therefore the REST-api should be updated first
     *
     * @private
     * @method checkStatus
     * @param response
     * @param self
     */
    checkStatus : function(response, self) {
        switch (response.status) {
            case 401 :
                self.transitionTo("unauthorised");
                break;
        }
    },

    /**
     * This method makes calls to the adapter much simpler in syntax.
     *
     * @protected
     * @method fetch
     * @param params
     * @returns {*}
     */
    fetch: function(params) {
        var self = this;
        var promise = this.adapter.find(params.store,params.id,params.action,{query:params.options});
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

/**
 * @module cros-admin
 * @submodule routers
 */

/**
 * This route contains the functionality to check if the user is logged in.
 * If not user is logged in, the user will be redirected to the login page.
 * Otherwise, the socket connection will be setup (note that this setup will only happen if no connection is already available)
 * All routes which need to be authenticated, should extend from this route.
 *
 * @class AuthRoute
 * @namespace App
 * @constructor
 * @extends App.BaseRoute
 */
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

/**
 * @module cros-admin
 * @submodule routers
 */

/**
 * This route allows for rendering inside a bootstrap modal. It manages the correct url in the address bar.
 * It will make sure a selected parent template will be rendered as well.
 *
 * @class PopupRoute
 * @namespace App
 * @constructor
 * @extends App.AuthRoute
 */
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