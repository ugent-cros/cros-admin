window.App = Ember.Application.create();

App.initializer({
    name: "customAdapter",

    initialize: function (container, application) {
        application.register("my:manager", application.CustomAdapter);
        application.inject("controller", "customAdapter", "my:manager");
        application.inject("route", "customAdapter", "my:manager");
    }
});

App.CustomAdapter = DS.RESTAdapter.extend({
    linkLibrary : {},

    host : "http://localhost:9000",
    
    token : function() {
        if (App.Auth == null) {
            var token = $.cookie('authToken');

            if (token == null){
                return { authToken:"" };
            } else {
                App.Auth = Ember.Object.create({
                    authToken : token,
                });
            }
        }

        return App.Auth;
    },
    
    headers: function() {
        return {
            "X-AUTH-TOKEN" : this.token().authToken
        };
    }.property().volatile(),

    find : function(store, type, id, record) {
        if (store === "home") {
            var self = this;
            this.ajax(this.host, 'GET', {async : false}).then(function(data) {
                self.linkLibrary = data[store];
            });
        } else {
            return this.ajax(this.host + this.linkLibrary[store], 'GET').then(function(data) {
                return data[store];
            });
        }        
    },
    
    post : function(store, postData) {
		return this.ajax(this.host + this.linkLibrary[store], 'POST', {data: postData});/*.then(function(data) {
			return { success: true, value: data[store] };
		}, function(data) {
			return { success: false, value: data };
		});*/
	}
    
});