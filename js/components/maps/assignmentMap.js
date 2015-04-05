/**
 * Created by matthias on 3/04/2015.
 */

App.AssignmentMapComponent = App.MyMapComponent.extend({

    polyline : null,

    didInsertElement : function(){
        this._super();

        var self = this;
        $('.modal').on('shown.bs.modal', function (e) {
            var polyline = L.polyline([], {color: 'blue'}).addTo(self.get('map'));
            $.each(self.get('marker'), function(index,data) {
                polyline.addLatLng(data.getLatLng());
            });
            self.set('polyline', polyline);
        });
    },

    updateMarker : function() {
        this._super();

        var polyline = L.polyline([], {color: 'blue'}).addTo(this.get('map'));
        $.each(this.get('marker'), function(index,data) {
            polyline.addLatLng(data.getLatLng());
        });
        this.set('polyline', polyline);
    }.observes('location')

});