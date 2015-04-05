/**
 * Created by matthias on 3/04/2015.
 */

App.DroneMapComponent = App.MyMapComponent.extend({

    icon : L.icon({
        iconUrl: 'img/marker-icon.png',
        shadowUrl: 'img/marker-shadow.png',

        iconSize:     [25, 41], // size of the icon
        shadowSize:   [41, 41], // size of the shadow
        iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
        shadowAnchor: [12, 41],  // the same for the shadow
        popupAnchor:  [0, -41] // point from which the popup should open relative to the iconAnchor
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