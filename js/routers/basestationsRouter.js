/**
 * Created by matthias on 11/04/2015.
 */

App.BasestationsRoute = App.AuthRoute.extend({
    model: function() {
        /*return this.fetch({store:'basestation', options : {pageSize : 2, page : 0, total:true}, callback: function(data) {
            return data;
        }});*/
    }
});

App.BasestationRoute = App.PopupRoute.extend({
    model: function(params) {
        return this.fetch({store:'basestation', id: params.basestation_id });
    },
    renderTemplate: function() {
        this._super('basestation', 'basestations');
    }
});

App.BasestationEditRoute = App.PopupRoute.extend({
    model: function(params) {
        if(params.basestation_id)
            return this.fetch({store:'basestation', id: params.basestation_id });
        else
            return {location:{}};
    },
    renderTemplate: function() {
        this._super('basestations-edit', 'basestations');
    }
});

App.BasestationsAddRoute = App.BasestationEditRoute.extend({
    controllerName: 'basestation-edit'
});