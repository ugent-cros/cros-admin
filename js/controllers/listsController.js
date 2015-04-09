/**
 * Created by Eveline on 5/04/2015.
 */
App.ListSuperController = Ember.Controller.extend({

    _private_role : null,

    userCanEdit: function() {
        if (!this.get("_private_role")) {
            this.fetchUserInfo();
        }
        return this.get("_private_role");
    }.property(),

    fetchUserInfo: function(){
        var self = this;
        return App.AuthManager.get("user").then(function (data) {
            console.log(data);
            var canEdit = false;
            if (data.role == "ADMIN") {
                canEdit = true;
            }
            self.set("_private_role", canEdit);
            return canEdit;
        });
    },

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
            //refresh
            var search = document.getElementById("searchbox").value;
            var searchField = document.getElementById("searchFields").value;
            var perPage = document.getElementById("perPage").value;
            this.loadPage(search,searchField,1,perPage);
        },

        getPage: function (search, searchField, page, perPage){
            this.loadPage(search, searchField, page,perPage);
            //todo: if total = 0
        }
    }
});