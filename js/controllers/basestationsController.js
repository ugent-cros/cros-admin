App.BasestationsController = Ember.Controller.extend({
    columns : ['#','Name','Actions'],
    store : 'basestation',

    //Paging
    privateTotalElements: 0,

    totalElements: function() {
        this.fetchTotalElements();
        return this.get("privateTotalElements");
    }.property('privateTotalElements'),

    fetchTotalElements: function() {
        var self = this;
        this.customAdapter.find("basestation", null, "total").then(function(data){
            self.set("privateTotalElements", data.total);
        });
    },

    //Actions
    actions: {
        delete: function (id) {
            this.customAdapter.remove("basestation", id);
        },

        getPage: function (page, perPage){
            var self = this;
            this.customAdapter.find('basestation', null, null, {pageSize : perPage, page : (page-1)}).then(function(data){
                self.set('model',data.resource);
                return data.resource;
            });
        }
    }
});