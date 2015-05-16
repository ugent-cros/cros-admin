/**
 * Created by matthias on 11/04/2015.
 */

/**
 * @module cros-admin
 * @submodule components
 */

/**
 * This map is intended to display maps for creating new assignments.
 * It allows for updating the route by clicking on the map or dragging markers around.
 *
 * @class AssignmentsAddMapComponent
 * @namespace App
 * @constructor
 * @extends App.AssignmentMapComponent
 */
App.AssignmentsAddMapComponent = App.AssignmentMapComponent.extend({

    initialization : function(){
        this._super();
        var self = this;

        // when clicking on map, add new marker
        self.get('map').on('click', function(e) {
            var location = self.get("location") || Ember.A();
            location.pushObject(Ember.Object.create({lat : e.latlng.lat, lon : e.latlng.lng}));
            self.set("location", location.copy()); // TODO; find better solution than copy
        });
    },

    createMarker : function(location, id) {
        var marker = L.marker(location, {id: id, icon: this.currentIcon(), draggable:'true'}).addTo(this.get('map'));
        var self = this;
        // update polyline while dragging
        marker.on('drag', function() {
            self.updatepolyLine();
        });

        // update location when drag is complete
        marker.on('dragend', function(event){
            var marker = event.target;
            var position = marker.getLatLng();
            var i = self.get("marker").indexOf(marker);

            var location = self.get("location") || Ember.A();
            location[i].set("lat", position.lat);
            location[i].set("lon", position.lng);
            self.set("location", location.copy()); // TODO; find better solution than copy
        });
        return marker;

    }


});