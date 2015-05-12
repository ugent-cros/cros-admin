/**
 * This will create a new controller for a list of users
 * @class UsersController
 * @constructor
 * @extends ListSuperController
 */
App.UsersController = App.ListSuperController.extend({

    /**
     * List representing the columns in the table
     *
     * @property columns
     * @property columns.label - Title of the column
     * @property columns.value - Representing name for rest objects
     * @property columns.sortable - expresses if the column is sortable for that parameter
     */
    columns : [{label:'#', value:"id", sortable:1},
        {label:'Name', value: "firstName", sortable:1},
        {label:'E-mail', value:"email", sortable:1},
        {label:'Role', value: "role", sortable:1},
        {label:'Actions', sortable:0}
    ],

    /**
     * Type of the elements
     *
     * @property {string} element
     */
    element : 'user',

    /**
     * List of the possible parameters where a user can search on
     *
     * @property searchFields
     */
    searchFields : ["firstName", "lastName"]
});

App.UserEditController = Ember.Controller.extend({
    needs: 'users',
    index: Ember.computed.alias("controllers.users"),
	firstNameError: "",
	lastNameError: "",
	emailError: "",
	passwordError: "",
    hasFirstNameError : function() {
        return this.get('firstNameError') !== "";
    }.property('firstNameError'),
    hasLastNameError : function() {
        return this.get('lastNameError') !== "";
    }.property('lastNameError'),
    hasEmailError : function() {
        return this.get('emailError') !== "";
    }.property('emailError'),
    hasPasswordError : function() {
        return this.get('passwordError') !== "";
    }.property('passwordError'),
	
	roles: [
		{name: "User", value: "USER"},
		{name: "Admin", value: "ADMIN"},
		{name: "Read-only admin", value: "READONLY_ADMIN"}
	],
	
	success: function(id) {
		this.transitionToRoute('user', id);
	},
	
	failure: function(data) {
		this.set('firstNameError', data.responseJSON.firstName || "");
		this.set('lastNameError', data.responseJSON.lastName || "");
		this.set('emailError', data.responseJSON.email || "");
		this.set('passwordError', data.responseJSON.password || "");
	},
	
	actions: {
		save: function(){
			var jsonObject = { user: this.model };
			if(this.model.id)
				var result = this.adapter.edit('user', this.model.id, jsonObject);
			else
				var result = this.adapter.post('user', jsonObject);
			var self = this;
			result.then(
				function(data) {
                    self.success(data.user.id);
                    self.get('index').refresh();
                },
				function(data) {
                    self.failure(data);
                    self.get('index').refresh();
                }
			);
		}
	}
});