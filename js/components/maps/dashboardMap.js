/**
 * Created by matthias on 14/04/2015.
 */

App.DashboardMapComponent = App.MyMapComponent.extend({

    basestationIcon : L.icon({
        iconUrl: 'img/basestationMarker.png',
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

    updateMarker : function() {
        this._super();
        var self = this;

        var locations = self.get("location");
        $.each(this.get("marker"), function(i,marker) {
            switch (locations[i][2]) {
                case "drone" :
                    marker.setIcon(self.droneIcon);
                    break;
                case "basestation" :
                    marker.setIcon(self.basestationIcon);
                    break;
            }
        });
    }

});