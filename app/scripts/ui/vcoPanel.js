define(['options','panel'], function(options, panel) {
    'use strict';

    var octaveStep = 5;
    var waveformStep = 3;

    var model = function (oct, pit) {
        this.octave = oct;
        this.pitch = pit;
        this.coarsePitch = 0;
        this.waveform = 0;
        this.pwm = 0;
        this.pw = 0;
        this.mod1 = 0;
        this.mod2 = 0;
        this.mod3 = 0;
    };

    var vco = function(name, x, y, oct, pit) {

        this.x = x;
        this.y = y;
        this.w = 68;
        this.h = 380;

        this.model = new model(oct, pit);

        // coarse pitch
        panel
        .AddKnob(name + ".co", x + 8, y + 236, 40, 40, "knob2", 25, this.model.coarsePitch)
        .bind(this.model, "coarsePitch", "val", true);

        // pitch
        panel
        .AddKnob(name + ".pi", x + 16, y + 244, 24, 24, "knob3", 51, this.model.pitch)
        .bind(this.model, "pitch", "val", true);

        // pwm gain
        panel
        .AddSlider(name + ".pwm", x + 8, y + 72, this.model.pwm)
        .bind(this.model, "pwm", "val", true);

        // pulse width
        panel
        .AddSlider(name + ".pw", x + 28, y + 72, this.model.pw)
        .bind(this.model, "pw", "val", true);

        // octave
        panel
        .AddSwitch(name + ".oct", x + 8, y + 168, 16, 40, "sw5", octaveStep, this.model.octave)
        .bind(this.model, "octave", "val", true);

        // waveform
        panel
        .AddSwitch(name + ".form", x + 40, y + 168, 16, 40, "sw3", waveformStep, this.model.waveform)
        .bind(this.model, "waveform", "val", true);

        // modulation channel 1
        panel
        .AddSlider(name + ".m1m", x + 8, y + 280, this.model.mod1)
        .bind(this.model, "mod1", "val", true);

        // modulation channel 2
        panel
        .AddSlider(name + ".m2m", x + 28, y + 280, this.model.mod2)
        .bind(this.model, "mod2", "val", true);

        // modulation channel 3
        panel
        .AddSlider(name + ".m3m", x + 48, y + 280, this.model.mod3)
        .bind(this.model, "mod3", "val", true);

        // initialize model
        this.model.coarsePitch = .5;
        this.model.waveform = .5;
        this.model.mod1 = 1;
        this.model.mod2 = .1;
        this.model.mod3 = 0;

        // private vars
        var jackPwm = panel.AddJack(name + ".ipw", x + 8, y + 52, 0);
        var jackMod1 = panel.AddJack(name + ".m1", x + 8, y + 348, 0);
        var jackMod2 = panel.AddJack(name + ".m2", x + 28, y + 348, 0);
        var jackMod3 = panel.AddJack(name + ".m3", x + 48, y + 348, 0);
        var jackOut = panel.AddJack(name + ".o", x + 48, y + 52, 1);

        var phase = 0;
        var freq = 0;
        var delta = 0;

        this.Draw = function (ctx) {
            ctx.save();
            
            //ctx.font = 'bold 10px Calibri';
            //ctx.fillStyle = "white";
            //ctx.fillText('VCO', this.x + 5, this.y + 15);

            panel.DrawText('VCO', this.x + 5, this.y + 15, 'white');

            ctx.strokeStyle = '#aeaeae';
            panel.RoundRectangle(this.x, this.y, this.w, this.h, 3);
            //ctx.lineWidth = 1;
            //ctx.beginPath();
            //ctx.rect(this.x, this.y, this.w, this.h);
            //ctx.stroke();
            panel.DrawText('PWM', this.x + 2, this.y + 147, 'white');

            panel.DrawText('PWM', this.x + 4, this.y + 44, 'white');

            panel.DrawText('MAN', this.x + 31, this.y + 147, 'white');
            //ctx.fillText('PWM', 40, 122);

            //ctx.fillText('MAN', 65, 225);
            panel.DownArrow(this.x + 16, this.y + 47);

            ctx.strokeStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(this.x + 17, this.y + 150);
            ctx.lineTo(this.x + 17, this.y + 155);
            ctx.lineTo(this.x + 37, this.y + 155);
            ctx.lineTo(this.x + 37, this.y + 150);
            ctx.stroke();
            ctx.restore();
        };

        this.Process = function () {

            if (jackOut.fanout <= 0)
                return;

            var cv = (this.model.octave - 0.5)
                * (octaveStep - 1)
                * 0.2 + (this.model.coarsePitch - 0.5)
                * 0.4 + (this.model.pitch - 0.5)
                * 0.4 / 12;

            if (jackMod1.connect)
                cv += jackMod1.connect.buf[0] * this.model.mod1;
            if (jackMod2.connect)
                cv += jackMod2.connect.buf[0] * this.model.mod2;
            if (jackMod3.connect)
                cv += jackMod3.connect.buf[0] * this.model.mod3;

            freq = 130.8127826502993 * Math.pow(2, cv * 5);

            delta = freq / options.get('samplerate');
            if (delta > 1)
                delta = 1;

            // TODO: BIND
            var cpw = this.model.pw;
            if (jackPwm.connect)
                cpw += jackPwm.connect.buf[0] * this.model.pwm;

            if (cpw < 0)
                cpw = -cpw;
            if (cpw > 0.95)
                cpw = 0.95;

            var rcpw = 1 / (1 - cpw);
            var mul0, mul1, add0, add1;
            switch (this.model.waveform) {
                case 1:
                    mul0 = 4;
                    add0 = -1;
                    mul1 = -4;
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

            var xx;

            var out = jackOut.buf;
            for (var i = 0; i < 128; ++i) {
                if (phase > cpw) {
                    var ph2 = (phase - cpw) * rcpw;
                    if (ph2 >= 0.5)
                        xx = ph2 * mul1 + add1;
                    else
                        xx = ph2 * mul0 + add0;
                }
                else
                    xx = 0;
                phase += delta;
                if (phase >= 1)
                    phase -= 1;
                out[i] = xx;
            }
        }

    };


    return {
        Create : vco
    }
});