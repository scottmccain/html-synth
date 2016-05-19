define(['imagestore'], function(imagestore) {
    'use strict';

    var ctx;

    verticalswitch.prototype = new ControlBase();
    verticalswitch.prototype.constructor = verticalswitch;

    function verticalswitch(app, canvas, x, y, w, h, img, step, def) {

        if (typeof (ctx) === "undefined") {
            ctx = (canvas != null) && (canvas.getContext) ? canvas.getContext("2d") : false;
        }

        this.bindings = new Array();

        this.ty = 102;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.step = step;
        this.val = def;


        this.Draw = function () {
            var image = imagestore.get(img);

            if (image == undefined)
                return;

            var n = Math.floor(this.val * this.step);

            if (this.val == 1)
                --n;

            ctx.drawImage(image, 0, n * this.h, this.w, this.h, this.x, this.y, this.w, this.h);
        }

        this.Set = function (v) {
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
            this.Set(Math.floor((1 - (mousey - this.y) / this.h) * this.step) / (this.step - 1));
            app.Draw();
        }
        this.MouseUp = function (mousex, mousey) {
        }
    }

    return {
        Create: verticalswitch
    };

});