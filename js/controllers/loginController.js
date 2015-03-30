App.LoginController = Ember.Controller.extend({
  
	emailError : "",
	passwordError : "",
	
	emailInput : "",
	passwordInput : "",
  
    actions : {
		login : function() {
			var result = this.customAdapter.post("login", { "emailAddress" : this.get('emailInput'), "password" : this.get('passwordInput') });
			var self = this;
			result.then(function(data) {
				$.cookie("authToken", data.authToken);
				App.Auth = Ember.Object.create({
                    authToken : data.authToken
                });
				
				self.transitionToRoute('dashboard'); // TODO: redirect to correct route
			}, function(data) {
				if (data.status == 401) {
					self.set('emailError', "the password was incorrect");
				} else {
					self.set('emailError', data.responseJSON.emailAddress);
					self.set('passwordError', data.responseJSON.password);
					console.log("failed");
				}
			});
		}
    }
        
  
});