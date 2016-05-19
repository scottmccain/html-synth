define(['options', 'panel'], function(options, panel) {
    'use strict';

    var model = function() {
        this.in1 = 0;
        this.in2 = 0;
        this.in3 = 0;
        this.volume = 0;
        this.mod1 = 0;
        this.mod2 = 0;
        this.mod3 = 0;
    };

    function vca(name, x, y) {


        var jckIn1 = panel.AddJack(name + ".i1", x + 8, y + 52, 0);
        var jckIn2 = panel.AddJack(name + ".i2", x + 28, y + 52, 0);
        var jckIn3 = panel.AddJack(name + ".i3", x + 48, y + 52, 0);
        var jckOut = panel.AddJack(name + ".o", x + 48, y + 224, 1);
        var jckMod1 = panel.AddJack(name + ".m1", x + 8, y + 348, 0);
        var jckMod2 = panel.AddJack(name + ".m2", x + 28, y + 348, 0);
        var jckMod3 = panel.AddJack(name + ".m3", x + 48, y + 348, 0);

        //this.in1 = 0.8;
        //this.in2 = 0;
        //this.in3 = 0;

        //this.volume = 0.5;

        //this.mod1 = 1;
        //this.mod2 = 0;
        //this.mod3 = 0;

        this.model = new model();

        panel
        .AddSlider(name + ".i1m", x + 8, y + 72, this.model.in1)
        .bind(this.model, "in1", "val", true);
        panel
        .AddSlider(name + ".i2m", x + 28, y + 72, this.model.in2)
        .bind(this.model, "in2", "val", true);

        panel
        .AddSlider(name + ".i3m", x + 48, y + 72, this.model.in3)
        .bind(this.model, "in3", "val", true);

        panel
        .AddKnob(name + ".vol", x + 12, y + 164, 32, 32, "knob", 50, this.model.volume)
        .bind(this.model, "volume", "val", true);

        panel
        .AddSlider(name + ".m1m", x + 8, y + 280, this.model.mod1)
        .bind(this.model, "mod1", "val", true);
        panel
        .AddSlider(name + ".m2m", x + 28, y + 280, this.model.mod2)
        .bind(this.model, "mod2", "val", true);

        panel
        .AddSlider(name + ".m3m", x + 48, y + 280, this.model.mod3)
        .bind(this.model, "mod3", "val", true);

        this.model.volume = 0;
        this.model.mod1 = .8;
        this.model.in1 = 1;

        // private vars
        var gain = 0;
        var enable = false;

        this.Process = function () {

            if (jckOut.fanout <= 0)
                return;

            var v;
            var g = this.model.volume;

            if (jckMod1.connect != null)
                g += jckMod1.connect.buf[0] * this.model.mod1;
            if (jckMod2.connect != null)
                g += jckMod2.connect.buf[0] * this.model.mod2;
            if (jckMod3.connect != null)
                g += jckMod3.connect.buf[0] * this.model.mod3;

            if (g < 0)
                g = 0;

            if (Math.abs(gain - g) < 1e-10)
                gain = g;

            var sli1 = this.model.in1;
            var sli2 = this.model.in2;
            var sli3 = this.model.in3;
            var enIn1 = (jckIn1.connect != null);
            var enIn2 = (jckIn2.connect != null);
            var enIn3 = (jckIn3.connect != null);
            if (enIn1 || enIn2 || enIn3) {
                enable = true;
                var out = jckOut.buf;
                for (var i = 0; i < 128; ++i) {
                    v = 1e-100;
                    if (enIn1)
                        v += jckIn1.connect.buf[i] * sli1;
                    if (enIn2)
                        v += jckIn2.connect.buf[i] * sli2;
                    if (enIn3)
                        v += jckIn3.connect.buf[i] * sli3;
                    out[i] = v * gain;
                    gain += (g - gain) * 0.02;
                }
            } else {
                if (enable)
                    jckOut.FillBuf(0);
                enable = false;
            }
        }
    }

    return {
        Create : vca
    };
});