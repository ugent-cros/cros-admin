/**
 * Created by matthias on 30/03/2015.
 */

App.AppController = Ember.Controller.extend({

    notification : "",
    notificationIsError : function() {
        return this.get('notification') !== "";
    }.property('notification'),

    init : function() {
        this._super();

        var self = this;
        App.currentSocketManager.register("notification",null, function(data) {
            if (data.action === "clear") {
                self.set('notification', "");
            } else {
                self.set('notification', data.message);
            }
        });
    },

    actions : {
        logout: function(){
            App.AuthManager.logout();
            this.transitionToRoute('login');
        },

        dismiss : function() {
            this.set('notification', "");
        }
    }

});