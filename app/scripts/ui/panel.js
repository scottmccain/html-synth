define(['jack', 'knob', 'verticalswitch', 'slider', 'key', 'rectangle', 'horizontalswitch','imagestore'], function(jack, knob, verticalswitch, slider, key, rectangle, horizontalswitch, imagestore) {
    'use strict';

    var controls = new Array();
    var dragging = null;
    var canvas, app, ctx;
    var lastmousex, lastmousey;
    var hover = null;
    var panels = new Array();

    var gethover = function() {
        return hover;
    };

    var draw = function () {


        ctx.fillStyle = "#bebebe";
        ctx.fillRect(0, 0, 700, 700);

        ctx.drawImage(imagestore.get("panel"), 0, 0, 700, 700);

        // draw labels
        ctx.font = 'bold 10px Calibri';
        ctx.fillStyle = "#ffffff";

        var i;

        for (i in controls) {
            if (controls[i].ty >= 100)
                controls[i].Draw();
        }
        for (i in controls) {
            if (controls[i].ty < 100)
                controls[i].Draw();
        }

        // draw all the connecting cables
        for (i in controls) {
            if (controls[i].connect != null) {
                controls[i].DrawCable(controls[i], controls[i].connect.x + 8, controls[i].connect.y + 12, controls[i].col, 0);
            }
        }

        if (dragging != null && dragging.ty < 100) {

            var wd = hitTest(lastmousex, lastmousey);
            var f = 0;
            if (wd != null && wd.ty < 100) {
                if ((dragging.ty == 0 && wd.ty != 0) || (dragging.ty != 0 && wd.ty == 0))
                    f = 1;
                else
                    f = 2;
            }

            dragging.DrawCable(dragging, lastmousex, lastmousey, 0x303030, f);
        }
    };

    var drawDownArrow = function(x, y) {
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x, y + 5);
        ctx.lineTo(x + 5, y);
        ctx.fill();
    }

    var drawroundrect = function(x, y, width, height, radius, fill, stroke) {
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


    var addrectangle = function(name, x, y, w, h) {
        var r = new rectangle.Create(canvas, x, y, w, h);
        controls[name] = r;

        return r;
    };
    var addkey = function(name, x, y) {
        var k = new key.Create(canvas, x, y);
        controls[name] = k;

        return k;
    };

    var addslider = function (name, x, y, def) {
        var s = new slider.Create(app, canvas, x, y, def);
        controls[name] = s;

        return s;
    };

    var addjack = function (name, x, y, toy, color) {
        var j = new jack.Create(app, canvas, x, y, toy, color);
        controls[name] = j;

        return j;
    };

    var addknob = function (name, x, y, w, h, type, min, max) {

        var k = new knob.Create(app, canvas, x, y, w, h, type, min, max);
        controls[name] = k;

        return k;
    };

    var horzswitch = function(name, x, y, w, h, img, step, def) {
        var s = new horizontalswitch.Create(app, canvas, x, y, w, h, img, step, def);
        controls[name] = s;

        return s;
    };

    var addswitch = function(name, x, y, w, h, img, step, def) {
        var s = new verticalswitch.Create(app, canvas, x, y, w, h, img, step, def);
        controls[name] = s;

        return s;
    };

    var init = function(c, a) {
        canvas = c;
        app = a;
        ctx = canvas.getContext('2d');
    };

    var hitTest = function(x, y) {
        var wd, r;
        r = null;
        for (var i in controls) {
            var wd = controls[i];
            if (x >= wd.x && x < wd.x + wd.w && y >= wd.y && y < wd.y + wd.h) {
                if (wd.ty < 1000)
                    r = wd;
            }
        }
        return r;
    };

    var mouseDown = function (x, y) {

        lastmousex = x;
        lastmousey = y;

        dragging = hitTest(x, y);
        if (dragging != null) {
            dragging.MouseDown(x, y);
        }
    };

    var mouseUp = function(x, y) {
        lastmousex = x;
        lastmousey = y;

        var wd = hitTest(x, y);
        if (dragging != null) {
            if (wd != null) {
                if (wd.ty == 0 && (dragging.ty == 1 || dragging.ty == 2)) {
                    wd.Connect(dragging);
                }
                if ((wd.ty == 1 || wd.ty == 2) && dragging.ty == 0) {
                    dragging.Connect(wd);
                }
            }
            if (dragging.ty == 0) {
                if (wd == null || (wd.ty != 1 && wd.ty != 2))
                    dragging.Connect(null);
            }
            dragging.MouseUp(x, y);
        } else {
            hover = hitTest(x, y);
        }

        dragging = null;
        app.Draw();
    };

    var mouseMove = function (x, y) {
        lastmousex = x;
        lastmousey = y;

        if (dragging != null) {
            this.Draw();
            dragging.MouseMove(x, y);
        } else {
            hover = hitTest(x, y);
        }
    };

    var addPanel = function(name, p) {
        panels[name] = p;
    };
 
    var getPanel = function (name) {
        return panels[name];
    };

    var drawText = function (text, x, y, color) {
        var font = 'bold 10px Calibri';
        ctx.font = font;
        ctx.fillText(text, x, y);
    }

    var clear = function() {
        for (var i in controls) {
            var widget = controls[i];
            if (widget.ty == 0) {
                widget.Connect(null);
            }
            else if (widget.ty < 100) {
                widget.fanout = 0;
            }
            if (widget.ty >= 100 && widget.ty < 200)
                widget.Set(0);
        }

        // set default values
        controls["vco1.oct"].Set(0.5);
        controls["vco1.form"].Set(0.5);
        controls["vco1.co"].Set(0.5);
        controls["vco1.pi"].Set(0.5);
        controls["vco1.m1m"].Set(1);
        controls["vco2.oct"].Set(0.5);
        controls["vco2.form"].Set(0.5);
        controls["vco2.co"].Set(0.5);
        controls["vco2.pi"].Set(0.48);
        controls["vco2.m1m"].Set(1);
        controls["vcf1.i1m"].Set(0.7);
        controls["vcf1.i2m"].Set(0.7);
        controls["vcf1.f"].Set(1);
        controls["vcf1.r"].Set(0.5);
        controls["vcf1.m1m"].Set(1);
        controls["vcf2.i1m"].Set(0.7);
        controls["vcf2.f"].Set(0.8);
        controls["vcf2.r"].Set(0.5);
        controls["vcf2.m1m"].Set(1);
        controls["vca1.i1m"].Set(0.7);
        controls["vca1.m1m"].Set(1);
        controls["vca2.i1m"].Set(0.7);
        controls["vca2.m1m"].Set(1);
        controls["env1.s"].Set(1);
        controls["env2.s"].Set(1);
        controls["lfo1.f"].Set(0.5);
        controls["lfo1.form"].Set(0.5);
        controls["lfo2.f"].Set(0.5);
        controls["lfo2.form"].Set(0.5);
        controls["mix.i1m"].Set(0.5);
        controls["mix.i2m"].Set(0.5);
    };

    return {
        Init: init,
        Draw: draw,
        AddHorizontalSwitch : horzswitch,
        AddJack: addjack,
        AddKnob: addknob,
        AddSwitch: addswitch,
        AddSlider: addslider,
        AddKey: addkey,
        AddRectangle : addrectangle,
        Controls: controls,
        MouseDown: mouseDown,
        MouseUp: mouseUp,
        MouseMove: mouseMove,
        Hover: gethover,
        AddSubPanel: addPanel,
        GetSubPanel: getPanel,
        RoundRectangle: drawroundrect,
        DrawText: drawText,
        DownArrow: drawDownArrow,
        Clear : clear
    };
});