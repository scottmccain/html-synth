define(['imagestore'], function(imagestore) {
    'use strict';

    var ctx = null;

    slider.prototype = new ControlBase();
    slider.prototype.constructor = slider;

    function slider(app, canvas, x, y, def) {

        ctx = (canvas != null) && (canvas.getContext) ? canvas.getContext("2d") : false;

        this.ty = 101;
        this.x = x;
        this.y = y;
        this.w = 16;
        this.h = 65;

        this.val = def;
        this.vala = (Math.pow(1000, this.val) - 1) * 0.0001;

        var v0 = 0;
        var y0 = 0;

        function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
            if (typeof stroke == "undefined") {
                stroke = true;
            }
            if (typeof radius === "undefined") {
                radius = 5;
            }
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            if (stroke) {
                ctx.stroke();
            }
            if (fill) {
                ctx.fill();
            }
        }

        function drawLine(ctx, fromx, fromy, tox, toy) {
            ctx.beginPath();
            ctx.moveTo(fromx, fromy);
            ctx.lineTo(tox, toy);
            ctx.closePath();
            ctx.stroke();
        }

        this.Draw = function () {


            //ctx.strokeStyle = "#fefefe";
            //ctx.lineWidth = 1;

            //var sep = 6, index = this.y + 10, height = this.h - 10;
            //var yy;
            //for (yy = 0; yy < 9; yy++) {
            //    var toy = yy * sep + index;
            //    drawLine(ctx, this.x, toy, this.x + 16, toy);
            //}

            //ctx.strokeStyle = "#000000";
            //ctx.fillStyle = "#000000";
            //roundRect(ctx, this.x + 6, this.y + 5, 4, this.h - 10, 2, true);

            ctx.drawImage(imagestore.get("slider"), this.x, this.y + 50 - this.val * 50);
        }

        this.Set = function (v) {

            if (v < 0)
                v = 0;
            if (v > 1)
                v = 1;
            this.val = v;
            this.vala = (Math.pow(100, this.val) - 1) * 0.04;

        }
        this.MouseDown = function (mousex, mousey) {
            y0 = mousey;
            v0 = this.val;
        }
        this.MouseMove = function(mousex, mousey) {
            this.Set(v0 + (y0 - mousey) * 0.01);
            app.Draw();
        }
        this.MouseUp = function (mousex, mousey) {
        }

    }

    return {
        Create: slider
    };
});
