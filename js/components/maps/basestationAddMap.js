/**
 * Created by matthias on 6/04/2015.
 */

App.BasestationAddMapComponent = App.BasestationMapComponent.extend({

    didInsertElement : function(){
        this._super();
        var self = this;

        $('.modal').on('shown.bs.modal', function (e) {
            self.get('map').on('click', function(e) {
                console.log(e);
            });
        });
    }

});