/**
 * Created by matthias on 3/04/2015.
 */

/**
 * @module cros-admin
 * @submodule components
 */

/**
 * This map is used to display a basestation.
 *
 * @class BasestationMapComponent
 * @namespace App
 * @constructor
 * @extends App.PopupMapComponent
 */
App.BasestationMapComponent = App.PopupMapComponent.extend({

    icon : L.icon({
        iconUrl: 'img/basestationMarker.png',
        shadowUrl: 'img/marker-shadow.png',

        iconSize:     [40, 40], // size of the icon
        shadowSize:   [0,  0 ], // size of the shadow
        iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
        shadowAnchor: [0 , 0 ],  // the same for the shadow
        popupAnchor:  [0,  0 ] // point from which the popup should open relative to the iconAnchor
    })

});