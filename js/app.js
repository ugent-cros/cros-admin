window.App = Ember.Application.create();

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
        application.register("my:adapter", application.CustomAdapter);
    }
});

App.initializer({
    name: "authmanager",

    initialize: function (container, application) {
        application.register("my:authmanager", window.AuthManager); // TODO: singleton
    }
});

App.initializer({
    name: "socketmanager",

    initialize: function (container, application) {
        application.register("my:socketmanager", window.SocketManager);
    }
});

EmberENV = {
    FEATURES: {
        'ember-htmlbars': true
    }
};

$(document).ajaxError(function(event, jqxhr, settings, thrownError) {
    if (thrownError.code == thrownError.NETWORK_ERR) {
        var url = window.location.href;
        window.location.href = url.substr(0,url.lastIndexOf("#")+1) + "/unavailable";
    }
    throw thrownError;
});

$(function() {
    $('[data-toggle="popover"]').popover();
});
