define([], function() {
    'use strict';


    var jacks = new Array();


    var addJack = function(name, jack) {
        jacks[name] = jack;
    };

    var getJack = function(name) {
        return jacks[name];
    };

    var removeJack = function(name) {
        jacks[name] = null;
    }

    return {
        add: addJack,
        get: getJack,
        remove: removeJack
    };

});