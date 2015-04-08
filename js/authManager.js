/**
 * Created by matthias on 30/03/2015.
 */

/**
 * Created by matthias on 30/03/2015.
 */

var AuthManagerClass = Ember.Object.extend({

    cookieName : "authToken",
    redirectUrl : "dashboard", // TODO: change to actual route
    authToken : null,
    currentAdapter : null,
    _private_user : null,
    user : function() {
        if (this.get("_private_user"))
            return $.Deferred(function(defer) { defer.resolveWith(this,[this.get("_private_user")]); }).promise();

        var self = this;
        return this.fetchUserInfo().then(function() {
            return self.get("_private_user");
        });
    }.property(),

    isLoggedIn : function() {
        return this.token() != null;
    }.property("authToken"),

    logout: function(){
        this.set("authToken", null);
        $.removeCookie(this.get("cookieName"), {path:'/'});
    },

    login : function(selfCaller, email, password) {
        this.set("currentAdapter", selfCaller.customAdapter);
        var result = this.get("currentAdapter").post("login", { "emailAddress" : email, "password" : password });
        var temp = this.get("cookieName");
        var self = this;
        return result.then(function(data) {
            $.cookie(temp, data.authToken);
            self.set("authToken", data.authToken);
        });
    },

    fetchUserInfo : function() {
        var self = this;
        return this.get("currentAdapter").find("user", null, "me").then(function(data) {
            self.set("_private_user", data);
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

App.AuthManager = AuthManagerClass.create();