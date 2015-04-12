/**
 * Created by matthias on 11/04/2015.
 */

App.AssignmentsAddMapComponent = App.AssignmentMapComponent.extend({

    didInsertElement : function(){
        this._super();
        var self = this;

        $('.modal').on('shown.bs.modal', function (e) {
            self.get('map').on('click', function(e) {
                var location = self.get("location") || Ember.A();
                location.pushObject([e.latlng.lat, e.latlng.lng]);
                self.set("location", location.copy()); // TODO; find better solution than copy
            });
        });
    },

    createMarker : function(location, id) {
        var marker = L.marker(location, {id: id, icon: this.currentIcon(), draggable:'true'}).addTo(this.get('map'));
        var self = this;
        marker.on('drag', function() {
            self.updatepolyLine();
        });

        marker.on('dragend', function(event){
            var marker = event.target;
            var position = marker.getLatLng();
            var i = self.get("marker").indexOf(marker);

            var location = self.get("location") || Ember.A();
            location[i][0] = position.lat;
            location[i][1] = position.lng;
            self.set("location", location.copy()); // TODO; find better solution than copy
        });
        return marker;

    }


});