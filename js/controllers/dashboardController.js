/**
 * Created by matthias on 14/04/2015.
 */

App.DashboardController = Ember.Controller.extend({
    v : false,

    init : function() {
        this._super();

        this.fetchLocations();
    },

    locations : undefined,

    fetchLocations : function() {
        var self = this;

        // get all drone locations
        this.adapter.find("drone", null, null).then(function(data) {
            var tempLocations = [];
            var promises = [];
            $.each(data.resource,function(i,d) {
                promises.pushObject(self.adapter.find("drone", d.id, "location").then(function(data) {
                    tempLocations.pushObject([data.location.longitude, data.location.latitude, "drone"]);
                }));
            });

            $.when.apply($, promises).then(function() {
                var locs = self.get("locations") || [];
                locs.pushObjects(tempLocations);
            });
        });

        // get all basestation locations
        this.adapter.find("basestation", null, null).then(function(data) {
            var tempLocations = [];
            var promises = [];
            $.each(data.resource,function(i,d) {
                promises.pushObject(self.adapter.find("basestation", d.id, null).then(function(data) {
                    tempLocations.pushObject([data.location.longitude,data.location.latitude,"basestation"]);
                }));
            });

            $.when.apply($, promises).then(function() {
                var locs = self.get("locations") || [];
                locs.pushObjects(tempLocations);
                self.set("locations", locs);
            });
        });
    }


});