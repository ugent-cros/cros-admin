App.AssignmentsController = Ember.Controller.extend({
    columns : ['#','Priority','Creator','Drone','Actions'],

    //Actions
    actions: {
        delete: function (id) {
            this.customAdapter.remove("assignment", id);
        },

        getPage: function (page, perPage){
            var self = this;
            this.customAdapter.find('assignment', null, null, {pageSize : perPage, page : (page-1)}).then(function(data){
                self.set('model',data);
                return data;
            });
        }
    }
});