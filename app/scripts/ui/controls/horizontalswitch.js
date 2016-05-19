define(['imagestore'], function(imagestore) {
    'use strict';

    var ctx;

    horizontalswitch.prototype = new ControlBase();
    horizontalswitch.prototype.constructor = horizontalswitch;

    function horizontalswitch(app, canvas, x, y, w, h, img, step, def) {

        if (typeof (ctx) === "undefined") {
            ctx = (canvas != null) && (canvas.getContext) ? canvas.getContext("2d") : false;
        }

        this.bindings = new Array();

        this.ty = 102;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.val = def;
        this.step = step;


        this.Draw = function () {
            var image = imagestore.get(img);

            if (image == undefined)
                return;

            var n = Math.floor(this.val * this.step);

            if (this.val == 1)
                --n;

            ctx.drawImage(image, n * this.w, 0, this.w, this.h, this.x, this.y, this.w, this.h);
        }

        this.Set = function (v) {
            return;

            if (v < 0)
                v = 0;
            if (v > 1)
                v = 1;
            this.val = v;
        }

        this.MouseDown = function (mousex, mousey) {
            this.MouseMove(mousex, mousey);
        }
        this.MouseMove = function (mousex, mousey) {
            this.Set(Math.floor((1 - (mousex - this.x) / this.w) * this.step) / (this.step - 1));
            app.Draw();
        }
        this.MouseUp = function (mousex, mousey) {
        }
    }

    return {
        Create: horizontalswitch
    };

});