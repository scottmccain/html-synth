define(['options', 'panel'], function(options, panel) {
    'use strict';

    var model = function() {
        this.color = 0;
    };

    function noise(name, x, y) {


        this.model = new model();

        // binding
        panel
        .AddHorizontalSwitch(name + ".n", x + 27, y + 19, 40, 16, "sw3horz", 3, this.model.color)
        .bind(this.model, "color", "val", true);

        // private variables
        var jckOut = panel.AddJack(name + ".o", x + 68, y + 0, 1, 0x900000);

        var b0 = 0;
        var b1 = 0;
        var b2 = 0;
        var b3 = 0;
        var b4 = 0;
        var b5 = 0;
        var c1 = null;
        var c2 = null;
        var c3 = null;
        var c4 = null;
        var q = 15;
        var q0 = null;
        var q1 = null;
        var brownQ = null;

        //init
        this.model.color = 1;

        // functions
        var reset = function () {

            var samplerate = options.get('samplerate');

            c1 = (1 << q) - 1;
            c2 = (~~(c1 / 3)) + 1;
            c3 = 1 / c1;
            c1 = c2 * 6;
            c4 = 3 * (c2 - 1);
            q0 = Math.exp(-200 * Math.PI / samplerate);
            q1 = 1 - q0;
        };

        //reset();

        var white = function() {
            var r = Math.random();
            return (r * c1 - c4) * c3;
        };

        var pink = function() {
            var w = white();
            b0 = 0.997 * b0 + 0.029591 * w;
            b1 = 0.985 * b1 + 0.032534 * w;
            b2 = 0.950 * b2 + 0.048056 * w;
            b3 = 0.850 * b3 + 0.090579 * w;
            b4 = 0.620 * b4 + 0.108990 * w;
            b5 = 0.250 * b5 + 0.255784 * w;
            return 0.55 * (b0 + b1 + b2 + b3 + b4 + b5);
        };

        var brown = function() {
            var w = white();
            brownQ = (q1 * w + q0 * brownQ);
            return 6.2 * brownQ;
        };

        this.Process = function () {

            reset();

            var fn = white;
            switch (this.model.color) {
                case 0: /* white */
                    fn = white;
                    break;

                case 0.5: /* brown */
                    fn = brown;
                    break;

                case 1: /* pink */
                    fn = pink;
                    break;
            }

            if (jckOut.fanout > 0) {
                var out = jckOut.buf;
                for (var i = 0; i < 128; ++i)
                    out[i] = fn();
            }
        }
    }

    return {
        Create: noise
    };
});
