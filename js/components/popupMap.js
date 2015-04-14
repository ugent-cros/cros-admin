/**
 * Created by matthias on 14/04/2015.
 */

App.PopupMapComponent = App.MyMapComponent.extend({

    didInsertElement : function(){
        var self = this;
        $('.modal').on('shown.bs.modal', function (e) {
            self.initialization();
        });
    }

});