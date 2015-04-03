/**
 * Created by matthias on 3/04/2015.
 */

App.BasestationMapComponent = App.MyMapComponent.extend({

    icon : L.icon({
        iconUrl: 'img/marker-icon.png', // TODO: change icon
        shadowUrl: 'img/marker-shadow.png',

        iconSize:     [25, 41], // size of the icon
        shadowSize:   [41, 41], // size of the shadow
        iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
        shadowAnchor: [12, 41],  // the same for the shadow
        popupAnchor:  [0, -41] // point from which the popup should open relative to the iconAnchor
    })

});