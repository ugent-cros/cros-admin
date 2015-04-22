/**
 * Created by matthias on 6/04/2015.
 */

App.BasestationAddMapComponent = App.BasestationMapComponent.extend({

    didInsertElement : function(){
        this._super();
        var self = this;

        $('.modal').on('shown.bs.modal', function (e) {
            self.get('map').on('click', function(e) {
                self.set('location', Ember.Object.create({lat : e.latlng.lat, lon : e.latlng.lng}));
            });
        });
    },

    updateMap : function() {
        Ember.run.once(this, 'updateFunction');
    },

    updateFunction : function() {
        var loc = this.get('location');
        var map = this.get('map');
        if (map)
            if (! loc)
                map.setView([0,0],1);
            else if (loc[0] instanceof Array)
                map.fitBounds(loc, {padding:[50,50]});
            else {
                var zoom = map.getZoom() || 13;
                map.setView(loc, zoom);
            }
    }

});