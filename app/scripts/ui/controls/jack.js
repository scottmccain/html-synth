define([], function () {
    'use strict';

    // some globals (statics)
    var cablecolors = [0xcc0000, 0x00cccc, 0xcc4400,
                    0x0088cc, 0xcc8800, 0x0044cc,
                    0x555500, 0x0000cc, 0x885500,
                    0x4400cc, 0x44cc00, 0x880055,
                    0x005500, 0x550055, 0x00cc44,
                    0xcc0088, 0x005588, 0xcc0044];

    var jinum = 0, jonum = 0, colnum = 0, ctx;

    function jack(app, canvas, x, y, ty, col) {

        ctx = (canvas != null) && (canvas.getContext) ? canvas.getContext("2d") : false;

        this.init = function () {
            this.ty = ty;
            this.x = x;
            this.y = y;
            this.w = 16;
            this.h = 16;
            this.connect = null;
            this.fanout = 0;

            if (ty == 0)
                this.pnum = jinum++;
            else
                this.pnum = jonum++;

            this.col = cablecolors[colnum];


            if (typeof (col) !== "undefined" && col != null && col) {
                this.col = col;
            }

            if (ty == 0) {
                if (++colnum >= 18) {
                    colnum = 0;
                }
            }

            if (ty != 0) {
                // if we are an output buffer, create an output
                try {
                    // TODO: figure out proper size based on audiolib
                    this.buf = new Float32Array(128);
                } catch (e) {
                    this.buf = new Array(128);
                }

                for (var i = 0; i < 128; ++i)
                    this.buf[i] = 0;
            }
        };

        this.Draw = function () {



            //ctx.strokeStyle = "#3e3e3e";
            //ctx.fillStyle = "#6e6e6e";
            //ctx.beginPath();
            //ctx.arc(this.x + 8, this.y + 12, 7, 0, 2 * Math.PI);
            //ctx.stroke();
            //ctx.fill();

            //ctx.strokeStyle = "#000";
            //ctx.fillStyle = "#1e1e1e";
            //ctx.beginPath();
            //ctx.arc(this.x + 8, this.y + 12, 3, 0, 2 * Math.PI);
            //ctx.stroke();
            //ctx.fill();

            //ctx.beginPath();
            //ctx.arc(this.x + 8, this.y + 12, 7, 0, 2 * Math.PI);
            //ctx.stroke();

            //ctx.strokeStyle = "#f3f3f3";
            //ctx.beginPath();
            //ctx.arc(this.x + 8, this.y + 12, 8, 0, 2 * Math.PI);
            //ctx.stroke();

            if (this.connect != null) {
                //this.DrawCable(this, this.connect.x + 8, this.connect.y + 12, this.col, 0);
            }
        }

        this.FillBuf = function(v) {
            var out = this.buf;
            for (var i = 0; i < 128; ++i)
                out[i] = v;
        }

        this.Connect = function(jck) {
            var jIn = this;
            var jOut = jck;
            if (this.ty != 0) {
                jIn = jck;
                jOut = this;
            }
            if (jIn.connect != null) {
                if (jIn.connect.fanout > 0)
                    --(jIn.connect.fanout);
            }
            jIn.connect = jOut;
            if (jOut != null)
                ++jOut.fanout;
        }

        this.DrawCable = function (j, cabx, caby, cabcol, f) {

            var mx = (j.x + 8 + cabx) / 2;
            var my = Math.max(j.y + 12, caby) + 40;
            ctx.beginPath();
            ctx.moveTo(j.x + 8, j.y + 12);
            ctx.bezierCurveTo(mx, my, mx, my, cabx, caby);

            var r = (cabcol >> 16) & 0xff;
            var g = (cabcol >> 8) & 0xff;
            var b = cabcol & 0xff;
            for (var i = 4; i; --i) {
                var style = "#" + ("000000" + ((r << 16) + (g << 8) + b).toString(16)).slice(-6);
                ctx.strokeStyle = style;
                if (r < 200)
                    r += Math.floor((200 - r) / 4);
                if (g < 200)
                    g += Math.floor((200 - g) / 4);
                if (b < 200)
                    b += Math.floor((200 - b) / 4);
                ctx.lineWidth = i;
                ctx.lineCap = "round";
                ctx.stroke();
            }
            switch (f) {
                case 1:
                    ctx.save();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#3eff3e";
                ctx.beginPath();
                ctx.arc(cabx, caby, 12, 0, Math.PI * 2, true);
                ctx.stroke();
                    ctx.restore();
                break;
                case 2:
                    ctx.save();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#ff3e3e";
                ctx.beginPath();
                ctx.moveTo(cabx - 12, caby - 12);
                ctx.lineTo(cabx + 12, caby + 12);
                ctx.moveTo(cabx + 12, caby - 12);
                ctx.lineTo(cabx - 12, caby + 12);
                ctx.stroke();
                    ctx.restore();
                break;
            }
        }
        this.MouseDown = function(mousex, mousey) {
        }
        this.MouseMove = function (mousex, mousey) {
        }
        this.MouseUp = function (mousex, mousey) {
        }

        this.init();
    }

    return {
        Create: jack
    }
});