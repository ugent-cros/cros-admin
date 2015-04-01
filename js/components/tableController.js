App.MyTableComponent = Ember.Component.extend({

    page: 1,
    perPage: 2, //todo debug =1

    begin: function(){
        return ((this.get('page') - 1) * this.get('perPage'))+1;
    }.property('page', 'perPage'),

    end: function(){
        var max = ((this.get('page') * this.get('perPage'))-1)+1;
        if(max > this.get('length')){
            return this.get('length');
        }
        return max;
    }.property('page', 'perPage'),

    //calculate totalpages
    totalPages: function() {
        return Math.ceil(this.get('length') / this.get('perPage'));
    }.property('length', 'perPage'),

    //get collection with page numbers
    pages: (function() {
        var collection = Ember.A();//list with numbers

        for(var i = 0; i < this.get('totalPages'); i++) {
            collection.pushObject(Ember.Object.create({
                number: i + 1
            }));
        }

        return collection;
    }).property('totalPages'),

    //are there pages?
    hasPages: (function() {
        return this.get('totalPages') > 1;
    }).property('totalPages'),

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

    actions: {
        selectPage: function (number) {
            var self = this;
            this.set('page', number);
            this.sendAction('action', this.get('page'), this.get('perPage'));
        }
    }
});

App.PageController = Ember.ObjectController.extend({
    currentPage: Ember.computed.alias('parentController.page'),

    active: (function() {
        return this.get('number') === this.get('currentPage');
    }).property('number', 'currentPage')
});