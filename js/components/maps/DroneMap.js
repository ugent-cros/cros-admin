/**
 * Created by matthias on 3/04/2015.
 */

App.DroneMapComponent = App.PopupMapComponent.extend({

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

    initialization : function(){
        this._super();

        var polyline = L.polyline([], {color: 'blue'}).addTo(this.get('map'));
        this.set('polyline', polyline);
    },

    invalidateSize : function() {
        var map = this.get("map");
        Ember.run.scheduleOnce('afterRender', this, function() {
            if (map)
                map.invalidateSize();
        });
    }.observes("updateSize"),

    updateMarker : function() {
        this._super();

        if (this.get('polyline'))
            this.get('polyline').addLatLng(this.get('location'));
    }

});