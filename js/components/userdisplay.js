App.UserDisplayComponent = Ember.Component.extend({

    currentUser : function() {
        return this.authManager.get("user");
    }.property("authManager.user"),

    fullName : function() {
        if (this.get("currentUser"))
            return this.get('currentUser').firstName + " " + this.get('currentUser').lastName;
        else
            return "";
    }.property("currentUser"),

    userId : function() {
        if (this.get("currentUser"))
            return this.get("currentUser").id;
        else
            return null;
    }.property("authManager.user"),

    actions : {
        logout : function() {
            this.sendAction('action');
        }

    }

});