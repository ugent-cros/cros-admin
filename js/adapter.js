App.CustomAdapter = DS.RESTAdapter.extend({
    host : "http://localhost:9000",
    namespace : "",
	linksKey : "links",
	delimiter : "-",

    linkLibrary : {},

    init : function() {
        this._super();

        this.get("linkLibrary")["home"] = this.get("host") + this.get("namespace");
    },
    
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
        if (root === "home") {
            $.extend(this.linkLibrary, data);
            return;
        }

		var lk = this.linksKey;
		var self = this;
        if (!data)
            return;

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

    onfailure : function(data) {
        if (data.status === 401 && this.authManager.get("isLoggedIn")) {
            this.socketManager.disconnect();
            this.authManager.logout();
            var url = window.location.href;
            var index = url.lastIndexOf("#");
            if (index === -1)
                window.location.href = url + "#/login";
            else
                window.location.href = url.substr(0,url.lastIndexOf("#")+1) + "/login";
        }
        return data;
    },
	
	brol : function(urlObj, store) {
		var self = this;
		return self.ajax(urlObj.url, 'GET').then(function(data) {
			self.processLinks(data[store], urlObj.key);
		});
	},

    resolveLinkInner : function(store,id,action) {
        var key = store;
        var self = this;

        if (id)
            key += self.delimiter + id;
        if (action) {
            if (action instanceof Array)
                key += self.delimiter + action.join(self.delimiter);
            else
                key += self.delimiter + action;
        }

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
            var currentPromise = this.get("currentRequest") || $.Deferred(function(defer) { defer.resolveWith(this,[]); });
            for (var i = 0; i < calls.length; ++i) {
                currentPromise = currentPromise.then(function() { return self.brol({ "url" : self.linkLibrary[calls[i]], "key" : calls[i] }, store); });
            }
            return currentPromise.then(function() {
                return { "url" : self.linkLibrary[key], "key" : key };
            });
        }
    },
	
	resolveLink : function(store, id, action) {
        var self = this;
        if (this.get("currentRequest")) {
            return this.get("currentRequest").then(function() {
                return self.resolveLinkInner(store,id,action);
            });
        } else {
            return this.resolveLinkInner(store,id,action);
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

    currentRequest: null,

    find : function(store, id, action, params) {
        var self = this;
        var r = this.get("currentRequest");

        var urlPromise;
        if (r) {
            urlPromise = r.then(function () {
                self.set("currentRequest", null);
                return this.resolveLink(store, id, action);
            });
        } else
            urlPromise = this.resolveLink(store,id,action);

        var urlObj;
        r = urlPromise.then(function(obj) {
            urlObj = obj;
            if (params) {
                if (params.query)
                    urlObj.url += "?" + $.param(params.query);
            }
            return self.ajax(urlObj.url, 'GET', params);
        }).then(function(data) {
            self.processLinks(data[store], urlObj.key);
            return data[store];
        }, self.onfailure);

        self.set("currentRequest", r);
        return r;
    },
    
    post : function(store, postData) {
		var self = this;
        var url = this.linkLibrary[store];
		return this.ajax(url, 'POST', {data: postData, xhr : self.progressTracker}).then(function(data) {
            self.processLinks(data, "");
			return data;
		}, self.onfailure);
	},
    
	edit : function(store, id, editData) {
		var self = this;
		var url = this.linkLibrary[store + self.delimiter + id];
		return this.ajax(url, 'PUT', {data: editData, xhr : self.progressTracker}).then(function(data) {
			return data;
		}, self.onfailure);
	},
	
	remove : function(store, id) {
		var self = this;
		var url = this.linkLibrary[store + self.delimiter + id];
		return this.ajax(url, 'DELETE', { xhr : self.progressTracker}).then(function(data) {
			return data;
		}, self.onfailure);
	}
	
});