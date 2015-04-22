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
    droneIcon : L.icon({
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
        this.updatepolyLine();

        var polyline = L.polyline([], {color: '#1abc9c', opacity: 1}).addTo(this.get('map')); // TODO: smooth factor?
        this.set('dronePolyline', polyline);

        this.addObserver('droneLocation.lon',this,this.updateMarker);
        this.addObserver('droneLocation.lat',this,this.updateMarker);
        this.addObserver('droneLocation.lon',this,this.updateMap);
        this.addObserver('droneLocation.lat',this,this.updateMap);
    },

    updatepolyLine : function() {
        if (this.get("polyline")) {
            var pos = this.get("polyline").getLatLngs();

            var markers = this.get("marker");
            var needsUpdate = false;
            $.each(pos,function(i) {
                var p = markers[i].getLatLng();
                needsUpdate = needsUpdate || this.lat != p.lat || this.lon != p.lon;
            });
            if (!needsUpdate)
                return;

            this.get("map").removeLayer(this.get("polyline"));
        }
        var polyline = L.polyline([], {color: 'blue'}).addTo(this.get('map'));
        $.each(this.get('marker'), function(index,data) {
            polyline.addLatLng(data.getLatLng());
        });
        this.set('polyline', polyline);

        if (this.get('dronePolyline') && this.get('droneLocation'))
            this.get('dronePolyline').addLatLng(this.get('droneLocation'));
    },

    updateMarker : function() {
        this._super();

        var drone = this.get("droneLocation");
        var marker = this.get("droneMarker");
        if (drone) {
            if (marker) {
                marker.setLatLng(drone);
            } else {
                var marker = L.marker(drone, {id: null, icon: this.get("droneIcon")}).addTo(this.get('map'));
                this.set("droneMarker", marker);
            }
        } else {
            if (marker) {
                this.get("map").removeLayer(marker);
                this.set("droneMarker", null);
            }
        }

        this.updatepolyLine();
    },

    updateMap : function() {
        if (!this.get("centered"))
            return;

        var loc = this.get('location');
        var map = this.get('map');
        updateZoom = typeof(updateZoom) === "boolean" ? updateZoom : false;

        if (map) {
            var zoomLevel = updateZoom || typeof(map.getZoom()) !== "number" ? 13 : map.getZoom();
            if (! loc)
                map.setView([0,0],1);
            else if (loc instanceof Array) {
                if (this.get("droneLocation"))
                    loc = loc.concat(this.get("droneLocation"));
                map.fitBounds(loc, {padding: [50, 50]});
            } else
                map.setView(loc,zoomLevel);
        }
    }

});