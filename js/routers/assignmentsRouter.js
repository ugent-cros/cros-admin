/**
 * Created by matthias on 11/04/2015.
 */

App.AssignmentsRoute = App.AuthRoute.extend({
    model: function() {
        return this.fetch({store:'assignment', options : {pageSize : 2, page : 0, total:true}, callback: function(data) {
            return data;
        }});
    }
});

App.AssignmentsAddRoute = App.PopupRoute.extend({
    setupController: function (controller, model) {
        this._super(controller, model);
        this.adapter.find('basestation').then(function(data){
            controller.set('basestations', data.resource);
        })
    },
    renderTemplate: function() {
        this._super('assignments-add', 'assignments');
    }
});

App.AssignmentRoute = App.PopupRoute.extend({
    model: function(params) {
        return this.fetch({store:'assignment', id: params.assignment_id});
    },
    renderTemplate: function() {
        this._super('assignment', 'assignments');
    }
});