define(["imagestore"], function(imagestore) {
    'use strict';

    var ctx = null;

    key.prototype = new ControlBase();
    key.prototype.constructor = key;

    function key(canvas, x, y) {

        ctx = (canvas != null) && (canvas.getContext) ? canvas.getContext("2d") : false;

        this.ty = 900;
        this.x = x;
        this.y = y;
        this.w = 448;
        this.h = 64;

        this.gate = 0;
        this.cv = 0;

        this.retrig = 0;

        var lastn = -1;

        var table = [
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 12, -1, -1, -1,
            27, -1, 13, 15, -1, 18, 20, 22, -1, 25, -1, -1, -1, -1, -1, -1,
            -1, -1, 7, 4, 3, 16, -1, 6, 8, 24, 10, -1, 13, 11, 9, 26,
            28, 12, 17, 1, 19, 23, 5, 14, 2, 21, 0, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 15, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 12, -1, 14, -1,
        ];

        var press = new Array();

        this.Draw = function () {
            var panelimage = imagestore.get("panel");
            ctx.drawImage(panelimage, this.x, this.y, this.w, this.h, this.x, this.y, this.w, this.h);
        }

        this.KeyPosX = function(n) {
            return Math.floor(n / 12) * 112 + [0, 12, 16, 28, 32, 48, 60, 64, 76, 80, 92, 96][n % 12];
        }

        this.KeyPosY = function(n) {
            return [40, 0, 40, 0, 40, 40, 0, 40, 0, 40, 0, 40][n % 12];
        }

        this.DrawKey = function(n) {

            var nmax = 48;

            var panelimage = imagestore.get("panel");
            var keypressimage = imagestore.get("keypress");

            ctx.drawImage(panelimage, this.x, this.y, this.w, this.h, this.x, this.y, this.w, this.h);
            if (n >= 0 && n < nmax) {
                var y = this.KeyPosY(n);
                var w = (y != 0) ? 16 : 8;
                var h = (y != 0) ? 24 : 40;
                ctx.drawImage(keypressimage, this.KeyPosX(n), y, w, h, this.x + this.KeyPosX(n), this.y + y, w, h);
            }

            lastn = n;
        }
        this.MouseDown = function(x, y) {
            this.gate = 1;
            this.MouseMove(x, y);
        }
        this.MouseMove = function(x, y) {
            var n;
            x = (x - this.x);
            if (y >= this.y + 40) {
                x = Math.floor(x / 16);
                if (x < 0)
                    x = 0;
                if (x >= 28)
                    x = 27;
            } else {
                var xx = x + 5;
                if (xx % 16 < 10) {
                    var xxx = Math.floor(xx / 16) % 7;
                    if (xxx == 1 || xxx == 2 || xxx == 4 || xxx == 5 | xxx == 6) {
                        x = Math.floor(x / 16);
                        n = Math.floor(x / 7) * 12 + [0, 1, 3, 0, 6, 8, 10][xxx];
                        this.cv = n / 12 * 0.2;
                        this.DrawKey(n);
                        return;
                    }
                }
                x = Math.floor(x / 16);
                if (x < 0)
                    x = 0;
                if (x >= 28)
                    x = 27;
            }
            n = Math.floor(x / 7) * 12 + [0, 2, 4, 5, 7, 9, 11][x % 7];
            this.cv = n / 12 * 0.2;
            if (lastn >= 0 && n >= 0 && n != lastn)
                this.retrig = 1;
            this.DrawKey(n);
        }
        this.MouseUp = function(x, y) {
            this.gate = 0;
            this.DrawKey(-1);
        }
        this.AllOff = function() {
            press.length = 0;
            this.gate = 0;
            this.DrawKey(-1);
        }
        this.NoteOn = function(n, v) {
            for (var i = 0; i < press.length; ++i) {
                if (press[i] == n)
                    break;
            }
            if (i == press.length) {
                this.gate = 1;
                this.retrig = 1;
                n -= 36;
                this.cv = n / 60;
                this.DrawKey(n);
            }
        }
        this.NoteOff = function(n) {
            for (var i = 0; i < press.length; ++i) {
                if (press[i] == n) {
                    press.splice(i, 1);
                    break;
                }
            }
            if (press.length == 0) {
                this.gate = 0;
                this.DrawKey(-1);
            } else {
                n = press[0] - 36;
                this.cv = n / 60;
                this.DrawKey(n);
            }
        }
        this.KeyPress = function (c, f) {
            console.log(c);

            var n, i;
            if (f) {
                if (c >= 0x20 && c <= 0xbf) {

                    n = table[c - 0x20];

                    console.log("n: " + n);
                    if (n >= 0) {
                        for (i = 0; i < press.length; ++i) {
                            if (press[i] == c)
                                break;
                        }
                        if (i == press.length) {
                            press.unshift(c);
                            this.gate = 1;
                            this.retrig = 1;
                            this.cv = n / 60;
                            this.DrawKey(n);
                        }
                    }
                }
            } else {
                for (i = 0; i < press.length; ++i) {
                    if (press[i] == c) {
                        press.splice(i, 1);
                        break;
                    }
                }
                if (press.length == 0) {
                    this.gate = 0;
                    this.DrawKey(-1);
                } else {
                    n = table[press[0] - 0x20];
                    this.cv = n / 60;
                    this.DrawKey(n);
                }
            }
        }
    }

    return {
        Create: key
    };
});