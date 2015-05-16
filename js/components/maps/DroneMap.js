/**
 * Created by matthias on 3/04/2015.
 */

/**
 * @module cros-admin
 * @submodule components
 */

/**
 * This map is used to display a drones location an it's path.
 *
 * @class DroneMapComponent
 * @namespace App
 * @constructor
 * @extends App.PopupMapComponent
 */
App.DroneMapComponent = App.PopupMapComponent.extend({

    /**
     * The icon used to represent a drone.
     * @private
     * @property icon {L.Icon}
     */
    icon : L.icon({
        iconUrl: 'img/droneMarker.png',
        shadowUrl: 'img/marker-shadow.png',

        iconSize:     [40, 40], // size of the icon
        shadowSize:   [0,  0 ], // size of the shadow
        iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
        shadowAnchor: [0 , 0 ],  // the same for the shadow
        popupAnchor:  [0,  0 ] // point from which the popup should open relative to the iconAnchor
    }),
    /**
     * The line to represent the drones path
     * @private
     * @property polyline {L.Polyline}
     */
    polyline : null,

    initialization : function(){
        this._super();

        var polyline = L.polyline([], {color: 'blue'}).addTo(this.get('map'));
        this.set('polyline', polyline);
    },

    updateMarker : function() {
        this._super();

        if (this.get('polyline'))
            this.get('polyline').addLatLng(this.get('location'));
    }

});