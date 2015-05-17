/**
 * @module cros-admin
 * @submodule components
 */

/**
 * This will create a new table controller
 * @class MyTableComponent
 * @namespace App
 * @constructor
 * @extends Component
 */
App.MyTableComponent = Ember.Component.extend({

    /*****************************Paging*****************************/
    /**
     * Default value for number of elements in a table
     *
     * @property DEFAULT
     * @static
     * @final
     */
    DEFAULT: 10, //do not change

    /**
     * Number of current page
     *
     * @property page
     */
    page: 1,

    /**
     * Number of elements per page
     *
     * @property perPage
     */
    perPage: 10,

    /**
     * List representing combobox
     *
     * @property nrOfElements
     */
    nrOfElements: [],

    /**
     * Initializing function:
     * - Send request to get elements
     * - Initializes combobox
     *
     * @method initialize
     */
    initialize: function(){
        var pageSize = this.get('DEFAULT');
        if(this.get('perPage')){
            pageSize = this.get('perPage');
        }
        this.sendAction('action', this.get('keyword'), this.get('searchField'), this.get('page'), pageSize);
        this.initSelect();
    }.on("init"),

    /**
     * Initialization of combobox
     *
     * @method initSelect
     */
    initSelect: function () {
        var list = [{label: "10", value: 10},
            {label: "20", value: 20},
            {label: "50", value: 50},
            {label: "all", value: "all"}];
        /*var all = {label: "all"};
        all['value'] = this.get('length');
        list.addObject(all);*/
        this.set('nrOfElements', list);
    },

    /**
     * Check if the table is empty
     *
     * @method isEmpty
     * @return {Boolean} True if the table is empty
     */
    isEmpty: function(){
        return this.get('length') == 0;
    }.property('length'),

    /**
     * Function to get the index of the first element of the page
     *
     * @method begin
     * @return {number} n - where the first element of the page is the nth element in de list
     */
    begin: function(){
        var perPage = 2;
        if(this.get('perPage')){
            perPage = this.get('perPage');
        }
        return ((this.get('page') - 1) * perPage)+1;
    }.property('page', 'perPage'),

    /**
     * Function to get the index of the last element of the page
     *
     * @method end
     * @return {number} n - where the last element of the page is the nth element in de list
     */
    end: function(){
        var perPage = 10;
        if(this.get('perPage')){
            perPage = this.get('perPage');
        }
        var max = ((this.get('page') * perPage)-1)+1;
        if(max > this.get('length')){
            return this.get('length');
        }
        return max;
    }.property('page', 'perPage'),

    /**
     * Calculate the total number of pages needed to show all elements
     *
     * @method totalPages
     */
    totalPages: function() {
        if (this.get('perPage')) {
            return Math.ceil(this.get('length') / this.get('perPage'));
        }
        else{
            return Math.ceil(this.get('length') / this.get('DEFAULT')); //default!
        }
    }.property('length', 'perPage'),

    /**
     * Get a list with all page numbers
     *
     * @method pages
     * @return collection with page numbers
     */
    pages: function() {
        var collection = Ember.A();//list with numbers

        for(var i = 0; i < this.get('totalPages'); i++) {
            collection.pushObject(Ember.Object.create({
                number: i + 1
            }));
        }

        return collection;
    }.property('totalPages'),

    /**
     * Check if paging is needed
     *
     * @method hasPages
     * @return {Boolean} True if there are more than 1 page
     */
    hasPages: (function() {
        if(this.get('perPage') == "all")
            return false;
        else
            return this.get('totalPages') > 1;
    }).observes('length').property('totalPages'),

    /**
     * Get previous page
     *
     * @method prevPage
     * @return {number} number of the previous page
     */
    prevPage: (function() {
        var page = this.get('page');
        var totalPages = this.get('totalPages');

        if(page > 1 && totalPages > 1) {
            return page - 1;
        } else {
            return null;
        }
    }).property('page', 'totalPages'),

    /**
     * Get next page
     *
     * @method nextPage
     * @return {number} number of the next page
     */
    nextPage: (function() {
        var page = this.get('page');
        var totalPages = this.get('totalPages');

        if(page < totalPages && totalPages > 1) {
            return page + 1;
        } else {
            return null;
        }
    }).property('page', 'totalPages'),

    /**
     * This function is called when the value of perPage is changed
     *
     * @method onPerPageChange
     */
    onPerPageChange:function(){
        //reset page to 1
        this.set('page', 1);
        var search = document.getElementById("searchbox").value;
        this.sendAction('action', search, this.get('searchField'), this.get('page'), this.get('perPage'));
    }.observes('perPage'),
    /*****************************Sorting*****************************/

    /**
     * Field where the list have to be sort on
     *
     * @property orderBy
     * @default "id"
     */
    orderBy: "id",

    /**
     * Order of sorting
     *
     * @property order
     * @default "asc"
     */
    order: "asc",

    /*****************************Searching*****************************/

    /**
     * Keyword for searching
     *
     * @property keyword
     */
    keyword: null,

    /**
     * Paramter to search on
     *
     * @property searchField
     */
    searchField: null,

    /*****************************Actions*****************************/
    actions: {
        /**
         * Get content for the page with given number
         *
         * @param {number} number - page number
         */
        selectPage: function (number) {
            var search = this.get('keyword');
            this.set('page', number);
            this.sendAction('action', search, this.get('searchField'), this.get('page'), this.get('perPage'), this.get('orderBy'), this.get('order'));
        },

        /**
         * Get content for the given searchquery
         *
         * @param {string} string - The keyword where the user want to search on
         */
        search: function(string){
            //reset page to 1
            this.set('page', 1);
            //send search
            this.sendAction('action', string, this.get('searchField'), this.get('page'), this.get('perPage'), this.get('orderBy'), this.get('order'));
        },

        /**
         * Get content after sorting order or column is changed
         *
         * @param {string} column
         */
        sort: function(column){
            var order = this.get('order');
            if(this.get('orderBy') == column){
                if(order && order == 'asc'){
                    order = 'desc';
                }else{
                    order = 'asc'
                }
            }else{
                order = 'asc'
            }
            //set new values
            this.set('orderBy', column);
            this.set('order', order);
            //send request
            this.sendAction('action', this.get('keyword'), this.get('searchField'), this.get('page'), this.get('perPage'), this.get('orderBy'), this.get('order'));
        }
    }
});

