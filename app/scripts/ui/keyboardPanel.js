define(['options', 'panel'], function(options, panel) {
    'use strict';

    var model = function() {
        this.glide = 0;
    };

    function keyboard(name, x, y) {

        this.model = new model();
        this.key = new panel.AddKey("key", x + 56, y + 42);

        panel
        .AddKnob(name + ".gl", x + 514, y + 30, 32, 32, "knob", 51, this.model.glide)
        .bind(this.model, "glide", "val", true);

        // private variables
        var str = "";
        var start = 0;
        var tempo = 120;
        var deflen = 8;
        var oct = 3;
        var index = 0;
        var dur = 0;
        var gt = 0;
        var cvcur = 0;
        var cvlog = 0;

        var jckCv = panel.AddJack(name + ".cv", x + 56, y + 2, 2, 0x600000);
        var jckGate = panel.AddJack(name + ".g", x + 92, y + 2, 2, 0x700000);

        // initialization
        this.model.glide = 0;

        this.SetStr = function(s) {
            str = s;
        };

        this.Start = function (v) {
            jckGate.buf[0] = 0;
            tempo = 120;
            deflen = 8;
            oct = 3;
            index = 0;
            start = v;
            if (v == 0)
                this.key.DrawKey(-1);
        };


        this.GetNum = function() {
            var n = 0;
            while (str[index] >= '0' && str[index] <= '9') {
                n = n * 10 + parseInt(str[index]);
                ++index;
            }
            return n;
        };

        this.Note = function(n) {
            ++index;
            var n2 = n;
            while (1) {
                switch (str[index]) {
                case '+':
                case '#':
                    ++n2;
                    ++index;
                    break;
                case '-':
                    --n2;
                    ++index;
                    break;
                default:
                    var len;
                    len = this.GetNum();
                    if (len <= 0)
                        len = deflen;
                    var len2 = len;
                    while (str[index] == '.') {
                        ++index;
                        len2 = len / 2;
                        len += len2;
                    }
                    var st = 240 / (tempo * len);
                    if (str[index] == '&') {
                        ++index;
                        gt = st;
                    } else
                        gt = st * 0.8;
                    dur += st;
                    if (n >= 0) {
                        var nn = (oct - 2) * 12 + n2;
                        var v = n / 12 * 0.2;
                        if (v < 0)
                            v = 0;
                        if (v > 2)
                            v = 2;
                        cvlog = (nn / 12 * 0.2);
                        jckGate.FillBuf(1);
                        this.key.DrawKey(nn);
                    } else {
                        jckGate.FillBuf(0);
                        gt = 0;
                        this.key.DrawKey(-1);
                    }
                    return;
                }
            }
        };

        this.OutCv = function() {
            var diff = Math.abs(cvlog - cvcur);
            var ratio = 1;
            if (this.model.glide != 0) {
                ratio = Math.pow(100, this.model.glide) * 0.000078125 * options.get('samplerate');
                ratio = 1 - Math.exp(Math.log(0.01) / ratio);
            }
            if (diff < 1e-10)
                cvcur = cvlog;
            else
                cvcur += (cvlog - cvcur) * ratio;
            jckCv.FillBuf(cvcur);
        };

        this.Process = function () {
            var samplerate = options.get('samplerate');

            if (start == 0) {
                if (this.key.gate != 0) {
                    if (this.key.retrig)
                        jckGate.FillBuf(0);
                    else
                        jckGate.FillBuf(1);
                    cvlog = this.key.cv;
                }
                else
                    jckGate.FillBuf(0);
                this.OutCv();
                this.key.retrig = 0;
                return;
            }
            this.key.retrig = 0;
            if (dur > 0) {
                dur -= 128 / samplerate;
            }
            if (gt > 0) {
                if ((gt -= 128 / samplerate) <= 0) {
                    gt = 0;
                    jckGate.FillBuf(0);
                }
            }
            while (dur <= 0) {
                if (index >= str.length)
                    break;
                switch (str[index]) {
                    case 'T':
                    case 't':
                        ++index;
                        tempo = this.GetNum();
                        if (tempo <= 0)
                            tempo = 120;
                        break;
                    case 'V':
                        ++index;
                        this.GetNum();
                        break;
                    case 'L':
                    case 'l':
                        ++index;
                        deflen = this.GetNum();
                        break;
                    case '>':
                        ++index;
                        ++oct;
                        break;
                    case '<':
                        ++index;
                        --oct;
                        break;
                    case 'O':
                    case 'o':
                        ++index;
                        oct = this.GetNum();
                        break;
                    case 'R':
                    case 'r':
                        this.Note(-1);
                        break;
                    case 'C':
                    case 'c':
                        this.Note(0);
                        break;
                    case 'D':
                    case 'd':
                        this.Note(2);
                        break;
                    case 'E':
                    case 'e':
                        this.Note(4);
                        break;
                    case 'F':
                    case 'f':
                        this.Note(5);
                        break;
                    case 'G':
                    case 'g':
                        this.Note(7);
                        break;
                    case 'A':
                    case 'a':
                        this.Note(9);
                        break;
                    case 'B':
                    case 'b':
                        this.Note(11);
                        break;
                    default:
                        ++index;
                        break;
                }
            }
            this.OutCv();
            if (index >= str.length) {
                tempo = 120;
                deflen = 8;
                oct = 3;
                index = 0;
            }
        };

    }

    return {
        Create: keyboard
    };
});