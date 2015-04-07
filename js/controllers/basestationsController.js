App.BasestationsController = Ember.Controller.extend({
    columns : ['#','Name','Actions']
});

App.BasestationsAddController = Ember.Controller.extend({

    name : "",
    nameError : "",
    hasNameError : function() {
        return this.get('nameError') !== "";
    }.property('nameError'),

    location : function(key,value,previousValue) {
        // setter
        if (arguments.length > 1) {
            if (value) {
                this.set('longitude', value[0]);
                this.set('latitude', value[1]);
            } else {
                this.set('longitude', null);
                this.set('latitude', null);
            }
        }

        // getter
        if (this.get('longitude') && this.get("latitude"))
            return [this.get('longitude'), this.get('latitude')];
        else
            return null
    }.property('longitude', 'latitude'),
    locationError : "",
    hasLocationError : function() {
        return this.get("locationError") !== "";
    }.property("locationError"),

    altitude: null,

    longitude : null,

    latitude : null,

    failure : function(result) {
        console.log("handle failure");
        this.set('nameError', result.responseJSON.name || "");
        this.set('locationError', result.responseJSON.location || "");
    },

    success : function(result) {
        this.transitionToRoute('basestation', result.basestation.id);
    },

    actions : {
        save: function(){

            var jsonObject = {
                basestation : {
                    name : this.get('name'),
                    location : {
                        longitude : this.get('longitude'),
                        altitude : this.get('altitude'),
                        latitude : this.get('latitude')
                    }
                }
            };

            var result = this.customAdapter.post('basestation', jsonObject);
            var self = this;
            result.then(
                function(data) { self.success(data); },
                function(data) { self.failure(data); }
            );
        }
    }

});