define([
    'background', 'panel', 'options', 'imagestore', 'vcfPanel', 'vcaPanel', 'vcoPanel', 'lfoPanel', 'envelopePanel', 'mixPanel', 'ringPanel', 'noisePanel', 'shPanel', 'keyboardPanel', 'distortionPanel', 'audiointerface'], function (background, panel, options, imagestore, vcf, vca, vco, lfo, env, mix, ring, noise, sh, keyboard, distortion, audiointerface) {
    'use strict';


    var application = function() {


/****** Constants *******/
        var backgroundLayer = 0;
        var foregroundLayer = 1;
        var layers = 2;
        /***********************/

        var drawables = new Array();
        var canvas, ctx, kb;

        var initBackground = function() {
            var panelImage = $("#panel")[0];
            drawables[backgroundLayer].push(new background.Factory(panelImage, 0, 0, canvas));
        };


        var getMousePoint = function(e) {
            var rc = e.target.getBoundingClientRect();

            var mousePoint = {};
            mousePoint.x = Math.floor(e.clientX - rc.left);
            mousePoint.y = Math.floor(e.clientY - rc.top);
            if (mousePoint.x < 0) mousePoint.x = 0;
            if (mousePoint.y < 0) mousePoint.y = 0;

            return mousePoint;
        };

        var mouseMove = function(e) {
            var mousePoint = getMousePoint(e);

            panel.MouseMove(mousePoint.x, mousePoint.y);

            if (panel.Hover() != null) {
                $("#viewport").addClass("control-hover");
            } else {
                $("#viewport").removeClass("control-hover");
            }
        };

        var mouseDown = function(e) {
            var mousePoint = getMousePoint(e);
            panel.MouseDown(mousePoint.x, mousePoint.y);
        };

        var mouseUp = function(e) {
            var mousePoint = getMousePoint(e);
            panel.MouseUp(mousePoint.x, mousePoint.y);
        };

        var keyPress = function(e) {
            if (document.activeElement == document.getElementById("viewport"))
                return false;
            return true;
        };

        var keyDown = function (e) {
            kb.key.KeyPress(e.keyCode, 1);
            return true;
        };

        var keyUp = function(e) {
            kb.key.KeyPress(e.keyCode, 0);
            return true;
        };

        this.Draw = function() {

            ctx.fillStyle = "#e3e3e3";
            ctx.fillRect(0, 0, 700, 700);

            // draw the layers
            var i, j;
            for (i = 0; i < layers; i++) {
                for (j = 0; j < drawables[i].length; j++) {
                    drawables[i][j].Draw();
                }
            }
        };

        var addForegroundDrawable = function(d) {
            drawables[foregroundLayer].push(d);
        };

        var initlayers = function() {

            // make layers (just two for now)
            drawables.push(new Array());
            drawables.push(new Array());

        };

        var createSubPanels = function() {

            kb = new keyboard.Create("kb", 48, 502);

            panel.AddSubPanel("keyboard", kb);
            panel.AddSubPanel("noise", new noise.Create("noise", 564, 286));
            panel.AddSubPanel("vco1", new vco.Create("vco1", 36, 78, 0.5, 0.5));
            panel.AddSubPanel("vco2", new vco.Create("vco2", 108, 78, 0.25, 0.45));
            panel.AddSubPanel("vcf1", new vcf.Create("vcf1", 180, 78));
            panel.AddSubPanel("vcf2", new vcf.Create("vcf2", 252, 78));
            panel.AddSubPanel("vca1", new vca.Create("vca1", 324, 78));
            panel.AddSubPanel("vca2", new vca.Create("vca2", 396, 78));
            panel.AddSubPanel("lfo1", new lfo.Create("lfo1", 468, 374));
            panel.AddSubPanel("lfo2", new lfo.Create("lfo2", 564, 374));
            panel.AddSubPanel("env1", new env.Create("env1", 468, 78));
            panel.AddSubPanel("env2", new env.Create("env2", 468, 226));
            panel.AddSubPanel("ring", new ring.Create("ring", 564, 250));
            panel.AddSubPanel("sh", new sh.Create("sh", 564, 346));
            panel.AddSubPanel("mixer", new mix.Create("mix", 564, 78));
            panel.AddSubPanel("dist", new distortion.Create("dist", 525, 510));
        };

        var initCanvas = function() {

            canvas = $("#viewport")[0];
            ctx = canvas.getContext('2d');

            canvas.onmousedown = mouseDown;
            canvas.onmousemove = mouseMove;
            canvas.onmouseup = mouseUp;

            document.onkeydown = keyDown;
            document.onkeyup = keyUp;
            document.onkeypress = keyPress;
        };

        var initImages = function() {
            imagestore.store("sw3", $("#sw3")[0]);
            imagestore.store("sw2", $("#sw2")[0]);
            imagestore.store("sw5", $("#sw5")[0]);
            imagestore.store("knob", $("#knob")[0]);
            imagestore.store("knob2", $("#knob2")[0]);
            imagestore.store("knob3", $("#knob3")[0]);
            imagestore.store("slider", $("#sliderpos")[0]);
            imagestore.store("panel", $("#panel")[0]);
            imagestore.store("keypress", $("#keypress")[0]);
            imagestore.store("sw3horz", $("#sw3horz")[0]);
            imagestore.store("background", $("#background")[0]);
        };

        var interval = function(iface) {
            iface.Update();
            iface.Write();
        };

        var cmdPlay = function(v) {
            if (v) {
                kb.SetStr(document.getElementById("mml").value);
                kb.Start(1);
            }
            else {
                kb.Start(0);
            }
        }

        var gup = function(name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.href);
            if (results == null)
                return null;
            else
                return results[1];
        }

        var changePatch = function () {

            var patch = $('#patch').val();

            var c, connection;
            var connections = patch.split(',');

            var fromOkay, toOkay;

            panel.Clear();
            
            for (c in connections) {
                connection = connections[c];

                // split the connection
                var sides = connection.split(':');

                // find the sides
                if (sides.length == 2) {
                    var from = panel.Controls[sides[0]];
                    var to = panel.Controls[sides[1]];

                    fromOkay = (typeof from != "undefined" && from != null);
                    toOkay = (typeof to != "undefined" && to != null);

                    if (fromOkay && toOkay) {

                        from.Connect(to);

                    } else {

                        console.log("bad jack: " + sides[0] + " => " + sides[1]);
                        
                    }
                }
            }

        };

        var findJack = function (n, t) {
            var i, w;
            for (i in panel.Controls) {
                w = panel.Controls[i];
                if (t == 0) {
                    if (w.ty == 0) {
                        if (w.pnum == n)
                            return w;
                    }
                }
                else {
                    if (w.ty != 0 && w.ty < 100) {
                        if (w.pnum == n)
                            return w;
                    }
                }
            }
        };

        this.Load = function(patch, song) {

            console.log('load patch: ' + patch);

            var i, ii, j, s, w;

            if (patch == null || song == null)
                return;

            var vals = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            s = patch;
            for (ii in panel.Controls) {
                w = panel.Controls[ii];
                if (w.ty == 0)
                    w.connect = null;
                else if (w.ty < 100)
                    w.fanout = 0;
            }
            for (j = 0; j < s.length; j += 2) {
                if (s.charAt(j) == "_")
                    break;
                var n = vals.indexOf(s.charAt(j));
                var v = vals.indexOf(s.charAt(j + 1));
                findJack(n, 0).Connect(findJack(v, 1));

            }

            this.Draw();

            ++j;
            for (ii in panel.Controls) {
                w = panel.Controls[ii];

                switch (w.ty) {
                    case 100:
                case 102:
                    w.Set(vals.indexOf(s.charAt(j)) / (w.step - 1));
                    ++j;
                    break;
                    case 101:
                    w.Set(vals.indexOf(s.charAt(j)) / 50);
                    ++j;
                    break;
                }

            }

            try {
                s = decodeURIComponent(song);
            } catch (e) {
                s = song;
            }

            document.getElementById("mml").value = s;

            cmdPlay(1);

            this.Draw();
        };

        this.Save = function() {
            var jstr = "";
            var kstr = "";
            var vals = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            var i, w;

            for (i in panel.Controls) {
                w = panel.Controls[i];
                switch (w.ty) {
                    case 0:
                        if (w.connect != null) {
                            jstr += vals[w.pnum];
                            jstr += vals[w.connect.pnum];
                        }
                        break;
                    case 100:
                    case 102:
                        kstr += vals[(w.val * (w.step - 1)) | 0];
                        break;
                    case 101:
                        kstr += vals[(w.val * 50) | 0];
                        break;
                }
            }
            var mstr = encodeURIComponent(document.getElementById("mml").value);
            var url = document.URL.split("?")[0] + "?p=" + jstr + "_" + kstr + "&s=" + mstr + '#moog';
            document.getElementById("url").value = url;
            return url;
        };

        this.Init = function() {

            initlayers();
            initCanvas(this);
            initBackground();
            initImages();

            // initialize main panel
            panel.Init(canvas, this);
            addForegroundDrawable(panel);

            createSubPanels();

            changePatch();

            var self = this;
            $('#patch').on('change', function (e) {

                changePatch();

                self.Draw();
            });

            $("#play").on("click", function() {
                cmdPlay(1);
            });

            $("#stop").on("click", function() {
                cmdPlay(0);

                self.Draw();
            });

            $("#save").click(function() {
                self.Save();
            });

        };



        this.Run = function() {
            this.Draw();

            var iface = new audiointerface.Create(1);
            if (iface.started == 0) {

                iface.Start();
                setInterval(function() {
                    interval(iface);
                }, 20);
            }

            var patch = gup('p');
            var song = gup('s');

            if (patch != null && song != null) {
                this.Load(patch, song);
            }
        };
        
    };

    return {
        Create : application
    };
});