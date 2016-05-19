define(['options', 'panel'], function(options, panel) {
    'use strict';

    var model = function() {
        this.attack = 0;
        this.decay = 0;
        this.sustain = 0;
        this.release = 0;
    };

    function env(name, x, y) {

        this.model = new model();

        panel
            .AddSlider(name + ".a", x + 8, y + 28, this.model.attack)
            .bind(this.model, "attack", "val", true);

        panel
            .AddSlider(name + ".d", x + 28, y + 28, this.model.decay)
            .bind(this.model, "decay", "val", true);

        panel
            .AddSlider(name + ".s", x + 48, y + 28, this.model.sustain)
            .bind(this.model, "sustain", "val", true);

        panel
            .AddSlider(name + ".r", x + 68, y + 28, this.model.release)
            .bind(this.model, "release", "val", true);

        this.model.sustain = 1;

        // private variables
        var jckOutP = panel.AddJack(name + ".op", x + 68, y + 120, 2, 0xb00000);
        var jckOutN = panel.AddJack(name + ".on", x + 40, y + 120, 2, 0xc00000);
        var jckTrig = panel.AddJack(name + ".tr", x + 8, y + 120, 0, 0);

        var phase = 0;
        var val = 0;

        this.Process = function() {
            if (jckTrig.connect == null) {
                jckOutP.buf[0] = jckOutN.buf[0] = 0;
                phase = val = 0;
                return;
            }
            var n = 128 / options.get('samplerate');
            var ratea = n / (Math.pow(1000, this.model.attack) * 0.001);
            var rated = Math.pow(10, -2 / ((Math.pow(1000, this.model.decay) * 0.01) / n));
            var rater = Math.pow(10, -2 / ((Math.pow(1000, this.model.release) * 0.01) / n));
            switch (phase) {
            case 0:
                if (jckTrig.connect.buf[0] > 0)
                    phase = 1;
                else {
                    if (val > this.model.sustain) {
                        val = this.model.sustain + (val - this.model.sustain) * rated;
                    }
                    val *= rater;
                    if (val < 0.00001)
                        val = 0;
                }
                break;
            case 1:
                if (jckTrig.connect.buf[0] > 0) {
                    if ((val += ratea) >= 1) {
                        val = 1;
                        phase = 2;
                    }
                } else {
                    phase = 0;
                }
                break;
            case 2:
                if (jckTrig.connect.buf[0] > 0) {
                    val = this.model.sustain + (val - this.model.sustain) * rated;
                } else
                    phase = 0;
                break;
            }
            var xxp = val;
            var xxn = -val;
            for (var i = 0; i < 128; ++i) {
                jckOutP.buf[i] = xxp;
                jckOutN.buf[i] = xxn;
            }
        }
    }

    return {
        Create: env
    };
});