/**
 * Created by matthias on 6/04/2015.
 */

/**
 * @module cros-admin
 * @submodule components
 */

/**
 * This map is intended to display maps for creating a new basestation.
 * You can select the position by clicking on the map.
 *
 * @class BasestationAddMapComponent
 * @namespace App
 * @constructor
 * @extends App.BasestationMapComponent
 */
App.BasestationAddMapComponent = App.BasestationMapComponent.extend({

    didInsertElement : function(){
        this._super();
        var self = this;

        $('.modal').on('shown.bs.modal', function (e) {
            self.get('map').on('click', function(e) {
                self.set('location', Ember.Object.create({lat : e.latlng.lat, lon : e.latlng.lng}));
            });
        });
    }

});