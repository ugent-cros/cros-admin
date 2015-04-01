App.UsersController = Ember.Controller.extend({
    columns : ['#','Name','E-mail','Role','Actions'],

    //Paging
    privateTotalElements: 0,

    totalElements: function() {
        this.fetchTotalElements();
        return this.get("privateTotalElements");
    }.property('privateTotalElements'),

    fetchTotalElements: function() {
        var self = this;
        this.customAdapter.find("user", null, "total").then(function(data){
            self.set("privateTotalElements", data.total);
        });
    },

    //Actions
    actions: {
        delete: function (id) {
            this.customAdapter.remove("user", id);
        },

        getPage: function (page, perPage){
            var self = this;
            this.customAdapter.find('user', null, null, {pageSize : perPage, page : (page-1)}).then(function(data){
                self.set('model',data.resource);
                return data.resource;
            });
        }
    }
});