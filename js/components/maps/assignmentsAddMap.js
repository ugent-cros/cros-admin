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
    }


});