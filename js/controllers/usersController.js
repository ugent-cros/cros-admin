App.UsersController = Ember.Controller.extend({
    columns : ['#','Name','E-mail','Role','Actions'],

    //Actions
    actions: {
        delete: function (id) {
            this.customAdapter.remove("user", id);
        },

        getPage: function (page, perPage){
            var self = this;
            this.customAdapter.find('user', null, null, {pageSize : perPage, page : (page-1)}).then(function(data){
                self.set('model',data);
                return data;
            });
        }
    }
});