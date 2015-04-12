
App.BasestationsController = App.ListSuperController.extend({
    columns : ['#','Name','Actions'],
    element : 'basestation',
    searchFields : ["name"]
});

App.BasestationEditController = Ember.Controller.extend({

    nameError : "",
    hasNameError : function() {
        return this.get('nameError') !== "";
    }.property('nameError'),

    location : function(key,value,previousValue) {
        // setter
        if (arguments.length > 1) {
            if (value) {
                this.set('model.location.longitude', value[0]);
                this.set('model.location.latitude', value[1]);
            } else {
                this.set('model.location.longitude', null);
                this.set('model.location.latitude', null);
            }
        }

        // getter
        if (!this.get("model.location"))
            this.set("model.location", {});
        var lat = this.get("model.location.latitude");
        var lon = this.get("model.location.longitude");

        if (lon && lat)
            return [lon, lat];
        else
            return null
    }.property("model.location.longitude", "model.location.latitude"),
    locationError : "",
    hasLocationError : function() {
        return this.get("locationError") !== "";
    }.property("locationError"),

    longitudeError : "",
    hasLongitudeError : function() {
        return this.get("longitudeError") !== "";
    }.property("longitudeError"),

    latitudeError : "",
    hasLatitudeError : function() {
        return this.get("latitudeError") !== "";
    }.property("latitudeError"),

    altitudeError : "",
    hasAltitudeError : function() {
        return this.get("altitudeError") !== "";
    }.property("altitudeError"),

    hasSomeError : function() {
        return this.get("hasAltitudeError") || this.get("hasLatitudeError") || this.get("hasLongitudeError") || this.get("hasLocationError");
    }.property("hasAltitudeError", "hasLatitudeError", "hasLongitudeError", "hasLocationError"),

    failure : function(result) {
        console.log("handle failure");
        this.set('nameError', result.responseJSON.name || "");
        this.set('locationError', result.responseJSON.location || "");
        this.set('longitudeError', result.responseJSON["location.longitude"] || "");
        this.set('latitudeError', result.responseJSON["location.latitude"] || "");
        this.set('altitudeError', result.responseJSON["location.altitude"] || "");
    },

    success : function(result) {
        this.transitionToRoute('basestation', result.basestation.id);
    },

    actions : {
        save: function(){

            var jsonObject = {
                basestation : this.get("model")
            };

            if (this.get("model.id"))
                var result = this.adapter.edit('basestation', this.get("model.id"), jsonObject);
            else
                var result = this.adapter.post('basestation', jsonObject);
            var self = this;
            result.then(
                function(data) { self.success(data); },
                function(data) { self.failure(data); }
            );
        }
    }
});