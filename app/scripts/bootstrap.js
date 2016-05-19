'use strict';

require.config({
    paths: {
        'watchshim': '../../Scripts/watch-shim',
        'bootstrap': '../../Scripts/bootstrap',
        'jquery': '../../Scripts/jquery-1.9.1.min',
        'jquery-ui': '../../Scripts/jquery-ui-1.10.4',
        'tooltipster': '../../Scripts/jquery.tooltipster',
        'waapisim': '../../Scripts/waapisim',
        'audiointerface': 'audio/audiointerface',
        'message': 'utility/message',
        'controlbase': 'ui/controls/controlbase',
        'jack': 'ui/controls/jack',
        'knob': 'ui/controls/knob',
        'slider': 'ui/controls/slider',
        'key': 'ui/controls/key',
        'verticalswitch': 'ui/controls/verticalswitch',
        'horizontalswitch': 'ui/controls/horizontalswitch',
        'rectangle': 'ui/controls/rectangle',
        'distortionPanel': 'ui/distortionPanel',
        'vcaPanel': 'ui/vcaPanel',
        'vcfPanel': 'ui/vcfPanel',
        'vcoPanel': 'ui/vcoPanel',
        'envelopePanel': 'ui/envelopePanel',
        'lfoPanel': 'ui/lfoPanel',
        'noisePanel': 'ui/noisePanel',
        'shPanel': 'ui/shPanel',
        'mixPanel': 'ui/mixPanel',
        'ringPanel': 'ui/ringPanel',
        'keyboardPanel': 'ui/keyboardPanel',
        'panel': 'ui/panel',
        'background': 'ui/background',
        'options': 'utility/options',
        'imagestore': 'utility/imagestore'
    },
    shim: {
        'jquery-ui': { deps: ['jquery'] },
        'bootstrap': { deps: ['jquery'] },
        'tooltipster': { deps: ['jquery'] },
        'audiointerface': { deps: ['options', 'waapisim', 'panel'] },
        'knob': { deps: ['controlbase', 'imagestore', 'watchshim'] },
        'horizontalswitch': { deps: ['controlbase', 'imagestore'] },
        'verticalswitch': { deps: ['controlbase', 'imagestore'] },
        'slider': { deps: ['controlbase', 'imagestore'] },
        'key': { deps: ['controlbase', 'imagestore'] },
        'vcfPanel': { deps: ['panel', 'options'] },
        'vcaPanel': { deps: ['panel', 'options'] },
        'vcoPanel': { deps: ['panel', 'options'] },
        'envelopePanel': { deps: ['panel', 'options'] },
        'lfoPanel': { deps: ['panel', 'options'] },
        'mixPanel': { deps: ['panel', 'options'] },
        'shPanel': { deps: ['panel', 'options'] },
        'noisePanel': { deps: ['panel', 'options'] },
        'ringPanel': { deps: ['panel', 'options'] },
        'keyboardPanel': { deps: ['panel', 'options'] },
        'distortionPanel': { deps: ['panel', 'options'] },
        'panel': { deps: ['jack', 'knob', 'verticalswitch', 'slider', 'key', 'horizontalswitch'] },
        'app': {
            deps: [
                'bootstrap',                    
                'jquery',
                'jquery-ui',
                'rectangle',
                'options',
                'imagestore',
                'message',
                'jack',
                'key',
                'knob',
                'slider',
                'verticalswitch',
                'horizontalswitch',
                'vcfPanel',
                'vcaPanel',
                'vcoPanel',
                'envelopePanel',
                'lfoPanel',
                'mixPanel',
                'ringPanel',
                'noisePanel',
                'shPanel',
                'keyboardPanel',
                'panel',
                'background',
                'audiointerface',
                'watchshim',
                'tooltipster',
                'distortionPanel'
                
            ]
        }
    },
    priority: [
    ],
    config: {
        'app': {
            sampleRate : 44100    
        }
    },
    urlArgs: "v=" + (new Date()).getTime()
});

require([
    'app'
],
    function (app) {
        'use strict';

        $(document).ready(function () {

            var application = new app.Create();

            application.Init();
            application.Run();
        });
    });