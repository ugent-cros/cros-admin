/**
 * Created by matthias on 14/04/2015.
 */

App.DashboardController = Ember.Controller.extend({
    v : false,

    init : function() {
        this._super();

        this.fetchLocations();
    },

    locations : null,

    fetchLocations : function() {
        var self = this;

        // get all drone locations
        this.adapter.find("drone", null, null).then(function(data) {
            var tempLocations = [];
            var promises = [];
            $.each(data.resource,function(i,d) {
                promises.pushObject(self.adapter.find("drone", d.id, "location").then(function(data) {
                    tempLocations.pushObject(data.location);
                }));
            });

            $.when.apply($, promises).then(function() {
                var locs = self.get("locations") || [];
                locs.pushObjects(tempLocations);
            });
        });
    }


});