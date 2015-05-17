/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for a list of users
 * @class UsersController
 * @namespace App
 * @constructor
 * @extends App.ListSuperController
 */
App.UsersController = App.ListSuperController.extend({

    /**
     * List representing the columns in the table
     *
     * @public
     * @property columns {Array|Object}
    */
    /**
     * Title of the column
     *
     * @public
     * @property columns.label {String}
    */
    /**
     * Representing name for rest objects
     *
     * @public
     * @property columns.value {String}
    */
    /**
     * expresses if the column is sortable for that parameter
     *
     * @public
     * @property columns.sortable {boolean}
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
     * @public
     * @property {string} element
     */
    element : 'user',

    /**
     * List of the possible parameters where a user can search on
     *
     * @public
     * @property searchFields
     */
    searchFields : ["firstName", "lastName"]
});

/**
 * This will create a new controller for editing users
 * @class UserEditController
 * @namespace App
 * @constructor
 * @extends Ember.Controller
 */
App.UserEditController = Ember.Controller.extend({
    needs: 'users',
    index: Ember.computed.alias("controllers.users"),

    /**
     * the error message concerning the firstname
     * @public
     * @property firstNameError {String}
     */
	firstNameError: "",
    /**
     * the error message concerning the lastname
     * @public
     * @property lastNameError {String}
     */
	lastNameError: "",
    /**
     * the error message concerning the email
     * @public
     * @property emailError {String}
     */
	emailError: "",
    /**
     * the error message concerning the password
     * @public
     * @property passwordError {String}
     */
	passwordError: "",
    /**
     * Whether there is currently an error concerning the firstname
     * @public
     * @property hasFirstNameError {boolean}
     */
    hasFirstNameError : function() {
        return this.get('firstNameError') !== "";
    }.property('firstNameError'),
    /**
     * Whether there is currently an error concerning the lastname
     * @public
     * @property hasLastNameError {boolean}
     */
    hasLastNameError : function() {
        return this.get('lastNameError') !== "";
    }.property('lastNameError'),
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
     * All possible roles
     * @public
     * @property roles {Array|Object}
     */
	roles: [
		{name: "User", value: "USER"},
		{name: "Admin", value: "ADMIN"},
		{name: "Read-only admin", value: "READONLY_ADMIN"}
	],

    /**
     * This function will transition to the route of the user when he has been successfully added.
     *
     * @private
     * @param id id of th new user.
     */
	success: function(id) {
		this.transitionToRoute('user', id);
	},

    /**
     * This function will be called when the REST call fails. It will handle all the error messages.
     * @param data the error data
     */
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