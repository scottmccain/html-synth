define([], function() {
    'use strict';

    var options = new Array();

    var set = function(name, val) {
        options[name] = val;
    };

    var get = function(name) {
        return options[name];
    };

    return {
        get: get,
        set: set
    };

});