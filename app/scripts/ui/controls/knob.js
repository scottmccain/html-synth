define(['imagestore'], function(imagestore) {
    'use strict';

    var ctx;

    knob.prototype = new ControlBase();
    knob.prototype.constructor = knob;

    function knob(app, canvas, x, y, w, h, imgname, step, def, bindingobject, bindingkey) {

        if (typeof (ctx) === "undefined") {
            ctx = (canvas != null) && (canvas.getContext) ? canvas.getContext("2d") : false;
        }

        // control properties
        this.ty = 100;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.step = step;

        var x0 = 0;
        var y0 = 0;
        var v0 = 0;

        this.val = def;

        this.Draw = function () {
            var image = imagestore.get(imgname);

            if (image === undefined)
                return;

            var n = Math.floor(this.val * this.step);
            if (this.val == 1)
                --n;

            ctx.drawImage(image, 0, n * h, w, h, x, y, w, h);
        };

        this.Set = function (v) {

            if (v < 0)
                v = 0;
            if (v > 1)
                v = 1;
            if (step > 1)
                v = Math.floor(v * (this.step - 1)) / (this.step - 1);
            this.val = v;
        };

        this.MouseDown = function(mousex, mousey) {
            x0 = mousex;
            y0 = mousey;
            v0 = this.val;
        };

        this.MouseMove = function(mousex, mousey) {
            this.Set(v0 + (mousex - x0 - mousey + y0) * 0.01);
            this.Draw();
        };

        this.MouseUp = function(mousex, mousey) {
        };

    }


    return {
        Create: knob
    }
});