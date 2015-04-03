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

        var polyline = L.polyline([], {color: 'blue'}).addTo(this.get('map'));
        this.set('polyline', polyline);
    },

    updateMarker : function() {
        this._super();

        this.get('polyline').addLatLng(this.get('location'));
    }.observes('location')

});