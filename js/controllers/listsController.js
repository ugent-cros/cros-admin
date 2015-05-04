/**
 * Created by Eveline on 5/04/2015.
 */
App.ListSuperController = Ember.Controller.extend({

    DEFAULT: 10, //do not change
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

    userCantEdit: function() {
        return !this.get("userCanEdit");
    }.property("userCanEdit"),

    loadPage: function(search, searchField, page, perPage, orderBy, order) {
        var self = this;
        var elementClass = self.get('element');
        //parameters
        if(perPage == "all") {
            var params = {total: true};
        }else {
            var params = {pageSize: perPage, page: (page - 1), total: true};
        }
        if (searchField != null) {
            params[searchField] = search;
        }
        if(orderBy != null && order!=null){
            params['orderBy'] = orderBy;
            params['order'] = order;
        }else{
            params['orderBy'] = 'id';
            params['order'] = 'asc';
        }
        //save parameters
        this.set('params', params);
        //call to rest
        this.adapter.find(elementClass, null, null, {query:params}).then(function(data){
            self.set('model',data);
            return data;
        });
    },

    refresh: function(){
        var self = this;
        var elementClass = this.get('element');
        //first get last saved parameter or use default parameters
        if(!this.get('params')){
            var params = {pageSize: this.get('DEFAULT'), page: 1, total: true, orderBy: "id", order:"asc"};
        }else{
            var params = this.get('params');
        }
        //call to rest
        this.adapter.find(elementClass, null, null, {query:params}).then(function(data){
            self.set('model',data);
            return data;
        });
    },

    //Actions
    actions: {
        delete: function (id) {
            var elementClass = this.get('element');
            var result = this.adapter.remove(elementClass, id);
            //prevent list would be empty
            var data = this.get('model');
            var params = this.get('params');
            if(data && params){
                var elementsPerPage = Math.ceil(data.total/params['pageSize']);
                var elements = elementsPerPage * (params['page']); //number of elements before the current page
                var newTotal = data.total - 1;
                if(newTotal <= elements){
                    if(params['page'] > 0) {
                        params['page'] = params['page'] - 1;
                    }
                }
            }
            var self = this;
            result.then(
                function(){self.refresh(); NProgress.done(); },
                function(){self.refresh(); NProgress.done(); }//todo: if fail?
            );
        },

        getPage: function (search, searchField, page, perPage, orderBy, order){
            this.loadPage(search, searchField, page,perPage, orderBy, order);
        }
    }
});