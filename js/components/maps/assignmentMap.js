/**
 * Created by matthias on 3/04/2015.
 */

App.AssignmentMapComponent = App.PopupMapComponent.extend({

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

    initialization : function(){
        this._super();
        this.updatepolyLine();
    },

    updatepolyLine : function() {
        if (this.get("polyline"))
            this.get("map").removeLayer(this.get("polyline"));
        var polyline = L.polyline([], {color: 'blue'}).addTo(this.get('map'));
        $.each(this.get('marker'), function(index,data) {
            polyline.addLatLng(data.getLatLng());
        });
        this.set('polyline', polyline);
    },

    updateMarker : function() {
        this._super();

        this.updatepolyLine();
    }

});