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
	
	progressTracker: function(XMLHttpRequest)
	{
		NProgress.start();
	
		//Upload progress
		XMLHttpRequest.upload.addEventListener("progress", function(evt){
			if (evt.lengthComputable) {  
				NProgress.set(evt.loaded / (evt.total * 2));
			}
		}, false); 
		
		//Download progress
		XMLHttpRequest.addEventListener("progress", function(evt){
			if (evt.lengthComputable) {  
				NProgress.set(evt.loaded / (evt.total * 2) + 0.5);
			}
		}, false); 
	},
	
	stopProgress: function() {
		NProgress.done();
	},
	
    find : function(store, id, record) {
        var self = this;
		if (store === "home") {
            this.ajax(this.host, 'GET', {async : false, beforeSend : self.progressTracker, success: self.stopProgress }).then(function(data) {
                self.linkLibrary = data[store];
            });
        } else {
			var path = store
			if (id) {
				path += self.delimiter + id;
			}
			var url = this.host + this.linkLibrary[path];
            return this.ajax( url, 'GET', {beforeSend : self.progressTracker, success: self.stopProgress }).then(function(data) {
				self.processLinks(data[store], path);
                return data[store];
            });
        }        
    },
    
    post : function(store, postData) {
		return this.ajax(this.host + this.linkLibrary[store], 'POST', {data: postData, beforeSend : self.progressTracker, success: self.stopProgress});
	}
    
});