/**
 * Created by Eveline on 5/04/2015.
 */
App.ListSuperController = Ember.Controller.extend({

    params: null,

    currentUser: function(){
        return this.authManager.get("user");
    }.property("authManager.user"),

    userCanEdit: function() {
        var user = this.get("currentUser");
        if(user) {
            return user.role === "ADMIN";
        } else {
            return false;
        }
    }.property("currentUser"),

    loadPage: function(search, searchField, page, perPage) {
        var self = this;
        var elementClass = self.get('element');
        if(perPage == "all")
            var params =  {total: true};
        else
            var params = {pageSize: perPage, page: (page - 1), total: true};
        if (searchField != null) {
            params[searchField] = search;
        }
        this.set('params', params);
        this.adapter.find(elementClass, null, null, params).then(function(data){
            self.set('model',data);
            return data;
        });
    },

    refresh: function(){
        //first get last saved parameter or use default parameters
        if(!this.get('params')){
            var params = {pageSize: 2, page: 1, total: true};
        }else{
            var params = this.get('params');
        }
        var elementClass = this.get('element');
        var self = this;
        //call to rest
        this.adapter.find(elementClass, null, null, params).then(function(data){
            self.set('model',data);
            return data;
        });
    },

    //Actions
    actions: {
        delete: function (id) {
            var elementClass = this.get('element');
            this.adapter.remove(elementClass, id);
            this.refresh();
        },

        getPage: function (search, searchField, page, perPage){
            this.loadPage(search, searchField, page,perPage);
        }
    }
});