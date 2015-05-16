/**
 * @module cros-admin
 * @submodule controllers
 */

App.LoginController = Ember.Controller.extend({
  
	emailError : "",
	passwordError : "",
    hasEmailError : function() {
        return this.get('emailError') !== "";
    }.property('emailError'),
    hasPasswordError : function() {
        return this.get('passwordError') !== "";
    }.property('passwordError'),
	
	emailInput : "",
	passwordInput : "",
  
    actions : {
		login : function() {

			var result = this.authManager.login(this.get('emailInput'), this.get('passwordInput'));
            var self = this;
            result.then(function() {
                self.transitionToRoute(self.authManager.get("redirectRoute"));
            },function(data) {
                if (data.status == 401) {
                    self.set('emailError', "");
                    self.set('passwordError', "the password was incorrect");
                } else {
                    self.set('emailError', data.responseJSON.emailAddress || "");
                    self.set('passwordError', data.responseJSON.password || "");
                }

                NProgress.done();

            });
		}
    }
        
  
});