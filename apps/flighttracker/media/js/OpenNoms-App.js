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

Ext.namespace('OpenNoms', 'OpenNoms.app');

OpenNoms.app = {
    init: function () {
        Ext.tip.QuickTipManager.init();
        this.loadingMask = Ext.Msg.wait('Initializing...');

        this.updateAppConfig();
        this.buildUI();
        this.applyListeners();
        this.loadData();
        this.initControllers();

        this.loadingMask.hide();
    },

    updateAppConfig: function () {
        var queryStringObj = Ext.Object.fromQueryString(window.location.search);
        Ext.Object.each(queryStringObj, function (key, value, obj) {
            if (value === 'true') {
                obj[key] = true;
            } else if (value === 'false') {
                obj[key] = false;
            }
        }, this);
        Ext.apply(OpenNoms.config.AppConfig, queryStringObj);
    },

    /*
    * setup all visual components
    */
    buildUI: function () {
        this.helpWindow = Ext.create('Ext.window.Window', {
            title: 'Help',
            height: 600,
            width: 600,
            autoScroll: true,
            modal: true,
            resizable: false,
            draggable: false,
            closeAction: 'hide',
            loader: {
                url: 'help.html',
                renderer: 'html',
                autoLoad: true
            }
        });

        this.appPanel = Ext.create('OpenNoms.widgets.AppPanel', {
            listeners: {
                'afterrender': function () {
                    Ext.get('feedback-link').on('click',
                        function () {
                            Ext.Msg.alert('Under Construction', 'This feature is coming soon!');
                        }, this
                    );

                    Ext.get('help-link').on('click',
                        function () {
                            this.helpWindow.show();
                        }, this
                    );
                },
                scope: this,
                single: true
            }
        });

        this.stateController = Ext.create('OpenNoms.controller.State', { id: 'stateController' });

        this.queryController = Ext.create('OpenNoms.controller.Query', { id: 'queryController' });


        this.viewport = new Ext.Viewport({
            layout: 'card',
            items: [
                this.appPanel,
                this.stateController,
                this.queryController
            ]
        });
    },

    /*
    * setup all the listeners
    */
    applyListeners: function () {
        this.appPanel.appHeader.on({
            'measureclicked': function (mode, state) {
                this.appPanel.mapPanel.drawDistanceMeasureControl.deactivate();
                this.appPanel.mapPanel.drawAreaMeasureControl.deactivate();
                if (state) {
                    this.appPanel.mapPanel.measureLayer.removeAllFeatures();
                    this.appPanel.measureFeedbackPanel.hide();
                    if (mode == 'area') {
                        this.appPanel.mapPanel.drawAreaMeasureControl.activate();
                    } else if (mode == 'distance') {
                        this.appPanel.mapPanel.drawDistanceMeasureControl.activate();
                    }
                }
            },
            'emailclicked': function () {
                Ext.getCmp('linkurltextfield').setValue(this.getLinkURL());
                this.appPanel.linkURLWindow.show();
            },
            'setdatetimerange': function () {
                switch (this.stateController.state) {
                    case 'static':
                        this.queryController.updateLayerWithNewParams(this.appPanel.mapPanel.staticflightlayer);
                        break;
                    case 'animated':
                        this.queryController.getAnimatedFlightData();
                        break;
                }
            },
            scope: this
        });

        this.appPanel.appHeader.on({
            'changestate': this.stateController.changeState,
            scope: this.stateController
        });

        // handle the display of the "loading" gif
        this.appPanel.mapPanel.staticflightlayer.events.register('loadstart', this, function () {
            this.stateController.loadingData(true);
        });

        Ext.getCmp('tabtrackanimator').store.on('beforeload', function () {
            this.stateController.loadingData(true);
        }, this);

        this.appPanel.mapPanel.staticflightlayer.events.register('loadend', this, function () {
            this.stateController.loadingData(false);
        });

        Ext.getCmp('tabtrackanimator').store.on('load', function () {
            this.stateController.loadingData(false);
        }, this);

        this.appPanel.mapPanel.on({
            'distancemeasurecomplete': function (measureObj) {
                var measureText = measureObj.measure.toFixed(3) + " " + measureObj.units;
                this.appPanel.mapPanel.drawDistanceMeasureControl.deactivate();
                this.appPanel.measureFeedbackPanel.show();
                this.appPanel.measureFeedbackPanel.alignTo(this.appPanel.mapPanel, 'tl-tl', [70, 10]);
                Ext.get('measure-read-out').dom.innerHTML = measureText;
                Ext.getCmp('measure-button').toggle(false);
            },
            'areameasurecomplete': function (measureObj) {
                var measureText = measureObj.measure.toFixed(3) + " " + measureObj.units + "<sup>2</" + "sup>";
                this.appPanel.mapPanel.drawAreaMeasureControl.deactivate();
                this.appPanel.measureFeedbackPanel.show();
                this.appPanel.measureFeedbackPanel.alignTo(this.appPanel.mapPanel, 'tl-tl', [70, 10]);
                Ext.get('measure-read-out').dom.innerHTML = measureText;
                Ext.getCmp('measure-button').toggle(false);
            },
            'mapclicked': function (e) {
                var loc = this.appPanel.mapPanel.map.getLonLatFromPixel(e.xy);
                FGI.data.GeoserverJsonP.request({
                    url: OpenNoms.config.URLs.ows,
                    callbackKey: 'format_options',
                    method: 'GET',
                    params: {
                        'viewparams': this.queryController.getAllParams() +
                        'x:' + loc.lon +
                        ';y:' + loc.lat + ';' +
                        //TODO: wire up rest of params
                        'airport:MSP\\,STP\\,FCM\\,NONE;optype:;',
                        'service': 'WFS',
                        'version': '1.0.0',
                        'request': 'GetFeature',
                        'typeName': 'opennoms:getclosesttrack',
                        'maxFeatures': '50',
                        'outputFormat': 'json'
                    },
                    success: function (responseObj) {
                        if (responseObj.features.length > 0) {
                            this.appPanel.mapPanel.selectedFlightTrackLayer.removeAllFeatures();
                            var feature = this.appPanel.mapPanel.wktFormat.read(responseObj.features[0].properties.wkt);
                            feature.attributes = responseObj.features[0].properties;
                            this.appPanel.mapPanel.selectedFlightTrackLayer.addFeatures([feature]);
                            Ext.getCmp('flight-info-region').update(responseObj.features[0].properties);
                            Ext.getCmp('noise-event-viewer').store.proxy.extraParams.viewparams = 'opnum:' + responseObj.features[0].properties.opnum;
                            Ext.getCmp('noise-event-viewer').store.load();
                        }
                    },
                    scope: this
                });
            },
            scope: this
        });
        this.appPanel.mapPanel.on({
            'mapready': function () {
                Ext.each(this.appPanel.mapPanel.map.layers, function (layer, index, allLayers) {
                    if (layer.showInLegend) {
                        var store = Ext.getCmp('legend-grid').store;
                        store.insert(0, { 'name': layer.name, 'layer': layer, 'isOn': layer.getVisibility() });
                        layer.events.on({
                            'visibilitychanged': function (e) {
                                var store = Ext.getCmp('legend-grid').store;
                                var index = store.findExact('layer', e.object);
                                if (index > -1) {
                                    var rec = store.getAt(index);
                                    if (rec.get('isOn') != layer.getVisibility()) {
                                        rec.set('isOn', layer.getVisibility());
                                        rec.commit();
                                    }
                                }
                            },
                            scope: this
                        });
                    }
                }, this);
                this.appPanel.mapPanel.noiseEventHoverControl.events.on({
                    'featurehighlighted': function (e) {
                        var view = Ext.getCmp('noise-event-viewer').view;
                        view.highlightItem(view.getNode(e.feature.record));
                    },
                    'featureunhighlighted': function (e) {
                        Ext.getCmp('noise-event-viewer').view.clearHighlight();
                    },
                    scope: this
                });
            },
            scope: this,
            single: true
        });

        this.appPanel.on({
            'afterlayout': function () {
                this.appPanel.mapPanel.mapReady();
            },
            scope: this,
            single: true
        });

        this.appPanel.on({
            'clearmeasureclicked': function (feature) {
                this.appPanel.measureFeedbackPanel.hide();
                this.appPanel.mapPanel.measureLayer.removeAllFeatures();
            },
            'refreshnoiseclicked': function () {
                this.appPanel.mapPanel.noiseEventLayer.removeAllFeatures();
                this.appPanel.mapPanel.selectedFlightTrackLayer.removeAllFeatures();
                Ext.getCmp('noise-event-viewer').store.removeAll();
                Ext.getCmp('flight-info-region').update({ opnum: 'no flight' });
            },
            'afterlayout': function () {
                this.appPanel.mapPanel.map.updateSize();
                this.appPanel.mapPanel.map.baseLayer.redraw();
            },
            scope: this
        });

        Ext.getCmp('noise-event-viewer').store.on({
            'load': function (store, records, success, operation, opts) {
                this.appPanel.noiseButton.query('button')[0].toggle(true);
                var features = [];
                this.appPanel.mapPanel.noiseEventLayer.removeAllFeatures();
                Ext.each(records, function (record, index, allRecords) {
                    var feature = this.appPanel.mapPanel.wktFormat.read(record.get('wkt'));
                    feature.attributes = record.data;
                    features.push(feature);
                    feature.record = record;
                    record.feature = feature;
                }, this);
                this.appPanel.mapPanel.noiseEventLayer.addFeatures(features);
            },
            scope: this
        });

        Ext.getCmp('noise-event-viewer').on({
            'itemmouseenter': function (view, record, item) {
                this.appPanel.mapPanel.noiseEventHoverControl.select(record.feature);
            },
            'itemmouseleave': function (view, record, item) {
                this.appPanel.mapPanel.noiseEventHoverControl.unselect(record.feature);
            },
            scope: this
        });

        Ext.getCmp('legend-grid').on({
            'checkchange': function (grid, index, checked) {
                var layer = grid.store.getAt(index).get('layer');
                if (checked != layer.getVisibility()) {
                    layer.setVisibility(checked);
                }
            },
            scope: this
        });

        Ext.getCmp('find-address-combo').on({
            'select': function (combo, records, opts) {
                var geom = new OpenLayers.Geometry.Point(records[0].get('x'), records[0].get('y'));
                var feature = new OpenLayers.Feature.Vector(geom, records[0].data);
                var loc = new OpenLayers.LonLat(records[0].get('x'), records[0].get('y'));
                this.appPanel.mapPanel.addressSearchLayer.removeAllFeatures();
                this.appPanel.mapPanel.addressSearchLayer.addFeatures([feature]);
                this.appPanel.mapPanel.map.setCenter(loc, 5);
            },
            scope: this
        });

        Ext.getCmp('display-type-combo').on({
            'select': function (combo, records, opts) {
                var value = records[0].get('value');
                Ext.each(this.appPanel.mapPanel.animatedFlightTracks.styleMap.styles["default"].rules, function (rule, index, allRules) {
                    rule.symbolizer.Point.label = '${' + value + '}';
                }, this);
                this.appPanel.mapPanel.animatedFlightTracks.redraw();
            },
            scope: this
        });

        this.viewport.doLayout();
    },

    /*
    * load the data into the app
    */
    loadData: function () {
        Ext.getCmp('select-flights').store.load({
            scope: this,
            callback: function () {
                this.updateAppFromConfig();
            }
        });
    },

    initControllers: function () {

    },

    updateAppFromConfig: function () {
        var filters = OpenNoms.config.AppConfig.filter.split(',');
        Ext.each(filters, function (item, index, allItems) {
            if (item != "") {
                var recordIndex = Ext.getCmp('select-flights').store.findExact('value', item);
                if (recordIndex > -1) {
                    var rec = Ext.getCmp('select-flights').store.getAt(recordIndex);
                    rec.set('ischecked', false);
                    rec.commit();
                }
            }
        }, this);
        this.queryController.updateLayerWithNewParams(this.appPanel.mapPanel.staticflightlayer);
        this.appPanel.mapPanel.staticflightlayer.setVisibility(true);

        if (this.stateController.state != OpenNoms.config.AppConfig.state) {
            this.stateController.changeState(OpenNoms.config.AppConfig.state);
        }
    },

    showApp: function () {
        this.viewport.layout.setActiveItem(1);
    },

    getLinkURL: function () {
        var filters = '';
        Ext.getCmp('select-flights').store.data.each(function (item, index, allItems) {
            if (!item.get('ischecked')) {
                if (filters == '') {
                    filters = item.get('value');
                } else {
                    filters = filters + ',' + item.get('value');
                }
            }
        }, this);
        var newAppConfig = {
            extent: this.appPanel.mapPanel.map.getExtent().toString(),
            state: this.stateController.state,
            date: Ext.getCmp('flighttrackstartdatepicker').getValue().getTime(),
            time: Ext.getCmp('flighttrackstarttimepicker').getRawValue(),
            length: Ext.getCmp('staticlengthcombo').getValue(),
            truncate: Ext.getCmp('truncate-flight-tracks-checkbox').getValue(),
            display: Ext.getCmp('display-type-combo').getValue(),
            speed: Ext.getCmp('animationspeedcombo').getValue(),
            basemap: this.appPanel.mapPanel.tmsbase.getVisibility(),
            aerial: this.appPanel.mapPanel.ortho.getVisibility(),
            contours: this.appPanel.mapPanel.tmscontours.getVisibility(),
            rmts: this.appPanel.mapPanel.tmsrmts.getVisibility(),
            filter: filters
        };
        var queryString = '?' + Ext.Object.toQueryString(newAppConfig);
        var url = window.location.protocol + "//" + window.location.host + (window.location.port != "" ? ":" + window.location.port : "") + window.location.pathname + queryString;

        return url;
    }
};
