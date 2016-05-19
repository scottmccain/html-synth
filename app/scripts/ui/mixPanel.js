define(['options', 'panel'], function(options, panel) {
    'use strict';

    var model = function() {
        this.mix1 = 0;
        this.mix2 = 0;
        this.mix3 = 0;
        this.mix4 = 0;
        this.mix1a = 0;
        this.mix2a = 0;
        this.mix3a = 0;
        this.mix4a = 0;
    };

    function mix(name, x, y) {
        
        this.model = new model();

        // TODO: link val and vala together
        this.model.mix1 = .2;
        this.model.mix2 = .2;

        try {
            this.buf = new Float32Array(128);
        } catch (e) {
            this.buf = new Array(128);
        }

        var jckIn1 = panel.AddJack(name + ".i1", x + 8, y + 52, 0, 0x005000);
        var jckIn2 = panel.AddJack(name + ".i2", x + 28, y + 52, 0, 0x500000);
        var jckIn3 = panel.AddJack(name + ".i3", x + 48, y + 52, 0, 0x000050);
        var jckIn4 = panel.AddJack(name + ".i4", x + 68, y + 52, 0, 0x500050);

        panel
            .AddSlider(name + ".i1m", x + 8, y + 72, this.model.mix1)
            .bind(this.model, "mix1a", "vala", true)
            .bind(this.model, "mix1", "val", true)
            .Set(this.model.mix1);


        panel
            .AddSlider(name + ".i2m", x + 28, y + 72, this.model.mix2)
            .bind(this.model, "mix2a", "vala", true)
            .bind(this.model, "mix2", "val", true)
            .Set(this.model.mix2);



        panel
            .AddSlider(name + ".i3m", x + 48, y + 72, this.model.mix3)
            .bind(this.model, "mix3a", "vala", true)
            .bind(this.model, "mix3", "val", true)
            .Set(this.model.mix3);


        panel
            .AddSlider(name + ".i4m", x + 68, y + 72, this.model.mix4)
            .bind(this.model, "mix4a", "vala", true)
            .bind(this.model, "mix4", "val", true)
            .Set(this.model.mix4);


        this.Process = function () {
            var vala, i;

            for (i = 0; i < 128; ++i) {
                this.buf[i] = 1e-100;
            }

            if (jckIn1.connect) {
                vala = this.model.mix1a;
                for (i = 0; i < 128; ++i)
                    this.buf[i] += jckIn1.connect.buf[i] * vala;
            }

            if (jckIn2.connect) {
                vala = this.model.mix2a;
                for (i = 0; i < 128; ++i)
                    this.buf[i] += jckIn2.connect.buf[i] * vala;
            }
            if (jckIn3.connect) {
                vala = this.model.mix3a;
                for (i = 0; i < 128; ++i)
                    this.buf[i] += jckIn3.connect.buf[i] * vala;
            }
            if (jckIn4.connect) {
                vala = this.model.mix4a;
                for (i = 0; i < 128; ++i)
                    this.buf[i] += jckIn4.connect.buf[i] * vala;
            }
        }
    }

    return {
        Create: mix
    };


});