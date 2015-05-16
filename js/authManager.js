/**
 * Created by matthias on 30/03/2015.
 */

/**
 * @module cros-admin
 */

/**
 * This class will manage the authentication with the REST-API. This consists of keeping track of the authentication token,
 * the cookie with the authentication token, the current user,...
 *
 * @class AuthManager
 * @constructor
 * @namespace window
 * @extends Ember.Object
 */
window.AuthManager = Ember.Object.extend({

    /**
     * Is the name of the cookie in which the current authentication token will be stored.
     *
     * @private
     * @property cookieName {String}
     */
    cookieName : "authToken",
    /**
     * After login, the user will be redirected to this route.
     *
     * @private
     * @property redirectRoute {String}
     */
    redirectRoute : "dashboard", // TODO: change to previous route
    /**
     * The token which is used to authenticate all calls to the REST-API.
     *
     * @private
     * @property authToken {String}
     */
    authToken : null,
    /**
     * Contains the current logged in user.
     *
     * @private
     * @property _private_user {Object}
     */
    _private_user : null,
    /**
     * Contains the current logged in user.
     * If no user information is available, this will be fetched by from the REST-API.
     * If you observe this property, it will automatically update when the user information is available.
     *
     * @public
     * @property user {Object}
     */
    user : function() {
        if (!this.get("_private_user"))
            this.fetchUserInfo();
        return this.get("_private_user");
    }.property("_private_user"),

    /**
     * Whether or not a user is logged in.
     *
     * @public
     * @property isLoggedIn {boolean}
     */
    isLoggedIn : function() {
        return this.token() != null;
    }.property("authToken"),

    /**
     * Removes any data from this class. Will also clear the linkLibrary from the adapter
     *
     * @public
     * @method logout
     */
    logout: function(){
        this.adapter.clearLinks();
        this.set("_private_user", undefined);
        $.removeCookie(this.get("cookieName"));
        this.set("authToken", null);
    },

    /**
     * Will process the login. It will store the correct authentication token  and fetch the user info.
     *
     * @public
     * @method login
     * @param email the email address of the user
     * @param password the password of the user
     * @returns {Promise} When this promise resolves, the user info will be available and the authentication token will be stored.
     */
    login : function(email, password) {
        var result = this.adapter.post("login", { "emailAddress" : email, "password" : password });
        var temp = this.get("cookieName");
        var self = this;
        return result.then(function(data) {
            $.cookie(temp, data.authToken);
            self.set("authToken", data.authToken);
            self.fetchUserInfo();
        });
    },

    /**
     * Get the user information from the REST-API.
     *
     * @private
     * @method fetchUserInfo
     * @returns {Promise} When this promise resolves, the user information will be fetched.
     */
    fetchUserInfo : function() {
        var self = this;
        return this.adapter.find("user", null, "me").then(function(data) {
            self.set("_private_user", data);
        });
    },

    /**
     * This will return the authentication token.
     * If it is not available in memory it will be fetched from the cookie.
     *
     * @public
     * @method
     * @returns {String} Authentication token
     */
    token : function() {
        if (this.get("authToken") === null) {
            var token = $.cookie(this.cookieName);

            if (token == null){
                return null;
            } else {
                this.set("authToken", token);
            }
        }

        return this.get("authToken");
    }

});