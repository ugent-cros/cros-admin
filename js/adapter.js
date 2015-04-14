App.CustomAdapter = DS.RESTAdapter.extend({
    linkLibrary : {},

    host : "http://localhost:9000",
    namespace : "",
	linksKey : "links",
	delimiter : "-",
    
    headers: function() {
        return {
            "X-AUTH-TOKEN" : this.authManager.token()
        };
    }.property().volatile(),

	insertLinks : function(linksObj, root) {
		var self = this;
		$.each(linksObj, function(k, v) {
			if(k === "self") {
				self.linkLibrary[root] = v
			} else {
                if (root !== "") {
                    self.linkLibrary[root + self.delimiter + k] = v;
                } else {
                    self.linkLibrary[k] = v;
                }
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
	
	progressTracker: function()
	{
		var xhr = new window.XMLHttpRequest();
	
		//Upload progress
		xhr.upload.addEventListener("progress", function(evt){
			if (evt.lengthComputable) {  
				NProgress.inc();
			}
		}, false); 
		
		//Download progress
		xhr.addEventListener("progress", function(evt){
			if (evt.lengthComputable) {  
				NProgress.inc();
			}
		}, false); 
		
		return xhr;
	},
	
	brol : function(urlObj, store) {
		var self = this;
		return self.ajax(urlObj.url, 'GET').then(function(data) {
			self.processLinks(data[store], urlObj.key);
		});
	},
	
	resolveLink : function(store, id, action) {
		var key = store;
		var self = this;
			
		if (id)
			key += self.delimiter + id;
		if (action)
			key += self.delimiter + action;

		var tempKey = key;
		var callsRemaining = true;
		var i = 0;
		var calls = [];
		while (!self.linkLibrary[tempKey]) {
			i = tempKey.lastIndexOf(self.delimiter);
			var temp;
			if (i == -1) {
				calls.push("home");
				callsRemaining = false;
				break;
			} else {
				temp = tempKey.substring(0,i);
				calls.push(temp);
			}
			tempKey = temp;
		}


		if(calls.length == 0) {
			return $.Deferred(function(defer) { defer.resolveWith(this,[{ "url" : self.linkLibrary[key], "key" : key }]); }).promise();
		} else {
			var currentPromise = $.Deferred(function(defer) { defer.resolveWith(this,[]); });
			for (var i = 0; i < calls.length; ++i) {
				currentPromise = currentPromise.pipe(function() { return self.brol({ "url" : self.linkLibrary[calls[i]], "key" : calls[i] }, store); });
			}
			return currentPromise.then(function() {
				return { "url" : self.linkLibrary[key], "key" : key};
			});
		}
	},
	
	ajax : function(url, method, options) {
		hash = options || {};
		hash.url = url;
		hash.method = method;
		hash.dataType = 'json';
		hash.context = this;
		
		if (hash.data && method !== 'GET') {
			hash.contentType = 'application/json; charset=utf-8';
			hash.data = JSON.stringify(hash.data);
		}
		
		var headers = this.get('headers');
		if (headers !== undefined) {
			hash.headers = headers;
		}
		
		return $.ajax(hash);
	},
	
    find : function(store, id, action, params) {
        var self = this;
		if (store === "home") {
            this.ajax(this.host, 'GET', {async : false, xhr : self.progressTracker }).then(function(data) {
                self.linkLibrary = data[store];
            });
        } else {
			var urlPromise = this.resolveLink(store,id,action);
			var urlObj;
            return urlPromise.then(function(obj) {
				urlObj = obj;
				if (params) {
					urlObj.url += "?" + $.param(params);
				}
				return self.ajax(urlObj.url, 'GET');
			}).then(function(data) {
				self.processLinks(data[store], urlObj.key);
				return data[store];
			});
        }        
    },
    
    post : function(store, postData) {
		var self = this;
		return this.ajax(this.linkLibrary[store], 'POST', {data: postData, xhr : self.progressTracker}).then(function(data) {
            self.processLinks(data, "");
			return data;
		});
	},
    
	edit : function(store, id, editData) {
		var self = this;
		var url = this.linkLibrary[store + self.delimiter + id];
		return this.ajax(url, 'PUT', {data: editData, xhr : self.progressTracker}).then(function(data) {
			return data;
		});
	},
	
	remove : function(store, id) {
		var self = this;
		var url = this.linkLibrary[store + self.delimiter + id];
		return this.ajax(url, 'DELETE', { xhr : self.progressTracker}).then(function(data) {
			return data;
		});
	}
	
});