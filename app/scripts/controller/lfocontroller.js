define(['generator', 'options'], function(generator, options) {
    'use strict';

    var lfocontroller = function(lfoPanel) {
        this.lfoPanel = lfoPanel;

        // hookup the generator
        this.generator = new generator.Lfo();
        this.generator.setOut(lfoPanel.jckOut);
        this.generator.setOut10x(lfoPanel.jckOut10);

        this.update = function () {

            //this.generator.setFreq(this.lfoPanel.knbFreq.val);
            //this.generator.setWaveform(this.lfoPanel.knbForm.val);

            //this.generator.generate(options.get('samplerate'));
        };

    };

    return {
        Create: lfocontroller
    };
});