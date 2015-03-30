App.LoginController = Ember.Controller.extend({
  
	emailError : "",
	passwordError : "",
	
	emailInput : "",
	passwordInput : "",
  
    actions : {
		login : function() {
			var result = App.AuthManager.login(this, this.get('emailInput'), this.get('passwordInput'));
            var self = this;
            result.then(function(success) {

                if (success) {
                    self.transitionToRoute('dashboard');
                } else {
                    self.transitionToRoute('login');
                }

            });
		}
    }
        
  
});