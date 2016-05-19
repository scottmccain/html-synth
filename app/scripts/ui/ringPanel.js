define(['options', 'panel'], function(options, panel) {
    'use strict';

    function ring(name, x, y) {

        var jckIn1 = panel.AddJack(name + ".i1", x + 8, y + 0, 0, 0x009000);
        var jckIn2 = panel.AddJack(name + ".i2", x + 32, y + 0, 0, 0xa0a000);
        var jckOut = panel.AddJack(name + ".o", x + 68, y + 0, 1);

        this.Process = function () {

            if (jckOut.fanout > 0) {
                var out = jckOut.buf, i;
                if (jckIn1.connect && jckIn2.connect) {
                    var in1 = jckIn1.connect.buf;
                    var in2 = jckIn2.connect.buf;
                    for (i = 0; i < 128; ++i)
                        out[i] = in1[i] * in2[i];
                } else {
                    for (i = 0; i < 128; ++i)
                        out[i] = 0;
                }
            }
        }
    }

    return {
        Create: ring
    };

});