/**
 * Created by Eveline on 5/04/2015.
 */
App.ListSuperController = Ember.Controller.extend({

    loadPage: function(search, searchField, page, perPage) {
        var self = this;
        var elementClass = self.get('element');
        var params = {pageSize: perPage, page: (page - 1), total: true};
        if (searchField != null) {
            params[searchField] = search;
        }
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
            var search = document.getElementById("searchbox").value;
            this.loadPage(search,1,2);
        },

        getPage: function (search, searchField, page, perPage){
            this.loadPage(search, searchField, page,perPage);
            //todo: if total = 0
        }
    }
});