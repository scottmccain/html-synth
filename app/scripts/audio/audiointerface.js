define(['options', 'panel'], function (options, panel) {
    'use strict';

    var outquenum = 5;
    var outbufsize = 1024;
    var outbufsize2 = outbufsize * 2;

    function audioMix() {

        var keyboard = panel.GetSubPanel('keyboard');
        var mix = panel.GetSubPanel("mixer");
        var vco1 = panel.GetSubPanel("vco1");
        var vco2 = panel.GetSubPanel("vco2");
        var vca1 = panel.GetSubPanel("vca1");
        var vca2 = panel.GetSubPanel("vca2");
        var vcf1 = panel.GetSubPanel("vcf1");
        var vcf2 = panel.GetSubPanel("vcf2");
        var lfo1 = panel.GetSubPanel("lfo1");
        var lfo2 = panel.GetSubPanel("lfo2");
        var noise = panel.GetSubPanel("noise");
        var sh = panel.GetSubPanel("sh");
        var ring = panel.GetSubPanel("ring");
        var env1 = panel.GetSubPanel("env1");
        var env2 = panel.GetSubPanel("env2");
        var dist = panel.GetSubPanel("dist");


        this.queout = new Array(outquenum);
        this.queout2 = new Array(outquenum);
        this.windex = 0;
        this.rindex = 0;
        this.pat = 0;
        this.step = 0;
        this.steplen = options.get('samplerate') / 8;
        this.tick = 0;
        this.count = 0;

        var ii, i;
        for (i = 0; i < outquenum; ++i) {
            if (options.get('interface-enable') == 1) {
                this.queout[i] = new Float32Array(outbufsize2);
                for (ii = 0; ii < outbufsize2; ++ii)
                    this.queout[i][ii] = 0;
            }
            else if (options.get('interface-enable') == 2) {
                this.queout[i] = new Float32Array(outbufsize);
                this.queout2[i] = new Float32Array(outbufsize);
                for (ii = 0; ii < outbufsize; ++ii) {
                    this.queout[i][ii] = this.queout2[i][ii] = 0;
                }
            }
            else {
                this.queout[i] = new Array(outbufsize);
                for (ii = 0; ii < outbufsize2; ++ii)
                    this.queout[i][ii] = 0;
            }
        }

        this.SetSamplerate = function () {
            this.steplen = options.get('samplerate') * 15 / tempo;
        }
        this.SetTempo = function (x) {
            this.steplen = options.get('samplerate') * 15 / x;
        }
        this.GetQueNum = function () {
            if ((n = this.windex - this.rindex) < 0)
                n += outquenum;
            return n;
        }
        this.GetOutBuf = function () {
            if (this.rindex == this.windex)
                return -1;
            return this.rindex;
        }
        this.NextBuf = function () {
            if (this.rindex == this.windex)
                return -1;
            if (++this.rindex >= outquenum)
                this.rindex = 0;
            return 1;
        }
        this.Reset = function () {
            this.tick = this.steplen;
            this.rindex = this.windex = 0;
            this.written = 0;
        }
        this.Render = function (buf) {
        }
        this.DrawVu = function () {
        }
        this.Play = function () {
            if (((this.windex + 1) % outquenum) == this.rindex)
                return;

            var enable = options.get('interface-enable');

            var buf = mix.buf;

            for (var ilp = 0; ilp < outbufsize; ilp += 128) {

                // process generators and effects
                keyboard.Process();
                noise.Process();
                vco1.Process();
                vco2.Process();
                vcf1.Process();
                vcf2.Process();
                vca1.Process();
                vca2.Process();
                lfo1.Process();
                lfo2.Process();
                env1.Process();
                env2.Process();
                ring.Process();
                sh.Process();
                dist.Process();
                mix.Process();

                var j;
                switch (enable) {
                    case 1:
                        for (j = 0; j < 128; ++j) {
                            this.queout[this.windex][(ilp + j) << 1] = buf[j];
                            this.queout[this.windex][((ilp + j) << 1) + 1] = buf[j];
                        }
                        break;
                    case 2:
                        for (j = 0; j < 128; ++j) {
                            this.queout[this.windex][ilp + j] = buf[j];
                            this.queout2[this.windex][ilp + j] = buf[j];
                        }
                        break;
                    case 3:
                        for (j = 0; j < 128; ++j) {
                            this.queout[this.windex][ilp + j] = buf[j];
                        }
                        break;
                }
            }
            this.windex = (this.windex + 1) % outquenum;
        }
    }

    var handleError = function(handler, message) {
        console.log(message);

        if (typeof(handler) == "function") {
            handler(message);
        }
    };

    function audioInterface(stereo, success, error) {

        this.started = 0;
        this.written = 0;
        this.size = Math.floor(options.get('samplerate') * 15 / 120) * 16;
        this.buf = 0;
        this.totalwritten = 0;
        this.count = 0;

        options.set('interface-enable', 0);

        if (typeof (window.webkitAudioContext) !== "undefined") {
            this.audio = new window.webkitAudioContext();
            options.set('samplerate', this.audio.sampleRate);
            options.set('interface-enable', 2);
            options.set('outbufsize', 1024);
        } else if (typeof (window.AudioContext) !== "undefined") {
            this.audio = new window.AudioContext();
            options.set('samplerate', this.audio.sampleRate);
            options.set('interface-enable', 2);
            options.set('outbufsize', 1024);
        } else if (typeof (window.Audio) != "function") {
            this.audio = new window.Audio();
            if (typeof (this.audio.mozSetup) == "function") {
                options.set('interface-enable', 1);
                options.set('outbufsize', 1024);
            }
        }

        if (options.get('interface-enable') == 0) {
            options.set('interface-enable', 3);
            options.set('outbufsize', 4096);
        }

        switch (options.get('interface-enable')) {
            case 0:
                handleError(error, "Audio Disabled: 'AudioDataAPI' or 'WebAudioAPI' is not supported in this browser.");
            break;
        case 1:
            console.log("Using Audio Data API");
            break;
        case 2:
            console.log("Using Web Audio API");
            break;
        case 3:
            break;
        }

        if (options.get('interface-enable') > 0) {
            try {
                this.dummysample = new Float32Array(options.get('outbufsize'));
            } catch (e) {
                this.dummysample = new Array(options.get('outbufsize'));
            }
            for (var i = 0; i < options.get('outbufsize'); ++i)
                this.dummysample[i] = 0;
        }

        if (options.get('interface-enable') === 1) {
            this.audio.mozSetup(stereo + 1, options.get('samplerate'));
        }

        var outerThis = this;
        var audioMixer = new audioMix();

        if (options.get('interface-enable') == 2) {
            this.dummyosc = this.audio.createOscillator();
            this.jsnode = this.audio.createScriptProcessor(outbufsize, 2, 2);
            this.jsnode.onaudioprocess = function(e) {
                var outl = e.outputBuffer.getChannelData(0);
                var outr = e.outputBuffer.getChannelData(1);

                var b = audioMixer.GetOutBuf();
                if (b < 0) {
                    outl.set(outerThis.dummysample);
                    outr.set(outerThis.dummysample);
                } else {
                    outl.set(audioMixer.queout[b]);
                    outr.set(audioMixer.queout[b]);
                    audioMixer.NextBuf();
                }
            }
        }
        this.SetSamplerate = function(s) {
            if (s !== options.get('samplerate')) {
                options.set('samplerate', s);
            }
        }
        this.Write = function() {
            if (options.get('interface-enable') == 1) {

                if (this.started == 0)
                    return;

                if (this.written >= outbufsize2) {
                    if (audioMixer.NextBuf() < 0)
                        return;
                    this.written = 0;
                }
                if (this.totalwritten > this.audio.mozCurrentSampleOffset() + 16384)
                    return;
                var b = audioMixer.GetOutBuf();
                if (b >= 0) {
                    var w = this.audio.mozWriteAudio(audioMixer.queout[b].subarray(this.written));
                    this.totalwritten += w;
                    this.written += w;
                }
            }
        }
        this.Start = function() {
            this.started = 1;
            switch (options.get('interface-enable')) {
            case 1:
                break;
            case 2:
                this.dummyosc.connect(this.audio.destination);
                this.jsnode.connect(this.audio.destination);
                break;
            }

            audioMixer.Reset();
        }
        this.Stop = function() {
            this.started = 0;
            switch (options.get('interface-enable')) {
            case 1:
                break;
            case 2:
                this.jsnode.disconnect(0);
                break;
            }
        }
        this.SetSize = function(s) {
            this.size = s;
        }
        this.Update = function() {
            audioMixer.Play();
        }
    }

    return {
        Create: audioInterface
    }

});