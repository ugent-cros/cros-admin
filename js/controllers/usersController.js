App.UsersController = Ember.Controller.extend({
    columns : ['#','Name','E-mail','Role','Actions']
});

App.UsersAddController = Ember.Controller.extend({
	roles: [
		{name: "User", value: "USER"},
		{name: "Admin", value: "ADMIN"},
		{name: "Read-only admin", value: "READONLY_ADMIN"}
	],
	
	success: function(id) {
		this.transitionToRoute('user', id);
		
	},
	
	failure: function(data) {
		if (data.status == 400) {
			if(!$('#userAlert')[0]) {
				$('#userAddAlert')
					.append($('<div>')
						.attr('id', 'userAlert')
						.attr('class', 'alert alert-danger alert-dismissible')
						.attr('role', 'alert')
					);
			}
			$('#userAlert').text('');
			if(data.responseJSON.firstName)
				$('#userAlert').append($('<p>').text('First name: ' + data.responseJSON.firstName));
			if(data.responseJSON.lastName)
				$('#userAlert').append($('<p>').text('Last name: ' + data.responseJSON.lastName));
			if(data.responseJSON.email)
				$('#userAlert').append($('<p>').text('E-mail: ' + data.responseJSON.email));
			if(data.responseJSON.password)
				$('#userAlert').append($('<p>').text('Password: ' + data.responseJSON.password));
			if(data.responseJSON.role)
				$('#userAlert').append($('<p>').text('Role: ' + data.responseJSON.role));
		}
	},
	
	actions: {
		save: function(){
			var user = new Object();
			user.firstName = this.firstName;
			user.lastName = this.lastName;
			user.email = this.email;
			user.password = this.password;
			user.role = this.role;
			console.log(JSON.stringify(user));
			
			var jsonObject = new Object();
			jsonObject.user = user;
			var result = this.customAdapter.post('user', jsonObject);
			var self = this;
			result.then(
				function(data) { self.success(data.user.id); },
				function(data) { self.failure(data); }
			);
		}
	}
});