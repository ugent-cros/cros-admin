App.UserDisplayComponent = Ember.Component.extend({

    fullName : function(k,v) {
        // NOTE: this is a hack, you can not set this property!!!
        if (arguments.length > 1)
            return v;

        var self = this;
        App.AuthManager.set("currentAdapter",this.customAdapter);
        App.AuthManager.get("user").then(function(data) {
            self.set("fullName",data.firstName + " " + data.lastName);
        });
    }.property(),

    userId : function(k,v) {
        // NOTE: this is a hack, you can not set this property!!!
        if (arguments.length > 1)
            return v;

        var self = this;
        App.AuthManager.set("currentAdapter",this.customAdapter);
        App.AuthManager.get("user").then(function(data) {
            self.set("userId", data.id);
        });
    }.property(),

    actions : {
        logout : function() {
            this.sendAction('action');
        }

    }

});