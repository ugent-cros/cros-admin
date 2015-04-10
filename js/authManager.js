/**
 * Created by matthias on 30/03/2015.
 */

window.AuthManager = Ember.Object.extend({

    cookieName : "authToken",
    redirectUrl : "dashboard", // TODO: change to actual route
    authToken : null,
    user : null,

    isLoggedIn : function() {
        return this.token() != null;
    }.property("authToken"),

    logout: function(){
        this.set("authToken", null);
        $.removeCookie(this.get("cookieName"), {path:'/'});
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
            self.set("user", data);
        });
    },

    token : function() {
        if (this.authToken == null) {
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