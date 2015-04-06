/**
 * Created by matthias on 3/04/2015.
 */

App.DroneMapComponent = App.MyMapComponent.extend({

    icon : L.icon({
        iconUrl: 'img/droneMarker.png',
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
            self.set('polyline', polyline);
        });
    },

    updateMarker : function() {
        this._super();

        if (this.get('polyline'))
            this.get('polyline').addLatLng(this.get('location'));
    }

});