App.PageController = Ember.ObjectController.extend({
    /**
     * Number of the current page (counting from 1)
     *
     * @property currentPage
     */
    currentPage: Ember.computed.alias('parentController.page'),

    /**
     * Checks if the page is the currentPage
     *
     * @method active
     */
    active: (function() {
        return this.get('number') === this.get('currentPage');
    }).property('number', 'currentPage')
});

App.ColumnController = Ember.ObjectController.extend({

    /**
     * Field where the list have to be sort on
     *
     * @property orderBy
     */
    orderBy: Ember.computed.alias('parentController.orderBy'),

    /**
     * Order of sorting
     *
     * @property order
     */
    order: Ember.computed.alias('parentController.order'),

    /**
     * Set the according icon for the column
     *
     * @method getIconClass
     * @return {string} "fa-sort-desc" if the column is sorted in descending order, "fa-sort-asc" if the column is sorted in ascending order, "fa-sort" if the column is not sorted
     */
    getIconClass: (function(){
        console.log("changed");
        var icon = "fa "
        if(this.get('value') == this.get('orderBy')){
            if(this.get('order') == 'desc'){
                icon += "fa-sort-desc"
            }else{
                icon += "fa-sort-asc"
            }
        }else{
            icon += "fa-sort"
        }
        return icon
    }).property('value', 'orderBy', 'order')
});