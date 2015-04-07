/**
 * Created by Eveline on 5/04/2015.
 */
App.ListSuperController = Ember.Controller.extend({

    loadPage: function(search, page, perPage){
        var self = this;
        var elementClass = self.get('element');
        var searchField = self.get('searchField');
        var params = {pageSize : perPage, page : (page-1), total: true};
        params[searchField] = search;
        this.customAdapter.find(elementClass, null, null, params).then(function(data){
            self.set('model',data);
            return data;
        });
    },

    //Actions
    actions: {
        delete: function (id) {
            var elementClass = this.get('element');
            this.customAdapter.remove(elementClass, id);
            this.loadPage(null,1,2);
        },

        getPage: function (search, page, perPage){
            this.loadPage(search,page,perPage);
            //todo: if total = 0
        }
    }
});