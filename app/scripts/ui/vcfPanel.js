define(['options', 'panel'], function(options, panel) {
    'use strict';

    var model = function() {
        this.in1 = 0;
        this.in2 = 0;
        this.in3 = 0;

        this.mod1 = 0;
        this.mod2 = 0;
        this.mod3 = 0;

        this.cutoff = 0;
        this.resonance = 0;
    };

    function vcf(name, x, y) {

        var jckIn1 = panel.AddJack(name + ".i1", x + 8, y + 52, 0);
        var jckIn2 = panel.AddJack(name + ".i2", x + 28, y + 52, 0);
        var jckIn3 = panel.AddJack(name + ".i3", x + 48, y + 52, 0);
        var jckOut = panel.AddJack(name + ".o", x + 48, y + 252, 1);
        var jckMod1 = panel.AddJack(name + ".m1", x + 8, y + 348, 0);
        var jckMod2 = panel.AddJack(name + ".m2", x + 28, y + 348, 0);
        var jckMod3 = panel.AddJack(name + ".m3", x + 48, y + 348, 0);

        this.model = new model();

        this.model.in1 = 0.8;
        this.model.in2 = 0.8;
        this.model.in3 = 0;

        this.model.mod1 = 1;
        this.model.mod2 = 0.5;
        this.model.mod3 = 0;

        this.model.cutoff = 0.8;
        this.model.resonance = 0.5;

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
        .AddKnob(name + ".f", x + 12, y + 152, 32, 32, "knob", 50, this.model.cutoff)
        .bind(this.model, "cutoff", "val", true);

        panel
        .AddKnob(name + ".r", x + 12, y + 200, 32, 32, "knob", 50, this.model.resonance)
        .bind(this.model, "resonance", "val", true);

        panel
        .AddSlider(name + ".m1m", x + 8, y + 280, this.model.mod1)
        .bind(this.model, "mod1", "val", true);

        panel
        .AddSlider(name + ".m2m", x + 28, y + 280, this.model.mod2)
        .bind(this.model, "mod2", "val", true);

        panel
        .AddSlider(name + ".m3m", x + 48, y + 280, this.model.mod3)
        .bind(this.model, "mod3", "val", true);

        // private variables
        var y1, y2, y3, y4;

        var ox = 0;
        var k, r, p;

        k = r = p = 0;
        y1 = y2 = y3 = y4 = 0;

        var enable = false;

        // public functions
        this.SetFreq = function (f) {
            f = Math.min(0.45, Math.max(0.001, f));
            p = f * (1.8 - 0.8 * f);
            k = p * 2 - 1;
            var t = (1 - p) * 1.35;
            var t2 = 11 + t * t;
            r = this.model.resonance * (t2 + 6 * t) / (t2 - 6 * t) * 0.8;
        }

        this.SetFreq(1);

        this.Process = function () {

            var samplerate = options.get('samplerate');

            if (jckOut.fanout <= 0)
                return;

            var cv;
            cv = this.model.cutoff;
            if (jckMod1.connect)
                cv += jckMod1.connect.buf[0] * this.model.mod1;
            if (jckMod2.connect)
                cv += jckMod2.connect.buf[0] * this.model.mod2;
            if (jckMod3.connect)
                cv += jckMod3.connect.buf[0] * this.model.mod3;

            var freq = 130.8127826502993 * Math.pow(2, cv * 5);

            this.SetFreq(freq / samplerate);

            var sliIn1 = this.model.in1;
            var sliIn2 = this.model.in2;
            var sliIn3 = this.model.in3;

            var enIn1 = (jckIn1.connect != null);
            var enIn2 = (jckIn2.connect != null);
            var enIn3 = (jckIn3.connect != null);

            if (enIn1 || enIn2 || enIn3) {

                var out = jckOut.buf;

                var kk = k;
                var pp = p;

                enable = true;
                for (var i = 0; i < 128; ++i) {
                    var x = 1e-100;
                    if (enIn1)
                        x += jckIn1.connect.buf[i] * sliIn1;
                    if (enIn2)
                        x += jckIn2.connect.buf[i] * sliIn2;
                    if (enIn3)
                        x += jckIn3.connect.buf[i] * sliIn3;

                    x = x * .1 - r * y4;
                    var yy1 = y1;
                    var yy2 = y2;
                    var yy3 = y3;

                    y1 = (x + ox) * pp - yy1 * kk;
                    y2 = (y1 + yy1) * pp - yy2 * kk;
                    y3 = (y2 + yy2) * pp - yy3 * kk;
                    var yy4 = (y3 + yy3) * pp - y4 * kk;
                    y4 = yy4 - yy4 * yy4 * yy4 * 0.1666666666666667;
                    ox = x;
                    out[i] = y4 * 12;
                }
            } else {
                if (enable)
                    jckOut.FillBuf(0);
                enable = false;
            }
        }

    }

    return {
        Create: vcf
    };

});