App.MyTableComponent = Ember.Component.extend({

    page: 1,
    perPage: 2, //todo debug value
    nrOfElements: [],

    initialize: function(){
        console.log("init");
        var pageSize = 2;
        if(this.get('perPage')){
            pageSize = this.get('perPage');
        }
        this.sendAction('action', this.get('keyword'), this.get('searchField'), this.get('page'), pageSize);
        this.initSelect();
    }.on("init"),

    initSelect: function () {
        var list = [{label: "2", value: 2},
            {label: "10", value: 10},
            {label: "20", value: 20},
            {label: "50", value: 50}];
        var all = {label: "all"};
        all['value'] = this.get('length');
        list.addObject(all);
        this.set('nrOfElements', list);
    },

    onLengthChange:function(){
        console.log('length changed => select updated');
        this.initSelect();
    }.observes('length'),

    begin: function(){
        var perPage = 2;
        if(this.get('perPage')){
            perPage = this.get('perPage');
        }
        return ((this.get('page') - 1) * perPage)+1;
    }.property('page', 'perPage'),

    end: function(){
        var perPage = 2;
        if(this.get('perPage')){
            perPage = this.get('perPage');
        }
        var max = ((this.get('page') * perPage)-1)+1;
        if(max > this.get('length')){
            return this.get('length');
        }
        return max;
    }.property('page', 'perPage'),

    //calculate totalpages
    totalPages: function() {
        if (this.get('perPage')) {
            return Math.ceil(this.get('length') / this.get('perPage'));
        }
        else{
            return Math.ceil(this.get('length') / 2); //default!
        }
    }.property('length', 'perPage'),

    //get collection with page numbers
    pages: function() {
        var collection = Ember.A();//list with numbers

        for(var i = 0; i < this.get('totalPages'); i++) {
            collection.pushObject(Ember.Object.create({
                number: i + 1
            }));
        }

        return collection;
    }.property('totalPages'),

    //are there pages?
    hasPages: (function() {
        return this.get('totalPages') > 1;
    }).observes('length').property('totalPages'),

    //function to get the previous page
    prevPage: (function() {
        var page = this.get('page');
        var totalPages = this.get('totalPages');

        if(page > 1 && totalPages > 1) {
            return page - 1;
        } else {
            return null;
        }
    }).property('page', 'totalPages'),

    //function to get the next page
    nextPage: (function() {
        var page = this.get('page');
        var totalPages = this.get('totalPages');

        if(page < totalPages && totalPages > 1) {
            return page + 1;
        } else {
            return null;
        }
    }).property('page', 'totalPages'),

    paginatedContent: (function() {
        var start = (this.get('page') - 1) * this.get('perPage');
        var end = start + this.get('perPage');

        return this.get('arrangedContent').slice(start, end);
    }).property('page', 'totalPages', 'arrangedContent.[]'),

    onPerPageChange:function(){
        //reset page to 1
        this.set('page', 1);
        var search = document.getElementById("searchbox").value;
        if(this.get('perPage') == "all"){
            this.set('perPage', this.get('length'));
        }
        this.sendAction('action', search, this.get('searchField'), this.get('page'), this.get('perPage'));
    }.observes('perPage'),

    keyword: null,
    searchField: null,

    actions: {
        selectPage: function (number) {
            var self = this;
            var search = this.get('keyword');
            this.set('page', number);
            this.sendAction('action', search, this.get('searchField'), this.get('page'), this.get('perPage'));
        },

        search: function(string){
            //reset page to 1
            this.set('page', 1);
            //send search
            this.sendAction('action', string, this.get('searchField'), this.get('page'), this.get('perPage'));
        }
    }
});

App.PageController = Ember.ObjectController.extend({
    currentPage: Ember.computed.alias('parentController.page'),

    active: (function() {
        return this.get('number') === this.get('currentPage');
    }).property('number', 'currentPage')
});