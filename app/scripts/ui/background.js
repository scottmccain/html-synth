define([], function() {
    'use strict';

    function background(image, x, y, canvas) {

        var ctx = (canvas != null) && (canvas.getContext) ? canvas.getContext("2d") : false;

        this.Draw = function () {
            //ctx.drawImage(image, x, y);
        }
    }
    return {
        Factory : background
    }
});