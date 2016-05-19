define(['options', 'panel'], function(options, panel) {
    'use strict';

    var model = function() {
        this.waveform = 0;
        this.frequency = 0;
    };

    var lfo = function (name, x, y) {

        this.model = new model();

        // waveform
        panel
        .AddSwitch(name + ".form", x + 8, y + 64, 16, 40, "sw3", 3, this.model.waveform)
        .bind(this.model, "waveform", "val", true);

        // frequency
        panel
        .AddKnob(name + ".f", x + 48, y + 68, 32, 32, "knob", 51, this.model.frequency)
        .bind(this.model, "frequency", "val", true);

        // private vars
        var jckOut = panel.AddJack(name + ".o", x + 68, y + 20, 2, 0x880000);
        var jckOut10 = panel.AddJack(name + ".o10", x + 40, y + 20, 2, 0x990000);

        var phase = 0;
        var buf = jckOut.buf;
        var buf10 = jckOut10.buf;

        this.model.frequency = 0.5;
        this.model.waveform = 0.5;

        this.Process = function () {
            var samplerate = options.get('samplerate');

            var f = Math.pow(1000, this.model.frequency) * 0.1;
            phase += f * 128 / samplerate;

            if (phase >= 1)
                phase -= 1;
            var xx, mul0 = 0, mul1 = 0, add0 = 0, add1 = 0;

            switch (this.model.waveform) {
                case 1:
                    mul0 = 4;
                    mul1 = -4;
                    add0 = -1;
                    add1 = 3;
                    break;
                case 0.5:
                    mul0 = mul1 = 2;
                    add0 = add1 = -1;
                    break;
                case 0:
                    mul0 = mul1 = 0;
                    add0 = -1;
                    add1 = 1;
                    break;
            }
            if (phase >= 0.5)
                xx = phase * mul1 + add1;
            else
                xx = phase * mul0 + add0;
            var xxx = xx;
            var xxx10 = xx * 0.1;
            for (var i = 0; i < 128; ++i) {
                buf[i] = xxx;
                buf10[0] = xxx10;
            }
        }
    };

    return {
        Create: lfo
    };

});