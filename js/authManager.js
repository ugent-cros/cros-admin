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

    isLoggedIn : function() {
        return this.token() != null;
    }.property("authToken"),

    logout: function(){
        this.set("authToken", null);
        $.removeCookie(this.get("cookieName"), {path:'/'});
    },

    login : function(self, email, password) {
        var result = self.customAdapter.post("login", { "emailAddress" : email, "password" : password });
        var temp = this.get("cookieName");
        var self = this;
        return result.then(function(data) {
            $.cookie(temp, data.authToken);
            self.set("authToken", data.authToken);

            return true;
        }, function(data) {
            if (data.status == 401) {
                self.set('emailError', "the password was incorrect");
            } else {
                self.set('emailError', data.responseJSON.emailAddress);
                self.set('passwordError', data.responseJSON.password);
                console.log("failed");
            }
            return false;
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