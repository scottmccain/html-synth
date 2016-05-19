define([], function() {
    'use strict';

    function rectangle(canvas, x, y, w, h) {

        var ctx = (canvas != null) && (canvas.getContext) ? canvas.getContext("2d") : false;

        this.Draw = function() {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(x, y, w, h);
        };

        this.MouseDown = function(mouseX, mouseY) {
        };

        this.MouseMove = function(mouseX, mouseY) {
        };

        this.MouseUp = function(mouseX, mouseY) {
        };

    }

    return {
        Create: rectangle
};

});