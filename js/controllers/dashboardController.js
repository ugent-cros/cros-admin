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
            $.each(data.resource,function(i,d) {
                self.adapter.find("drone", d.id, "location").then(function(data) {
                    var locs = self.get("locations") || [];
                    locs.pushObject([data.location.longitude, data.location.latitude, "drone"]);
                    self.set("locations", locs);
                });
            });
        });

        // get all basestation locations
        this.adapter.find("basestation", null, null).then(function(data) {
            $.each(data.resource,function(i,d) {
                self.adapter.find("basestation", d.id, null).then(function(data) {
                    var locs = self.get("locations") || [];
                    locs.pushObject([data.location.longitude,data.location.latitude,"basestation"]);
                    self.set("locations", locs);
                });
            });
        });
    }


});