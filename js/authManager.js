/**
 * Created by matthias on 30/03/2015.
 */

/**
 * Created by matthias on 30/03/2015.
 */

var AuthManagerClass = Ember.Object.extend({

    cookieName : "authToken",
    redirectUrl : "dashboard", // TODO: change to actual route

    isLoggedIn : false,

    logout: function(){
        App.Auth = null;
        $.removeCookie(self.cookieName, {path:'/'});
        this.isLoggedIn = false;
        this.transitionToRoute('login');
    },

    login : function(self, email, password) {
        var result = self.customAdapter.post("login", { "emailAddress" : email, "password" : password });
        var temp = this.cookieName;
        return result.then(function(data) {
            $.cookie(temp, data.authToken);
            App.Auth = Ember.Object.create({
                authToken : data.authToken
            });
            this.isLoggedIn = true;

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
        if (App.Auth == null) {
            var token = $.cookie(this.cookieName);

            if (token == null){
                return { authToken: "" };
            } else {
                App.Auth = Ember.Object.create({
                    authToken : token
                });
            }
        }

        return App.Auth;
    }

});

App.AuthManager = AuthManagerClass.create();