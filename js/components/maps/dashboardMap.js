/**
 * Created by matthias on 14/04/2015.
 */

/**
 * @module cros-admin
 * @submodule components
 */

/**
 * This map is used to display both basestations and drones.
 * This means multiple icons are used.
 *
 * @class BasestationMapComponent
 * @namespace App
 * @constructor
 * @extends App.PopupMapComponent
 */
App.DashboardMapComponent = App.MyMapComponent.extend({

    /**
     * The icon used for basestations
     * @private
     * @property basestationIcon {L.Icon}
     */
    basestationIcon : L.icon({
        iconUrl: 'img/basestationMarker.png',
        shadowUrl: 'img/marker-shadow.png',

        iconSize:     [40, 40], // size of the icon
        shadowSize:   [0,  0 ], // size of the shadow
        iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
        shadowAnchor: [0 , 0 ],  // the same for the shadow
        popupAnchor:  [0,  0 ] // point from which the popup should open relative to the iconAnchor
    }),

    /**
     * The icon used for drones
     * @private
     * @property droneIcon {L.Icon}
     */
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
            switch (locations[i].type) {
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