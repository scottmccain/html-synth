define(['options', 'panel'], function (options, panel) {
    'use strict';

    function IIRFilter(sampleRate, cutoff, resonance, type) {
        var self = this,
            f = [0.0, 0.0, 0.0, 0.0],
            freq, damp,
            prevCut, prevReso,

            sin = Math.sin,
            min = Math.min,
            pow = Math.pow;

        self.cutoff = isNaN(cutoff) ? 20000 : cutoff; // > 40
        self.resonance = !resonance ? 0.1 : resonance; // 0.0 - 1.0
        self.samplerate = isNaN(sampleRate) ? 44100 : sampleRate;
        self.type = type || 0;

        function calcCoeff() {
            freq = 2 * sin(Math.PI * min(0.25, self.cutoff / (self.samplerate * 2)));
            damp = min(2 * (1 - pow(self.resonance, 0.25)), min(2, 2 / freq - freq * 0.5));
        }

        self.pushSample = function (sample) {
            if (prevCut !== self.cutoff || prevReso !== self.resonance) {
                calcCoeff();
                prevCut = self.cutoff;
                prevReso = self.resonance;
            }

            f[3] = sample - damp * f[2];
            f[0] = f[0] + freq * f[2];
            f[1] = f[3] - f[0];
            f[2] = freq * f[1] + f[2];

            f[3] = sample - damp * f[2];
            f[0] = f[0] + freq * f[2];
            f[1] = f[3] - f[0];
            f[2] = freq * f[1] + f[2];

            return f[self.type];
        };

        self.getMix = function (type) {
            return f[type || self.type];
        };
    }

    var model = function() {
        this.in1 = 0;
        this.in2 = 0;
        this.gain = 0;
        this.master = 0;
    };

    var distortion = function (name, x, y) {

        this.model = new model();

        var jckIn1 = panel.AddJack(name + ".i2", x + 97, y + 24, 0, 0x500000);
        var jckIn2 = panel.AddJack(name + ".i1", x + 117, y + 24, 0, 0x005000);

        var jckOut = panel.AddJack(name + ".o", x + 147, y + 144, 1, 0x000050);

        panel
            .AddSlider(name + ".i1m", x + 97, y + 44, this.model.mix1)
            .bind(this.model, "in1", "val", true)
            .Set(this.model.in1);

        panel
            .AddSlider(name + ".i2m", x + 117, y + 44, this.model.mix2)
            .bind(this.model, "in2", "val", true)
            .Set(this.model.in2);

        panel
            .AddKnob(name + ".g", x + 4, y + 145, 32, 32, "knob", 50, this.model.gain)
            .bind(this.model, "gain", "val", true);

        panel
            .AddKnob(name + ".m", x + 62, y + 145, 32, 32, "knob", 50, this.model.master)
            .bind(this.model, "master", "val", true);

        var enable = false;

        this.model.master = 1;
        this.model.gain = 4 / 50;

        this.model.in1 = .8;
        this.model.in2 = 0;

        var hpf1 = new IIRFilter(options.get("samplerate"),720.484),
            lpf1 = new IIRFilter(options.get("samplerate"), 723.431),
            hpf2 = new IIRFilter(options.get("samplerate"), 1.0);

        var distort = function (value, gain, master) {

            hpf1.pushSample(value);
            var smpl = hpf1.getMix(1) * gain;

            smpl = Math.atan(smpl) + smpl;
            if (smpl > 0.4) {
                smpl = 0.4;
            } else if (smpl < -0.4) {
                smpl = -0.4;
            }
            lpf1.pushSample(smpl);
            hpf2.pushSample(lpf1.getMix(0));
            smpl = hpf2.getMix(1) * master;
            return smpl;
        };

        this.Process = function() {

            var samplerate = options.get("samplerate");

            hpf1.samplerate = samplerate;
            hpf2.samplerate = samplerate;
            lpf1.samplerate = samplerate;

            if (jckOut.fanout <= 0)
                return;

            var v;
            var g = this.model.gain * 50;
            var m = this.model.master * 5;

            var sli1 = this.model.in1;
            var sli2 = this.model.in2;
            var enIn1 = (jckIn1.connect != null);
            var enIn2 = (jckIn2.connect != null);

            if (enIn1 || enIn2) {
                enable = true;
                var out = jckOut.buf;
                for (var i = 0; i < 128; ++i) {
                    v = 1e-100;

                    if (enIn1)
                        v += jckIn1.connect.buf[i] * sli1;
                    if (enIn2)
                        v += jckIn2.connect.buf[i] * sli2;

                    out[i] = distort(v, g, m, samplerate);
                }
            } else {
                if (enable)
                    jckOut.FillBuf(0);
                enable = false;
            }
        };
    };

    return {
        Create: distortion
    };
});