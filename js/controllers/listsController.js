/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new list controller
 * @class ListSuperController
 * @constructor
 * @extends Controller
 */
App.ListSuperController = Ember.Controller.extend({

    /**
     * Default value for number of elements in a table
     *
     * @property {number} DEFAULT
     */
    DEFAULT: 10, //do not change

    /**
     * Last used parameters for a call to the REST api
     *
     * @property params
     */
    params: null,

    /**
     * Logged in user
     *
     * @property {object} currentUser
     */
    currentUser: function(){
        return this.authManager.get("user");
    }.property("authManager.user"),

    /**
     * This function determines if a user has write permissions
     *
     * @method userCanEdit
     * @return {Boolean} True if the user has write permissions
     */
    userCanEdit: function() {
        var user = this.get("currentUser");
        if(user) {
            return user.role === "ADMIN";
        } else {
            return false;
        }
    }.property("currentUser"),

    /**
     * Determine if a user has only read permissions
     *
     * @method userCantEdit
     * @return {Boolean} True if the user has only read permissions
     */
    userCantEdit: function() {
        return !this.get("userCanEdit");
    }.property("userCanEdit"),

    /**
     * This function executes a call to the REST api to get elements for a specific page in the table,
     * according to the search and ordering settings
     *
     * @method loadPage
     * @param {string} search - Searchquery
     * @param {string} searchField - The parameter where the user want to search on
     * @param {number} page - Number of the current page in the table (counting from 1)
     * @param {number} perPage - Total elements on a page in the table
     * @param {string} orderBy - Parameter where the user want to sort on
     * @param {string} order - "asc" or "desc"
     */
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

    /**
     * This function refreshes the current page, based on the last used parameters or default parameters
     *
     * @method refresh
     */
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
        /**
         * Delete an item
         *
         * @param {number} id - id of the item
         */
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

        /**
         * Get elements for a specific page in the table, according to the search and ordering settings
         *
         * @param {string} search - Searchquery
         * @param {string} searchField - The parameter where the user want to search on
         * @param {number} page - Number of the current page in the table (counting from 1)
         * @param {number} perPage - Total elements on a page in the table
         * @param {string} orderBy - Parameter where the user want to sort on
         * @param {string} order - "asc" or "desc"
         */
        getPage: function (search, searchField, page, perPage, orderBy, order){
            this.loadPage(search, searchField, page,perPage, orderBy, order);
        }
    }
});