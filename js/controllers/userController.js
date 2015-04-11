/**
 * Created by Eveline on 9/04/2015.
 */
App.UserController = Ember.ObjectController.extend({

    currentUser: function(){
        return this.authManager.get("user");
    }.property("authManager.user"),

    isNotCurrentUser: function(id){
        var user = this.get("currentUser");
        console.log(user);
        return (user.id != this.get('id'));
    }.property('id','currentUser'),

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