App.UserDisplayComponent = Ember.Component.extend({

    user : null,

    fullName : function() {
        if (this.get("user") == null) {
            this.fetchUser();
            return "";
        } else {
            var u = this.get("user");
            return u.firstName + " " + u.lastName;
        }
    }.property('user'),

    userId : function() {
        if (this.get("user") == null) {
            this.fetchUser();
            return "";
        } else {
            var u = this.get("user");
            return u.id;
        }
    }.property('user'),

    fetchUser : function() {
        var self = this;
        return this.customAdapter.find("user", null, "me").then(function(data) {
            self.set("user", data);
            return data.firstName + " " + data.lastName;
        });
    },

    actions : {
        logout : function() {
            this.sendAction('action');
        },

    }

    /*show: function() {
        this.$('.modal').modal('show');
        this.$('.modal').on('hide.bs.modal', function(e) {
            $('#closeModal').click();
        });
    }.on('didInsertElement')*/

});