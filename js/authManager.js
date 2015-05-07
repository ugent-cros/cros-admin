/**
 * Created by matthias on 30/03/2015.
 */

window.AuthManager = Ember.Object.extend({

    cookieName : "authToken",
    redirectUrl : "dashboard", // TODO: change to actual route
    authToken : null,
    _private_user : null,
    user : function() {
        if (!this.get("_private_user"))
            this.fetchUserInfo();
        return this.get("_private_user");
    }.property("_private_user"),

    isLoggedIn : function() {
        return this.token() != null;
    }.property("authToken"),

    logout: function(){
        this.adapter.set("linkLibrary",{});
        this.set("_private_user", undefined);
        $.removeCookie(this.get("cookieName"));
        this.set("authToken", null);
    },

    login : function(selfCaller, email, password) {
        var result = this.adapter.post("login", { "emailAddress" : email, "password" : password });
        var temp = this.get("cookieName");
        var self = this;
        return result.then(function(data) {
            $.cookie(temp, data.authToken);
            self.set("authToken", data.authToken);
            self.fetchUserInfo();
        });
    },

    fetchUserInfo : function() {
        var self = this;
        return this.adapter.find("user", null, "me").then(function(data) {
            self.set("_private_user", data);
        });
    },

    token : function() {
        if (this.get("authToken") === null) {
            var token = $.cookie(this.cookieName);

            if (token == null){
                return null;
            } else {
                this.set("authToken", token);
            }
        }

        return this.get("authToken");
    }

});