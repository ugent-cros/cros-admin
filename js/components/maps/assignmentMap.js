/**
 * Created by matthias on 3/04/2015.
 */

App.AssignmentMapComponent = App.MyMapComponent.extend({

    icon : L.icon({
        iconUrl: 'img/checkpointMarker.png',
        shadowUrl: 'img/marker-shadow.png',

        iconSize:     [40, 40], // size of the icon
        shadowSize:   [0,  0 ], // size of the shadow
        iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
        shadowAnchor: [0 , 0 ],  // the same for the shadow
        popupAnchor:  [0,  0 ] // point from which the popup should open relative to the iconAnchor
    }),
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