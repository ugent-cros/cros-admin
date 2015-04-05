App.BasestationsController = Ember.Controller.extend({
    columns : ['#','Name','Actions'],
    store : 'basestation',

    //Actions
    actions: {
        delete: function (id) {
            this.customAdapter.remove("basestation", id);
        },

        getPage: function (page, perPage){
            var self = this;
            this.customAdapter.find('basestation', null, null, {pageSize : perPage, page : (page-1)}).then(function(data){
                self.set('model',data);
                return data;
            });
        }
    }
});