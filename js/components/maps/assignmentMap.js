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

        var polyline = L.polyline([], {color: '#1abc9c'}).addTo(self.get('map')); // TODO: smooth factor?
        self.set('dronePolyline', polyline);
    },

    updatepolyLine : function() {
        // cleanup
        if (this.get("completedAssignmentPolyline"))
            this.get("map").removeLayer(this.get("completedAssignmentPolyline"));
        if (this.get("uncompletedAssignmentPolyline"))
            this.get("map").removeLayer(this.get("uncompletedAssignmentPolyline"));

        // assignment line
        var polylineCompleted = L.polyline([], {color: 'green'}).addTo(this.get('map')); // TODO: smooth factor?
        var polylineUncomplete = L.polyline([], {color: 'blue'}).addTo(this.get('map')); // TODO: smooth factor?
        var progress = this.get("progress");
        $.each(this.get('marker'), function(index,data) {
            if (index < progress) {
                polylineUncomplete.addLatLng(data.getLatLng());
            } else if (progress == index) {
                polylineUncomplete.addLatLng(data.getLatLng());// last point of
                polylineCompleted.addLatLng(data.getLatLng()); // first point of
            } else {
                polylineCompleted.addLatLng(data.getLatLng());
            }
        });
        this.set('completedAssignmentPolyline', polylineCompleted);
        this.set('completedAssignmentPolyline', polylineUncomplete);

        if (this.get('dronePolyline') && this.get('droneLocation'))
            this.get('dronePolyline').addLatLng(this.get('droneLocation'));
    },

    updateMarker : function() {
        this._super();

        var drone = this.get("droneLocation");
        var marker = this.get("droneMarker");
        if (drone) {
            if (marker) {
                // TODO: marker set latlng
            } else {
                // TODO: create marker with latlng
            }
        } else {
            if (marker) {
                this.get("map").removeLayer(marker);
                this.set("droneMarker", null);
            }
        }

        this.updatepolyLine();
    }

});