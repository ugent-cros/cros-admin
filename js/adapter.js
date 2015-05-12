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

    /**
     * This function will return the correct url based on key parameters. This function has two part:
     *      1) Using the input parameters, the correct key is assembled. This is done by concatenating
     *         the the input parameters, separated with the specified {{#crossLink "CustomAdapter/delimiter:property}}{{/crossLink}}.
     *      2) Once the key has been constructed, the function will check whether or not this key is available in the linkLibrary. If not
     *         it will recursively remove one part of the key (based on de delimiter) and check whether this key is available. It continues untill
     *         a link is found or until no key is left (if this is the case, the home link will be fetched).
     *         This implies that every url (linked to key 'k') should reply with links to all possible keys 'k' + delimiter + 't' (where 't' are all possible key parts after 'k').
     *
     * @private
     * @method resolveLinkInner
     * @param store the type of entity that is request
     * @param id the id of the entity requested
     * @param action the action that is called on this entity. This action can be a string or an array. If it is an array, all elements will be concatenated (seperated by the delimiter).
     * @returns {object} an object containing the url and the key.
     */
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

    /**
     * This function has the same functionality as {{#crossLink "CustomAdapter/resolveLinkInner:method"}}{{/crossLink}}. However, this method will chain
     * this call to any ongoing requests. This is necessary, if any of the previous requests is retrieving a link used in this function.
     *
     * @public
     * @method resolveLink
     * @param store the type of entity that is request
     * @param id the id of the entity requested
     * @param action the action that is called on this entity. This action can be a string or an array. If it is an array, all elements will be concatenated (seperated by the delimiter).
     * @returns {object|Promise} a promise which will resolve in an object containing the requested url and the key used.
     */
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

    /**
     * This function will execute the actual ajax call. It uses the functionality of jquery. For more explanation please checkout their documentation pages.
     * This function will set all properties in the ajax call. Extra properties can be given via the options paramter.
     *
     * @private
     * @method ajax
     * @param url The request url
     * @param method The HTTP method
     * @param options Extra options that should be set in the ajax call.
     * @returns {object|Promise} The response data from the REST-call.
     */
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

    /**
     * The current promise being handled. If null, no request is busy.
     *
     * @private
     * @property currentRequest {Promise}
     */
    currentRequest: null,

    /**
     * This function will resolve any request to the backend REST-api.
     * It will first resolve the link based on the input parameters (using {{#crossLink "CustomAdapter/resolveLink:method"}}{{/crossLink}}).
     * Using the correct link it will do a jquery ajax call (using {{#crossLink "CustomAdapter/ajax:method"}}{{/crossLink}}).
     * Finally any links contained in the response data will be processed (using {{#crossLink "CustomAdapter/processLinks:method"}}{{/crossLink}}).
     * This function assumes all REST-calls return an object with root element "store". This root element will be removed from the returned value.
     * Also if the result contains multiple elements, this should be contained within an array with key "resource".
     *
     * Note: This request will be chained to any previous ongoing requests. Also, this request will be set as the new {{#crossLink "CustomAdapter/currentRequest:property"}}{{/crossLink}}.
     *
     * @public
     * @method find
     * @param store the type of the entity requested
     * @param id the id of the entity requested
     * @param action the actions called on this entity. This can be either a string or an array of strings. In case of an array, the elements are concatenated separated with the delimiter.
     * @param params Any extra ajax parameters can be set in this object. Also, if this object contains a query object, this will be used as query paramters after the url.
     * @returns {object|Promise} The response data from the REST-call
     */
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

    /**
     * This function will execute any post requests to the REST-API.
     *
     * @public
     * @method post
     * @param store The type of entity that will be posted
     * @param postData The data that will be posted.
     * @returns {object|Promise} the REST-call result in json.
     */
    post : function(store, postData) {
		var self = this;
        var url = this.linkLibrary[store];
		return this.ajax(url, 'POST', {data: postData, xhr : self.progressTracker}).then(function(data) {
            self.processLinks(data, "");
			return data;
		}, self.onfailure);
	},

    /**
     * This function will execute a PUT request to the REST-API.
     *
     * @public
     * @method edit
     * @param store The type of entity that will be updated
     * @param id the id of the entity that will be updated
     * @param editData the data containing the updated entity
     * @returns {object|Promise} the data returned from the REST-call.
     */
	edit : function(store, id, editData) {
		var self = this;
		var url = this.linkLibrary[store + self.delimiter + id];
		return this.ajax(url, 'PUT', {data: editData, xhr : self.progressTracker}).then(function(data) {
			return data;
		}, self.onfailure);
	},

    /**
     * The function will execute a DELETE request to the REST-API.
     *
     * @public
     * @method remove
     * @param store The type of entity that will be removed
     * @param id the id of the entity that will be removed
     * @returns {object|Promise} the data returned from the REST-call.
     */
	remove : function(store, id) {
		var self = this;
		var url = this.linkLibrary[store + self.delimiter + id];
		return this.ajax(url, 'DELETE', { xhr : self.progressTracker}).then(function(data) {
			return data;
		}, self.onfailure);
	}
	
});