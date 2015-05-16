window.App = Ember.Application.create();

/**
 * All initializer functions in this method are intended for dependency injection.
 * It allows us to inject a reference to the adapter, the authmanager and the socketmanager in each instance of a controller,router and component.
 */
App.initializer({
    name: "joinManagers",
    after:['adapter', 'authmanager', 'socketmanager'],

    initialize: function (container, application) {
        var adapter = container.lookup('my:adapter'),
            authManager = container.lookup('my:authmanager'),
            socketManager = container.lookup('my:socketmanager');

        authManager.adapter = adapter;
        authManager.socketManager = socketManager;
        adapter.authManager = authManager;
        adapter.socketManager = socketManager;
        socketManager.adapter = adapter;
        socketManager.authManager = authManager;

        application.inject("controller", "adapter", "my:adapter");
        application.inject("controller", "authManager", "my:authmanager");
        application.inject("controller", "socketManager", "my:socketmanager");
        application.inject("route", "adapter", "my:adapter");
        application.inject("route", "authManager", "my:authmanager");
        application.inject("route", "socketManager", "my:socketmanager");
        application.inject('component', 'adapter', 'my:adapter');
        application.inject('component', 'authManager', 'my:authmanager');
        application.inject('component', 'socketManager', 'my:socketmanager');
    }
});

App.initializer({
    name: "adapter",

    initialize: function (container, application) {
        application.register("my:adapter", application.CustomAdapter, { singleton: true });
    }
});

App.initializer({
    name: "authmanager",

    initialize: function (container, application) {
        application.register("my:authmanager", window.AuthManager, { singleton: true });
    }
});

App.initializer({
    name: "socketmanager",

    initialize: function (container, application) {
        application.register("my:socketmanager", window.SocketManager, { singleton: true });
    }
});

EmberENV = {
    FEATURES: {
        'ember-htmlbars': true
    }
};

/**
 * If any ajax request fails, this function will be called. It allows centralized error handling.
 * This is useful for checking whether the server can be reached.
 */
$(document).ajaxError(function(event, jqxhr, settings, thrownError) {
    if (jqxhr && jqxhr.status == 0) {
        var url = window.location.href;
        var index = url.lastIndexOf("#");
        if (index === -1)
            window.location.href = url + "#/unavailable";
        else
            window.location.href = url.substr(0,url.lastIndexOf("#")+1) + "/unavailable";
    }
    console.log(thrownError);
    throw thrownError;
});

$(function() {
    $('[data-toggle="popover"]').popover();
});
