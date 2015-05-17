/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for a user object
 * @class UserController
 * @namespace App
 * @constructor
 * @extends Ember.ObjectController
 */
App.UserController = Ember.ObjectController.extend({

    /**Logged in user*/
    currentUser: function(){
        return this.authManager.get("user");
    }.property("authManager.user"),

    /**
     * Check if the given id is the same of the logged in user
     * @param {number} id - Id of a user in the table
     * @return {Boolean} True if id differs with the id of the current user, False if the id's are equal
     */
    isNotCurrentUser: function(id){
        var user = this.get("currentUser");
        return (user.id != this.get('id'));
    }.property('id','currentUser'),

    /**
     * Determine the color of the label
     * @public
     * @property getClass {String}
     */
    getClass: function(){
        var label = "label "
        var role = this.get('role');
        if(role == "USER")
            return label + "label-primary";
        else if(role == "ADMIN")
            return label + "label-danger";
        else if(role == "READONLY_ADMIN")
            return label + "label-warning";
    }.property('role')
});