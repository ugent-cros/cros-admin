/**
 * Created by matthias on 14/04/2015.
 */

/**
 * @module cros-admin
 * @submodule components
 */

/**
 * This component has the exact same functionality as {{#crossLink "App.MyMapComponent"}}{{/crossLink}}.
 * However it is set to only initialize when the bootstrap modal is fully shown.
 * This is to avoid any issues with sizes.
 *
 * @class PopupMapComponent
 * @namespace App
 * @constructor
 * @extends App.MyMapComponent
 */
App.PopupMapComponent = App.MyMapComponent.extend({

    didInsertElement : function(){
        var self = this;
        $('.modal').on('shown.bs.modal', function (e) {
            self.initialization();
        });
    }

});