/*
OpenNOMS (Noise and Operations Management System)
    Copyright (C) 2012  Farallon Geographics, Inc

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
	
Contact: info@fargeo.com
*/

/** api: constructor
*  .. class:: TrackAnimator
*/
Ext.define('OpenNoms.widgets.TrackAnimator', {
    extend: 'Ext.container.ButtonGroup',
    alias: 'widget.opennoms-widgets-trackanimator',

    layout: {
        type: 'hbox'
    },
    baseCls: 'x-plain',
    style: 'margin-top: 2px; margin-left: 2px;',
    height: 22,
    border: '0 0 0 0',

    /** api: config[textReset]
    *  ``String``
    *  Text to be displayed as a tooltip for the animation reset button.
    *  Default is "reset".
    */
    textReset: "reset",

    /** api: config[textPlay]
    *  ``String``
    *  Text to be displayed as a tooltip for the animation play button.
    *  Default is "play".
    */
    textPlay: "play",

    /** api: config[textStop]
    *  ``String``
    *  Text to be displayed as a tooltip for the animation stop button.
    *  Default is "stop".
    */
    textStop: "stop",

    /** api: config[textRepeat]
    *  ``String``
    *  Text to be displayed as a tooltip for the animation repeat button.
    *  Default is "reset".
    */
    textRepeat: "repeat",

    /** api: config[url]
    *  ``String``
    *  URL for requesting track features.  If not provided the animator must
    *  be configured with a ``store``.
    */
    url: null,


    /**
    *  ``String``
    *  Extra parameters to be sent with every request
    */
    extraParams: null,

    /** api: config[formatOptions]
    *  ``Object``
    *  If a ``url`` a KML parser will be used to parse requested features.
    *  Any options to the KML format can be specified in this property.
    */
    formatOptions: null,

    /** api: config[store]
    *  :class:`GeoExt.data.FeatureStore`
    *  A configured store with features representing track locations.  If
    *  not provided, the ``url`` property must be given and a store will be
    *  created.
    */
    store: null,

    /** api: config[fields]
    *  ``Array``
    *  Optional list of field definitions for records in the store.  If not 
    *  provided, fields are assumed to be "when" (date), "heading" (number), 
    *  "tilt" (number), "roll" (number), "altitude" (number), and "trackId"
    *  (string).
    */
    fields: null,

    /** api: config[layer]
    *  :class:`OpenLayers.Layer.Vector`
    *  A layer for diplaying tracks.  Features on this layer are managed
    *  by this component, but the layer should be destroyed manually (it
    *  is not destroyed when the compoent is destroyed).
    */
    layer: null,

    /** api: config[span]
    *  ``Number``
    *  The length of track to display (in seconds).  Default is 60.
    */
    span: 60,

    /** api: config[speed]
    *  ``Number``
    *  Factor by which the animation time is exaggerated.  Default is 10 (the
    *  animation will play at 10x real time).  The animation must be stopped
    *  to change this value.
    */
    speed: 10,

    /** api: config[frameRate]
    *  ``Number``
    *  The number of steps in the animation per second.  Default is 6.  Note
    *  that your browser will not be able to display very high animation rates.
    *  The animation must be stopped to change this value.
    */
    frameRate: 6,

    /** api: config[repeat]
    *  ``Boolean``
    *  Start the animation over when it gets to the end.  Default is false.
    */
    repeat: false,

    /** api: config[playContinuously]
    *  ``Boolean``
    *  Keep requesting new records and displosing of old one.  Default is false.
    */
    playContinuously: false,

    /** api: config[aggressive]
    *  ``Boolean``
    *  Update the display as slider thumb is dragged.  Default is true.  If
    *  false, the display will only be updated when thumb dragging completes.
    */
    aggressive: true,

    /** api: property[playing]
    *  ``Boolean``
    *  The animation is currently playing (read-only).
    */
    playing: false,

    /** private: method[oldTracks]
    */
    oldTracks: [],

    /** private: method[bufferLoading]
    */
    bufferLoading: false,

    /** private: method[bufferLength]
    */
    bufferLength: 60000,

    /** private: method[initComponent]
    */
    initComponent: function () {

        this.addEvents(
        /** private: event[load]
        *  Fires after a new set of Records has been loaded.  Listeners 
        *  will receive the arguments included in the store load event. 
        */
            "load",

        /** private: event[exception]
        *  Fires if an exception occurs in the Proxy during a remote 
        *  request.  Listeners will receive the arguments included in the 
        *  store exception event. 
        */
            "exception"
        );

        this.bufferStore = Ext.create('Ext.data.Store', {
            fields: this.fields || [
		            { name: "when", type: "date", dateFormat: 'c' },
		              { name: "heading", type: "number" },
		              { name: "altitude", type: "number" },
                      { name: "speed", type: "number" },
                      { name: "adflag", type: "string" },
		              { name: "mactype", type: "string" },
		              { name: "airline", type: "string" },
		              { name: "trackId", type: "number", mapping: "opnum" },
		              { name: "flight_id", type: "string" }
            ],
            sortInfo: { field: 'when', direction: 'ASC' },
            proxy: Ext.create('FGI.data.proxy.GeoserverJsonP', {
                url: this.url,
                extraParams: this.extraParams
            }),
            autoLoad: false,
            listeners: {
                load: function (bufferStore) {
                    var deadTracks = [];
                    bufferStore.each(function (rec) {
                        // parse the track details
                        var trackdetails = Ext.decode(rec.raw.trackdetails);
                        if (trackdetails) {
                            rec.set('when', trackdetails.t);
                            rec.set('heading', trackdetails.h);
                            rec.set('altitude', trackdetails.z);
                            rec.set('speed', trackdetails.s);

                            // create an OL point from the track deatils
                            var wpt = new OpenLayers.Geometry.Point(trackdetails.x, trackdetails.y);
                            rec.set('feature', new OpenLayers.Feature.Vector(wpt, rec.data));

                            //                            var when = rec.get('when').valueOf();
                            //                            if (when < this.startTime) {
                            //                                this.startTime = when;
                            //                            } if (when > this.endTime) {
                            //                                this.endTime = when;
                            //                            }
                        } else {
                            deadTracks.push(rec);
                        }

                    }, this);

                    bufferStore.remove(deadTracks);

                    this.store.add(bufferStore.data.items, true);

                    this.bufferLoading = false;

                },
                beforeLoad: function () {
                    this.endTime = this.endTime + this.bufferLength;
                    this.slider.maxValue = this.endTime;
                    var st = new Date();
                    var et = new Date();
                    st.setTime(this.endTime - this.bufferLength);
                    et.setTime(this.endTime);
                    this.params.isorange = Ext.Date.format(st, 'Y-m-d H\\\\:i\\\\:s') + '/' + Ext.Date.format(et, 'Y-m-d H\\\\:i\\\\:s');
                    this.extraParams.viewparams = this.formatParamsForGeoserver(this.params);
                    this.bufferLoading = true;
                },
                scope: this
            }
        });



        if (!this.store) {

            var formatOptions = Ext.apply(this.formatOptions || {}, {
                extractTracks: true
            });

            this.store = Ext.create('Ext.data.Store', {
                fields: this.fields || [
		              { name: "when", type: "date", dateFormat: 'c' },
		              { name: "heading", type: "number" },
		              { name: "altitude", type: "number" },
                      { name: "speed", type: "number" },
                      { name: "adflag", type: "string" },
		              { name: "mactype", type: "string" },
		              { name: "airline", type: "string" },
		              { name: "trackId", type: "number", mapping: "opnum" },
		              { name: "flight_id", type: "string" }
                ],
                sortInfo: { field: 'when', direction: 'ASC' },
                proxy: Ext.create('FGI.data.proxy.GeoserverJsonP', {
                    url: this.url,
                    extraParams: this.extraParams
                }),
                autoLoad: false,
                listeners: {
                    load: function (store) {
                        //                        this.startTime = Number.POSITIVE_INFINITY;
                        //                        this.endTime = Number.NEGATIVE_INFINITY;
                        this.playPauseBtn.disable();
                        var deadTracks = [];
                        store.each(function (rec) {
                            // parse the track details
                            var trackdetails = Ext.decode(rec.raw.trackdetails);
                            if (trackdetails) {
                                rec.set('when', trackdetails.t);
                                rec.set('heading', trackdetails.h);
                                rec.set('altitude', trackdetails.z);
                                rec.set('speed', trackdetails.s);

                                // create an OL point from the track deatils
                                var wpt = new OpenLayers.Geometry.Point(trackdetails.x, trackdetails.y);
                                rec.set('feature', new OpenLayers.Feature.Vector(wpt, rec.data));

                                //                            var when = rec.get('when').valueOf();
                                //                            if (when < this.startTime) {
                                //                                this.startTime = when;
                                //                            } if (when > this.endTime) {
                                //                                this.endTime = when;
                                //                            }
                            } else {
                                deadTracks.push(rec);
                            }

                        }, this);

                        store.remove(deadTracks);

                        if (this.store.getCount() <= 1 && !this.playContinuously) {
                            this.updateSliderTip(this.slider, "No Data Available for Selected Date/Time", this.slider.thumbs[0]);
                        } else {
                            this.playPauseBtn.enable();
                            this.slider.minValue = this.startTime;
                            this.slider.maxValue = this.endTime;
                            this.slider.setValue(this.startTime, false);

                            this.updateDisplay();
                            if (this.playContinuously) {
                                this.play();
                            } else {
                                // make sure the speed reflects the combo value (speed gets changed programatically for realtime state)
                                this.speed = this.speedcombo.getValue()
                            }
                        }

                    },
                    scope: this
                }
            });
        }

        this.relayEvents(this.store, ["load", "exception"]);

        this.playPauseBtn = Ext.create('Ext.Button', {
            id: 'animationplaybutton',
            iconCls: 'play',
            width: 65,
            text: 'Play',
            scope: this,
            disabled: true,
            enableToggle: true,
            toggleHandler: function (btn, pressed) {
                if (pressed) {
                    this.play();
                    this.playPauseBtn.setText('Pause');
                    this.playPauseBtn.setIconCls('pause');
                } else {
                    this.stop();
                    this.playPauseBtn.setText('Play');
                    this.playPauseBtn.setIconCls('play');
                }
            }
        });

        this.slider = Ext.create('Ext.slider.Single', {
            cls: "gxux-trackanimator-slider",
            id: 'animationslider',
            flex: 1,
            tipText: function (a) {
                var t = new Date();
                t.setTime(a.value);
                return t.toTimeString();
            },
            style: 'margin-left: 15px; margin-right: 15px; margin-top: 2px;',
            listeners: {
                change: function (slider, newValue, thumb, eOpts) {
                    if (this.aggressive) {
                        this.updateDisplay.apply(this, arguments);
                    }
                    if (!this.hidden) {
                        var t = new Date();
                        t.setTime(newValue);
                        this.updateSliderTip(slider, t.toTimeString(), thumb);
                    }
                },
                changecomplete: this.updateDisplay,
                scope: this
            }
        });

        this.speedcombo = Ext.create('Ext.form.ComboBox', {
            xtype: 'combo',
            id: 'animationspeedcombo',
            name: 'animationspeed',
            value: this.speed,
            labelWidth: 90,
            labelAlign: 'right',
            width: 150,
            fieldLabel: 'Animation Speed',
            store: Ext.create('Ext.data.Store', {
                fields: ['multiplier', 'text'],
                data: [
                    { "multiplier": 1, "text": "1 x" },
                    { "multiplier": 2, "text": "2 x" },
                    { "multiplier": 4, "text": "4 x" },
                    { "multiplier": 10, "text": "10 x" },
                    { "multiplier": 20, "text": "20 x" },
                    { "multiplier": 30, "text": "30 x" },
                    { "multiplier": 60, "text": "60 x" }
                ]
            }),
            queryMode: 'local',
            displayField: 'text',
            valueField: 'multiplier',
            listeners: {
                scope: this,
                'select': function (c) {
                    if (this.playing) {
                        this.stop();
                        this.speed = c.value;
                        this.play();
                    } else {
                        this.speed = c.value;
                    }
                }
            }
        });

        this.items = [
            this.playPauseBtn,
            this.speedcombo,
            this.slider
        ];

        this.callParent(arguments);
    },

    /** private: method[updateDisplay]
    *  Update displayed features based on slider value.
    */
    updateDisplay: function () {

        var maxTime = this.slider.getValue();
        var minTime = maxTime - (this.span * 1000);

        var trackIds = {};
        this.store.filterBy(function (rec) {
            var when = rec.get("when").getTime();
            //console.log(when);
            var include = minTime <= when && maxTime >= when;
            if (include) {
                var trackId = rec.get("trackId");
                var feature = rec.data.feature;
                //console.log(trackId,feature);
                var obj = trackIds[trackId];
                if (!obj) {
                    obj = { points: [] };
                    trackIds[trackId] = obj;
                }
                obj.points.push(feature.geometry);
                obj.attributes = feature.attributes;
                //console.log(obj);
                if (this.playContinuously) {
                    this.oldTracks.push(rec);
                }
            }

            return include;
        });

        // remove the old tracks to make room for new ones
        if (this.playContinuously) {
            this.store.remove(this.oldTracks);
        }

        if (this.layer) {
            this.layer.removeAllFeatures();
            var tracks = [];
            var heads = [];
            var obj;
            for (var trackId in trackIds) {
                obj = trackIds[trackId];
                tracks.push(new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.LineString(obj.points),
                    obj.attributes
                ));
                heads.push(new OpenLayers.Feature.Vector(
                    obj.points[obj.points.length - 1].clone(),
                    obj.attributes
                ));
            }
            this.layer.addFeatures(tracks.concat(heads));
        }
    },


    /** 
    *  Hide this component
    */
    hide: function (date) {
        this.slider.plugins[0].hide();
        this.callParent(arguments);
    },

    /** api: method[play]
    *  Start playing the animation.
    */
    play: function () {
        if (this.playing) {
            this.reset();
        } else {
            this.playing = true;
            var interval = 1000 / this.frameRate;
            var increment = this.speed * interval;
            function step() {
                var more = true;
                var time = this.slider.getValue() + increment;
                if (time > this.endTime) {
                    if (this.repeat) {
                        this.reset();
                        this.play();
                    } else {
                        this.reset();
                        more = false;
                    }
                } else {
                    this.slider.setValue(time);
                    if (this.playContinuously) {
                        // have to manaully call updateDisplay because slider is not visible and hence not firing events
                        this.updateDisplay();
                        if (!this.bufferLoading && (time + 20000) > this.endTime) {
                            this.bufferStore.load();
                        }
                    }
                }
                return more;
            }
            if (step.call(this)) {
                this.timerId = window.setInterval(Ext.bind(step, this), interval);
            }
        }
    },

    /** api: method[stop]
    *  Stop playing the animation.
    */
    stop: function () {
        window.clearInterval(this.timerId);
        this.playing = false;
    },

    /** api: method[reset]
    *  Stop playing and reset the animation.
    */
    reset: function () {
        this.stop();
        this.playPauseBtn.toggle(false);
        this.slider.setValue(this.startTime);
        this.slider.plugins[0].hide();
    },


    updateSliderTip: function (slider, text, thumb) {
        slider.plugins[0].show();
        slider.plugins[0].update(text)
        var xy = slider.plugins[0].el.getAlignToXY(thumb.el.id, 'b-t');
        xy[1] += -10;
        slider.plugins[0].showAt(xy);
    }

});