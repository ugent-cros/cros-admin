App.CustomAdapter = DS.RESTAdapter.extend({
    linkLibrary : {},

    host : "http://localhost:9000",
	linksKey : "links",
	delimiter : "-",
    
    token : function() {
        if (App.Auth == null) {
            var token = $.cookie('authToken');

            if (token == null){
                return { authToken:"" };
            } else {
                App.Auth = Ember.Object.create({
                    authToken : token,
                });
            }
        }

        return App.Auth;
    },
    
    headers: function() {
        return {
            "X-AUTH-TOKEN" : this.token().authToken
        };
    }.property().volatile(),

	insertLinks : function(linksObj, root) {
		var self = this;
		$.each(linksObj, function(k, v) {
			if(k === "self") {
				self.linkLibrary[root] = v
			} else {
				self.linkLibrary[root + self.delimiter + k] = v;
			}
		});
	},
	
	processLinks : function(data, root) {
		var lk = this.linksKey;
		var self = this;
		$.each(data, function(k, v) {
			if (lk === k) {
				self.insertLinks(data[k], root);
			} else if(k === "resource") {
				$.each(data[k], function(i, obj) {
					self.processLinks(obj, root + self.delimiter + obj.id);
				});
			}
		});
	},
	
    find : function(store, id, record) {
        var self = this;
		if (store === "home") {
            this.ajax(this.host, 'GET', {async : false}).then(function(data) {
                self.linkLibrary = data[store];
            });
        } else {
			var path = store
			if (id) {
				path += self.delimiter + id;
			}
            return this.ajax( this.host + this.linkLibrary[path], 'GET').then(function(data) {
				self.processLinks(data[store], path);
                return data[store];
            });
        }        
    },
    
    post : function(store, postData) {
		return this.ajax(this.host + this.linkLibrary[store], 'POST', {data: postData});
	}
    
});