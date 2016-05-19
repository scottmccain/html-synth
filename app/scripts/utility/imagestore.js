define([], function() {
    'use strict';

    var images = new Array();

    var store = function (name, img) {

        images[name] = img;
    };

    var get = function(name) {
        return images[name];
    };

    return {
        store: store,
        get : get
    };
});