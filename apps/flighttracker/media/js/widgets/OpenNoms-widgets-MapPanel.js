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

Ext.define('OpenNoms.widgets.MapPanel', {
    extend: 'FGI.widgets.MapPanel',
    alias: 'widgets.opennoms-widgets-mappanel',

    id: 'map-panel',
    region: 'center',
    border: true,
    displaySystem: 'english',

    initComponent: function () {
        this.addEvents({
            'distancemeasurecomplete': true,
            'areameasurecomplete': true,
            'mapready': true,
            'mapclicked': true
        });

        this.wktFormat = new OpenLayers.Format.WKT();

        this.supportedProjections = {
            geographic: new OpenLayers.Projection("EPSG:4326"),
            mercator: new OpenLayers.Projection("EPSG:900913"),
            utm: new OpenLayers.Projection("EPSG:26915"),
        };

        this.map = new OpenLayers.Map('map', {
            controls: [
	            new OpenLayers.Control.Navigation({ zoomWheelEnabled: false })
	        ],
            center: new OpenLayers.LonLat(482188, 4969538),
            maxExtent: new OpenLayers.Bounds(411482, 4900449, 552143, 5041149),
            projection: this.supportedProjections.utm,
            displayProjection: this.supportedProjections.geographic,
            resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1],
            tileSize: new OpenLayers.Size(512, 512),
            allOverlays: true,
            units: 'm'
        });

        this.bbar = Ext.create('Ext.toolbar.Toolbar', {
            items: [
                '<span style="padding-left:15px;font-size:14px;color:black;">Current Zoom Level: <span id="zoom-level" style="padding-right:20px">0</span></span>',
                '<span style="padding-left:20px;font-size:14px;color:black;">Cursor Position: <span id="cursor-position"></span></span>',
                '->',
                new Ext.Component({
                    html: '<div id="scale-area" style="float:right; padding-right: 15px;"></div>',
                    width: 200
                })
            ],
            height: 34
        });

        this.callParent(arguments);

        //layer to display LMIC aerial photography WMS
        this.ortho = new OpenLayers.Layer.WMS("Aerial Photography", OpenNoms.config.URLs.aerial, {
            layers:'nga2008,fsa2009'
        },{
            tileSize:new OpenLayers.Size(512,512),
            projection:this.supportedProjections.utm, 
            maxExtent:new OpenLayers.Bounds(411482,4900449,552143,5041149), 
            maxResolution:274.8046875, 
            opacity:0.7,
            buffer:0,
            visibility: OpenNoms.config.AppConfig.aerial,
            showInLegend: true
        });

        //tiled version of MAC base layers from MapProxy
        this.tmsbase = new OpenLayers.Layer.TMS('Base Map', OpenNoms.config.URLs.tms, { 
            layername: 'base_EPSG26915', 
            type: 'png', 
            tileSize: new OpenLayers.Size(512, 512), 
            opacity: 0.7, 
            buffer: 0,
            showInLegend: true,
            visibility: OpenNoms.config.AppConfig.basemap
        });

        
        //tiled version of contours from MapProxy
        this.tmscontours = new OpenLayers.Layer.TMS(
	        "2007 Forecast Year Mitigated DNL Contours",
	        OpenNoms.config.URLs.tms,
	        {
                layername:'contours_EPSG26915',
                type:'png',
                tileSize:new OpenLayers.Size(512,512),
                opacity:0.7,
                buffer:0,
                showInLegend: true,
                visibility: OpenNoms.config.AppConfig.contours
	        }
        );

        //tiled version of RMTS from MapProxy
        this.tmsrmts = new OpenLayers.Layer.TMS(
	        "Remote Monitoring Towers",
	        OpenNoms.config.URLs.tms,
	        {
                layername:'rmts_EPSG26915',
                type:'png',
                tileSize:new OpenLayers.Size(512,512),
                opacity:0.7,
                buffer:0,
                showInLegend: true,
                visibility: OpenNoms.config.AppConfig.rmts
	        }
        );

 
        //static flight track layer
        this.staticflightlayer = new OpenLayers.Layer.WMS("Static Flight Tracks", OpenNoms.config.URLs.wms, { 
            layers: 'opennoms:macnoise', 
            transparent: "true", 
            isodate: '2000-1-1' 
        },{ 
            singleTile: true, 
            projection: this.supportedProjections.utm, 
            maxExtent: new OpenLayers.Bounds(411482, 4900449, 552143, 5041149), 
            maxResolution: 274.8046875, 
            opacity: 0.6, 
            displayInLayerSwitcher: false,
            visibility: false

        });

          
        //style to be used for display of replay tracks and real time points
        this.animatedFlightTrackStyle = new OpenLayers.Style(null, {
            rules: [
                new OpenLayers.Rule({
                    symbolizer: {
                        "Point": {
                            pointRadius: 12,
                            graphicName: "circle",
                            //rotation: "${heading}",
                            fillColor: "white",
                            fillOpacity: 1,
                            strokeWidth: 2,
                            strokeOpacity: 1,
                            strokeColor: "#666600",
			                label: "${altitude}",
			                labelYOffset: 15,
			                externalGraphic: OpenNoms.config.URLs.planeIcons + "airplane_blue${heading}.png"
                        },
                        "Line": {
                            strokeWidth: 1,
                            strokeOpacity: 0.5,
                            strokeColor: "#333333"
                        }
                    }
                }),
                new OpenLayers.Rule({
                    filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "adflag",
                        value: "A"
                    }),
                    symbolizer: {
                        "Point": {
                            externalGraphic: OpenNoms.config.URLs.planeIcons + "airplane_red${heading}.png"
                        }
                    }
                }),
                new OpenLayers.Rule({
                    filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "adflag",
                        value: "D"
                    }),
                    symbolizer: {
                        "Point": {
                            externalGraphic: OpenNoms.config.URLs.planeIcons + "airplane_green${heading}.png"
                        }
                    }
                })
            ]
        });

        this.animatedFlightTracks = new OpenLayers.Layer.Vector("Replay Flight Tracks" , {
            styleMap: new OpenLayers.StyleMap({"default":this.animatedFlightTrackStyle}),
            displayInLayerSwitcher: false
        });


        this.zoomPanel = Ext.create('Ext.panel.Panel', {
            frame: true,
            bodyStyle: 'padding-top:3px;padding-left:8px;',
            floating: true,
            width: 49,
            height: 200,
            layout: 'fit',
            items: [{
                xtype: 'slider',
                id: 'zoom-slider',
                hideLabel: true,
                tipText: function(thumb){
                    return Ext.String.format('<b>Zoom Level: {0}</b>', thumb.value);
                },
                vertical: true,
                minValue: 0,
                maxValue: 11,
                listeners: {
                    'change': function (cmp, value) {
                        this.map.zoomTo(value);
                    },
                    scope: this
                }
            }]
        });

        this.zoomPanel.show();

        this.on({
            'afterlayout': function () {
                this.zoomPanel.alignTo(this, 'tl-tl', [10, 10]);
            },
            scope: this
        });

        this.doLayout();

    },

    mapReady: function () {
        this.map.updateSize();

        var measureStyle = OpenLayers.Util.applyDefaults({
            strokeColor: "#808080",
            strokeOpacity: 1,
            strokeWidth: 3,
            strokeDashstyle: 'dash',
            fillOpacity: 0.1,
            fillColor: "#808080",
            pointRadius: 4,
            graphicName: 'x'
        }, OpenLayers.Feature.Vector.style["default"]);

        this.measureLayer = new OpenLayers.Layer.Vector(
            "MeasureLayer", {
                style: measureStyle
            }
        );

        var noiseEventStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                strokeColor: "#FFFF00",
                strokeOpacity: 1,
                strokeWidth: 4,
                pointRadius: 10,
                graphicName: 'circle',
                fillOpacity: 0,
                labelAlign: 'cb',
                labelYOffset: 15,
                label: "${lmax}",
                fontWeight: 'normal'
            }),
            "select": new OpenLayers.Style({
                fillColor: "#66ccff",
                strokeColor: "#3399ff",
                strokeOpacity: 1,
                strokeWidth: 4,
                pointRadius: 10,
                graphicName: 'circle',
                fillOpacity: 0.2,
                labelAlign: 'cb',
                labelYOffset: 15,
                label: "${lmax}",
                fontWeight: 'bold'
            })
        });

        this.noiseEventLayer = new OpenLayers.Layer.Vector(
            "NoiseEventLayer", {
                styleMap: noiseEventStyle
            }
        );

        var selectedFlightTrackStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                strokeColor: "#FFFF00",
                strokeOpacity: 1,
                strokeWidth: 4,
            })
        });

        this.selectedFlightTrackLayer = new OpenLayers.Layer.Vector(
            "SelectedFlightTrackLayer", {
                styleMap: selectedFlightTrackStyle
            }
        );

        var addressSearchStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                externalGraphic: 'media/images/SearchResult.png',
                graphicWidth: 32,
                graphicHeight: 37,
                graphicOpacity: 1,
                graphicXOffset: -16,
                graphicYOffset: -37,
                backgroundGraphic: 'media/images/shadow.png',
                backgroundXOffset: -16,
                backgroundYOffset: -37,
                backgroundHeight: 37,
                backgroundWidth: 51
            })
        });

        this.addressSearchLayer = new OpenLayers.Layer.Vector(
            "AddressSearchLayer", {
                styleMap: addressSearchStyle
            }
        );

        this.map.addLayers([this.ortho, this.tmsbase, this.tmscontours, this.tmsrmts, this.staticflightlayer, this.animatedFlightTracks, this.selectedFlightTrackLayer, this.noiseEventLayer, this.addressSearchLayer, this.measureLayer]);

        this.noiseEventHoverControl = new OpenLayers.Control.SelectFeature(this.noiseEventLayer, {
            multiple: false, 
            hover: true
        });

        this.map.addControls([this.noiseEventHoverControl]);

        this.noiseEventHoverControl.activate();

        this.drawDistanceMeasureControl = new OpenLayers.Control.DrawFeature(this.measureLayer,
            OpenLayers.Handler.Path, {
                handlerOptions: {
                    style: measureStyle
                },
                eventListeners: {
                    "featureadded": function (e) {
                        this.fireEvent('distancemeasurecomplete', this.measure(e.feature.geometry));
                    },
                    scope: this
                }
            }
        );

        this.drawAreaMeasureControl = new OpenLayers.Control.DrawFeature(this.measureLayer,
            OpenLayers.Handler.Polygon, {
                handlerOptions: {
                    style: measureStyle
                },
                eventListeners: {
                    "featureadded": function (e) {
                        this.fireEvent('areameasurecomplete', this.measure(e.feature.geometry));
                    },
                    scope: this
                }
            }
        );

        this.map.addControls([this.drawAreaMeasureControl, this.drawDistanceMeasureControl]);

        this.clickControl = new OpenLayers.Control({
            handler: new OpenLayers.Handler.Click(
                this, {
                    'click': function(e) {
                        this.fireEvent('mapclicked', e);
                    }
                }, {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                })
        });

        this.map.addControl(this.clickControl);
        this.clickControl.activate();

        this.mousePosition = new OpenLayers.Control.MousePosition({
            element: Ext.get('cursor-position').dom,
            displayProjection: this.supportedProjections.geographic
        });

        this.map.addControl(this.mousePosition);

        this.map.addControl(new OpenLayers.Control.ScaleLine({
            div: Ext.get('scale-area').dom
        }));

        this.map.events.register("zoomend", this, function (event) {
            var zoom = this.map.getZoom();
            Ext.get('zoom-level').dom.innerHTML = zoom;
            var zoomSlider = Ext.getCmp('zoom-slider');
            if (zoomSlider.getValue() != zoom) {
                zoomSlider.setValue(zoom);
            }
            this.doLayout();
        });

        this.map.zoomToExtent(new OpenLayers.Bounds(OpenNoms.config.AppConfig.extent.split(',')));

        this.doLayout();

        this.fireEvent('mapready', this);
    }
});