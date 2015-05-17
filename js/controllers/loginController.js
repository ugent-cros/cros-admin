/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for logging in
 * @class LoginController
 * @namespace App
 * @constructor
 * @extends Ember.Controller
 */
App.LoginController = Ember.Controller.extend({

    /**
     * the error message concerning the email
     * @public
     * @property emailError {String}
     */
	emailError : "",
    /**
     * the error message concerning the password
     * @public
     * @property passwordError {String}
     */
	passwordError : "",
    /**
     * Whether there is currently an error concerning the email
     * @public
     * @property hasEmailError {boolean}
     */
    hasEmailError : function() {
        return this.get('emailError') !== "";
    }.property('emailError'),
    /**
     * Whether there is currently an error concerning the password
     * @public
     * @property hasPasswordError {boolean}
     */
    hasPasswordError : function() {
        return this.get('passwordError') !== "";
    }.property('passwordError'),

    /**
     * The currently entered value for email address
     *
     * @public
     * @property emailInput {String}
     */
	emailInput : "",
    /**
     * The currently entered value for the password
     * @public
     * @property passwordInput {String}
     */
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