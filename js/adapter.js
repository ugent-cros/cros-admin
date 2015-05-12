/**
 * @module cros-admin
 */

/**
 * This will create a new RestAdapter with support for HATEOAS.
 * @class CustomAdapter
 * @constructor
 * @extends DS.RESTAdapter
 */
App.CustomAdapter = DS.RESTAdapter.extend({
    /**
     * The root url to the used REST-API
     *
     * @public
     * @required
     * @property {string}  host
     */
    host : "http://localhost:9000",
    /**
     *  The namespace of the REST-API (relative to the host url)
     *
     * @public
     * @default ""
     * @property {string} namespace
     */
    namespace : "",
    /**
     * The key which will contain the HATEOAS links within json reponses
     *
     * @public
     * @default "links"
     * @property {string} linksKey
     */
	linksKey : "links",
    /**
     * The delimiter used to build the keys in the linkLibrary
     *
     * @public
     * @default "-"
     * @property {string} delimiter
     */
	delimiter : "-",
    /**
     * This object contains all links to REST calls. They are fetched from the REST responses and stored as a dictionary
     * that maps keys on urls.
     *
     * @private
     * @property linkLibrary
     * @type {object}
     */
    linkLibrary : {},

    /**
     * This method will perform the initialization of the adapter. It will insert one link in the {{#crossLink "CustomAdapter/linkLibrary:property"}}{{/crossLink}},
     * namely to the root (+namespace) of the REST-API.
     *
     * @public
     * @method init
     */
    init : function() {
        this._super();

        this.get("linkLibrary")["home"] = this.get("host") + this.get("namespace");
    },

    /**
     * This property contains all the headers that should be sent with every request.
     * This now only contains the correct authentication token for the REST-API.
     *
     * @private
     * @property headers {object}
     */
    headers: function() {
        return {
            "X-AUTH-TOKEN" : this.authManager.token()
        };
    }.property().volatile(),

    /**
     * This function will process a received links object and enter the links in the {{#crossLink "CustomAdapter/linkLibrary:property"}}{{/crossLink}}.
     * This is done by iterating over the links available and inserting them with the correct key (based on the provided root).
     *
     * @private
     * @method insertLinks
     * @param linksObj the object containing all the links
     * @param root the root key that should be used for these links.
     */
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

    /**
     * This function will search through the response json and search for objects with key {{#crossLink "CustomAdapter/linksKey:property"}}{{/crossLink}}.
     * For each object it finds, it will call {{#crossLink "CustomAdapter/insertLinks:method"}}{{/crossLink}} so that the contained links are added to the linkLibrary.
     *
     * In current version the home link is treated separately. Since the links in the root of this specific REST-API are not contained within a linkskey object,
     * they are just added to the linkLibrary directly.
     *
     * @private
     * @method processLinks
     * @param data The response json
     * @param root The root key of the links that should be added.
     */
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
				self.insertLinks(v, root);
			} else if(k === "resource") { // lists of items are contained within a "resource" tag
				$.each(v, function(i, obj) {
					self.processLinks(obj, root + self.delimiter + obj.id);
				});
			}
		});
	},

    /**
     * Progress of an ajax call can be tracked with nProgress library.
     * Starting this tracking can be done with this function.
     *
     * @private
     * @method progressTracker
     * @returns {XMLHttpRequest}
     */
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

    /**
     * When any request made by the adapter fails, this function is called. It will do necessary checks of the errorstatus and
     * the error response. If necessary, the adapter will call the logout functionality of the authManager.
     *
     * @private
     * @method onfailure
     * @param data the response from the ajax call
     * @returns {object} the response from the ajax call (for further chaining)
     */
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

    /**
     * This method will fetch any missing links in the linklibrary. It will call ajax and use {{#crossLink "CustomAdapter/processLinks:method"}}{{/crossLink}}
     * to update the linksLibrary.
     *
     * @private
     * @method recursiveFetch
     * @param urlObj the url to be fetched
     * @param store the root key to use when inserting the links.
     * @returns {Promise} Any code executed after this promise will have the necessary links in the linkLibrary
     */
	recursiveFetch : function(urlObj, store) {
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
                currentPromise = currentPromise.then(function() { return self.recursiveFetch({ "url" : self.linkLibrary[calls[i]], "key" : calls[i] }, store); });
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