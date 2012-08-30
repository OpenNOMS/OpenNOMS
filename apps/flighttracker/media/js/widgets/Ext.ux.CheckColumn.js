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

/**
* @class Ext.ux.CheckColumn
* @extends Ext.grid.column.Column
* <p>A Header subclass which renders a checkbox in each column cell which toggles the truthiness of the associated data field on click.</p>
* <p><b>Note. As of ExtJS 3.3 this no longer has to be configured as a plugin of the GridPanel.</b></p>
* <p>Example usage:</p>
* <pre><code>
// create the grid
var grid = Ext.create('Ext.grid.Panel', {
...
columns: [{
text: 'Foo',
...
},{
xtype: 'checkcolumn',
text: 'Indoor?',
dataIndex: 'indoor',
width: 55
}
]
...
});
* </code></pre>
* In addition to toggling a Boolean value within the record data, this
* class adds or removes a css class <tt>'x-grid-checked'</tt> on the td
* based on whether or not it is checked to alter the background image used
* for a column.
*/
Ext.define('Ext.ux.CheckColumn', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.checkcolumn',

    constructor: function () {
        this.addEvents(
        /**
        * @event checkchange
        * Fires when the checked state of a row changes
        * @param {Ext.ux.CheckColumn} this
        * @param {Number} rowIndex The row index
        * @param {Boolean} checked True if the box is checked
        */
            'checkchange'
        );
        this.callParent(arguments);
    },

    /**
    * @private
    * Process and refire events routed from the GridView's processEvent method.
    */
    processEvent: function (type, view, cell, recordIndex, cellIndex, e) {
        if (type == 'mousedown' || (type == 'keydown' && (e.getKey() == e.ENTER || e.getKey() == e.SPACE))) {
            var record = view.panel.store.getAt(recordIndex),
                dataIndex = this.dataIndex,
                checked = !record.get(dataIndex);

            record.set(dataIndex, checked);
            this.fireEvent('checkchange', this, recordIndex, checked);
            // cancel selection.
            return false;
        } else {
            return this.callParent(arguments);
        }
    },

    // Note: class names are not placed on the prototype bc renderer scope
    // is not in the header.
    renderer: function (value) {

        var cssPrefix = Ext.baseCSSPrefix;
        var cls = [cssPrefix + 'grid-checkheader'];

        var res = '<div class="' + cssPrefix + 'form-checkbox' + '">&nbsp;</div>' //&#160;

        if (value)
            cls.push(cssPrefix + 'form-cb-checked');

        res = '<div class="' + cls.join(' ') + '">' + res + '</div>';

        return res;
    }
});