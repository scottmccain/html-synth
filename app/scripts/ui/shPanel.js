define(['options', 'panel'], function(options, panel) {
    'use strict';

    function sh(name, x, y) {

        var hold = 0;
        var trlast = 0;

        var jckIn = panel.AddJack(name + ".i", x + 8, y + 0, 0, 0x009000);
        var jckTr = panel.AddJack(name + ".tr", x + 32, y + 0, 0, 0xa00000);
        var jckOut = panel.AddJack(name + ".o", x + 68, y + 0, 1, 0x990000);

        this.Process = function () {
            if (jckOut.fanout > 0) {
                var out = jckOut.buf;
                var hhold = hold;
                if (jckTr.connect != null) {
                    var tr = jckTr.connect.buf[0];
                    if (tr > 0 && trlast <= 0) {
                        if (jckIn.connect != null)
                            hold = jckIn.connect.buf[0];
                        else
                            hold = 0;
                    }
                    trlast = tr;
                }
                for (var i = 0; i < 128; ++i)
                    out[i] = hhold;
            }
        }
    }

    return {
        Create : sh
    };
});