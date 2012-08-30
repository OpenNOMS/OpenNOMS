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

var yesterday = new Date();
yesterday.setDate(new Date().getDate() - 1);
Ext.namespace('OpenNoms.config');
OpenNoms.config.AppConfig = {
    // Default map extent
    extent: "472468,4963602,491908,4975474",
    // Default app state
    state: 'static',
    // start date
    date: yesterday.getTime(),
    // start time
    time: '1:00 PM',
    // default length
    length: 600000,
    // truncate tracks?
    truncate: false,
    // default display type
    display: 'altitude',
    // default speed
    speed: 10,
    // display filters
    filter: '',
    // layer visibility
    basemap: true,
    aerial: false,
    contours: false,
    rmts: false
};