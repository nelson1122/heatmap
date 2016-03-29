/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Renderer.js
 * @requires OpenLayers/RTree.js
 */

/**
 * Class: OpenLayers.Renderer.Canvas 
 * A renderer based on the 2D 'canvas' drawing element.element
 * 
 * Inherits:
 *  - <OpenLayers.Renderer>
 */
OpenLayers.Renderer.Canvas = OpenLayers.Class(OpenLayers.Renderer, {

    /**
     * Property: canvas
     * {Canvas} The canvas context object.
     */
    canvas: null, 
    
    /**
     * Property: features
     * {Object} Internal object of feature/style pairs for use in redrawing the layer.
     */
    features: null, 
    
    /**
     * Property: featuresOrdered
     * {Array} Keeps the features in the order they should be drawn in.
     */
    featuresOrdered: null,
    
    /**
     * Property: mode
     * {OpenLayers.Renderer.Canvas.MODE} Default is OpenLayers.Renderer.Canvas.MODE.INTERACTIVE
     */
    mode: null,
    
    /**
     * Property: rtreeMaxNodeWidth
     * {Integer} Property of the R-Tree (maximum size of a node).
     */
    rtreeMaxNodeWidth: undefined,

    /**
     * Property: rtree
     * {OpenLayers.RTree} R-Tree instance. Used to speed-up
     *      getFeatureIdFromEvent() and redraw().
     */
    rtree: null,
 
    /**
     * Constructor: OpenLayers.Renderer.Canvas
     *
     * Parameters:
     * containerID - {<String>} 
     * options - {Object} Hashtable of extra options to tag onto the renderer. Valid keys
     *      are 'useRTree' and 'rtreeMaxNodeWidth'.
     */
    initialize: function(containerID, options) {
        OpenLayers.Renderer.prototype.initialize.apply(this, arguments);
        this.root = document.createElement("canvas");
        this.container.appendChild(this.root);
        this.canvas = this.root.getContext("2d");
        this.features = {};
        this.featuresOrdered = [];
        
        // get renderer options
        OpenLayers.Util.extend(this, options);
        
        if (this.mode === null) {
            this.mode = OpenLayers.Renderer.Canvas.MODE.INTERACTIVE;
        }
        
        if (this.mode === OpenLayers.Renderer.Canvas.MODE.RTREE) {
            this.rtree = new OpenLayers.RTree(this.rtreeMaxNodeWidth);
        }
    },
    
    /** 
     * Method: eraseGeometry
     * Erase a geometry from the renderer. Because the Canvas renderer has
     *     'memory' of the features that it has drawn, we have to remove the
     *     feature so it doesn't redraw.   
     * 
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     * featureId - {String}
     */
    eraseGeometry: function(geometry, featureId) {
        this.eraseFeatures(this.features[featureId][0]);
    },

    /**
     * APIMethod: supported
     * 
     * Returns:
     * {Boolean} Whether or not the browser supports the renderer class
     */
    supported: function() {
        var canvas = document.createElement("canvas");
        return !!canvas.getContext;
    },    
    
    /**
     * Method: setExtent
     * Set the visible part of the layer.
     *
     * Resolution has probably changed, so we nullify the resolution 
     * cache (this.resolution), then redraw. 
     *
     * Parameters:
     * extent - {<OpenLayers.Bounds>} 
     */
    setExtent: function(extent, zoomChanged) {
        this.extent = extent.clone();
        this.resolution = null;
        
        if (!zoomChanged) {
            // only redraw if we are not zooming
            // when zooming, the features will be redrawn later one by one
            // see OpenLayers.Layer.Vector.moveTo()
            this.redraw();
        }
        
        return true;
    },
    
    /**
     * Method: setSize
     * Sets the size of the drawing surface.
     *
     * Once the size is updated, redraw the canvas.
     *
     * Parameters:
     * size - {<OpenLayers.Size>} 
     */
    setSize: function(size) {
        this.size = size.clone();
        this.root.style.width = size.w + "px";
        this.root.style.height = size.h + "px";
        this.root.width = size.w;
        this.root.height = size.h;
        this.resolution = null;
    },
    
    /**
     * Method: drawFeature
     * Draw the feature. Stores the feature in the features list,
     * then redraws the layer. 
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} 
     * style - {<Object>} 
     */
    drawFeature: function(feature, style) {
        style = style || feature.style;
        style = this.applyDefaultSymbolizer(style);  

        if (feature.geometry) { 
            if (this.mode === OpenLayers.Renderer.Canvas.MODE.RTREE) {
                this.rtree.insert(feature);
            }
        } 
       
        // remember the order in which the features are added, so
        // that this could be taken into account when redrawing
        this.addToOrderedList(feature);
        
        this.features[feature.id] = [feature, style]; 
        
        this.redraw();
        
        return true;
    },


    /** 
     * Method: drawGeometry
     * Used when looping (in redraw) over the features; draws
     * the canvas. 
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} 
     * style - {Object} 
     */
    drawGeometry: function(geometry, style) {
        var className = geometry.CLASS_NAME;
        if ((className == "OpenLayers.Geometry.Collection") ||
            (className == "OpenLayers.Geometry.MultiPoint") ||
            (className == "OpenLayers.Geometry.MultiLineString") ||
            (className == "OpenLayers.Geometry.MultiPolygon")) {
            for (var i = 0; i < geometry.components.length; i++) {
                this.drawGeometry(geometry.components[i], style);
            }
            return;
        }
        switch (geometry.CLASS_NAME) {
            case "OpenLayers.Geometry.Point":
                this.drawPoint(geometry, style);
                break;
            case "OpenLayers.Geometry.LineString":
                this.drawLineString(geometry, style);
                break;
            case "OpenLayers.Geometry.LinearRing":
                this.drawLinearRing(geometry, style);
                break;
            case "OpenLayers.Geometry.Polygon":
                this.drawPolygon(geometry, style);
                break;
            default:
                break;
        }
    },

    /**
     * Method: drawExternalGraphic
     * Called to draw External graphics. 
     * 
     * Parameters: 
     * geometry - {<OpenLayers.Geometry>}
     * style    - {Object}
     */ 
    drawExternalGraphic: function(pt, style) {
       var img = new Image();
       img.src = style.externalGraphic;
       
       if(style.graphicTitle) {
           img.title=style.graphicTitle;           
       }

       var width = style.graphicWidth || style.graphicHeight;
       var height = style.graphicHeight || style.graphicWidth;
       width = width ? width : style.pointRadius*2;
       height = height ? height : style.pointRadius*2;
       var xOffset = (style.graphicXOffset != undefined) ?
           style.graphicXOffset : -(0.5 * width);
       var yOffset = (style.graphicYOffset != undefined) ?
           style.graphicYOffset : -(0.5 * height);
       var opacity = style.graphicOpacity || style.fillOpacity;
       
       var context = { img: img, 
                       x: (pt[0]+xOffset), 
                       y: (pt[1]+yOffset), 
                       width: width, 
                       height: height, 
                       canvas: this.canvas };

       img.onload = OpenLayers.Function.bind( function() {
           this.canvas.drawImage(this.img, this.x, 
                                 this.y, this.width, this.height);
       }, context);   
    },

    /**
     * Method: setCanvasStyle
     * Prepare the canvas for drawing by setting various global settings.
     *
     * Parameters:
     * type - {String} one of 'stroke', 'fill', or 'reset'
     * style - {Object} Symbolizer hash
     */
    setCanvasStyle: function(type, style) {
        if (type == "fill") {     
            this.canvas.globalAlpha = style['fillOpacity'];
            this.canvas.fillStyle = style['fillColor'];
        } else if (type == "stroke") {  
            this.canvas.globalAlpha = style['strokeOpacity'];
            this.canvas.strokeStyle = style['strokeColor'];
            this.canvas.lineWidth = style['strokeWidth'];
        } else {
            this.canvas.globalAlpha = 0;
            this.canvas.lineWidth = 1;
        }
    },

    /**
     * Method: drawPoint
     * This method is only called by the renderer itself.
     * 
     * Parameters: 
     * geometry - {<OpenLayers.Geometry>}
     * style    - {Object}
     */ 
    drawPoint: function(geometry, style) {
        if(style.graphic !== false) {
            var pt = this.getLocalXY(geometry);
            
            if (style.externalGraphic) {
                this.drawExternalGraphic(pt, style);
            } else {
                if(style.fill !== false) {
                    this.setCanvasStyle("fill", style);
                    this.canvas.beginPath();
                    this.canvas.arc(pt[0], pt[1], style.pointRadius, 0, Math.PI*2, true);
                    this.canvas.fill();
                }
                
                if(style.stroke !== false) {
                    this.setCanvasStyle("stroke", style);
                    this.canvas.beginPath();
                    this.canvas.arc(pt[0], pt[1], style.pointRadius, 0, Math.PI*2, true);
                    this.canvas.stroke();
                    this.setCanvasStyle("reset");
                }
            }
        }
    },

    /**
     * Method: drawLineString
     * This method is only called by the renderer itself.
     * 
     * Parameters: 
     * geometry - {<OpenLayers.Geometry>}
     * style    - {Object}
     */ 
    drawLineString: function(geometry, style) {
        if(style.stroke !== false) {
            this.setCanvasStyle("stroke", style);
            this.canvas.beginPath();
            var start = this.getLocalXY(geometry.components[0]);
            this.canvas.moveTo(start[0], start[1]);
            for(var i = 1; i < geometry.components.length; i++) {
                var pt = this.getLocalXY(geometry.components[i]);
                this.canvas.lineTo(pt[0], pt[1]);
            }
            this.canvas.stroke();
        }
        this.setCanvasStyle("reset");
    },    
    
    /**
     * Method: drawLinearRing
     * This method is only called by the renderer itself.
     * 
     * Parameters: 
     * geometry - {<OpenLayers.Geometry>}
     * style    - {Object}
     */ 
    drawLinearRing: function(geometry, style) {
        if(style.fill !== false) {
            this.setCanvasStyle("fill", style);
            this.canvas.beginPath();
            var start = this.getLocalXY(geometry.components[0]);
            this.canvas.moveTo(start[0], start[1]);
            for(var i = 1; i < geometry.components.length - 1 ; i++) {
                var pt = this.getLocalXY(geometry.components[i]);
                this.canvas.lineTo(pt[0], pt[1]);
            }
            this.canvas.fill();
        }
        
        if(style.stroke !== false) {
            this.setCanvasStyle("stroke", style);
            this.canvas.beginPath();
            var start = this.getLocalXY(geometry.components[0]);
            this.canvas.moveTo(start[0], start[1]);
            for(var i = 1; i < geometry.components.length; i++) {
                var pt = this.getLocalXY(geometry.components[i]);
                this.canvas.lineTo(pt[0], pt[1]);
            }
            this.canvas.stroke();
        }
        this.setCanvasStyle("reset");
    },    
    
    /**
     * Method: drawPolygon
     * This method is only called by the renderer itself.
     * 
     * Parameters: 
     * geometry - {<OpenLayers.Geometry>}
     * style    - {Object}
     */ 
    drawPolygon: function(geometry, style) {
        this.drawLinearRing(geometry.components[0], style);
        for (var i = 1; i < geometry.components.length; i++) {
            this.drawLinearRing(geometry.components[i], {
                fillOpacity: 0, 
                strokeWidth: 0, 
                strokeOpacity: 0, 
                strokeColor: '#000000', 
                fillColor: '#000000'}
            ); // inner rings are 'empty'  
        }
    },
    
    /**
     * Method: drawText
     * This method is only called by the renderer itself.
     *
     * Parameters:
     * location - {<OpenLayers.Point>}
     * style    - {Object}
     */
    drawText: function(location, style) {
        style = OpenLayers.Util.extend({
            fontColor: "#000000",
            labelAlign: "cm"
        }, style);
        var pt = this.getLocalXY(location);
        
        this.setCanvasStyle("reset");
        this.canvas.fillStyle = style.fontColor;
        this.canvas.globalAlpha = style.fontOpacity || 1.0;
        var fontStyle = style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
        if (this.canvas.fillText) {
            // HTML5
            var labelAlign =
                OpenLayers.Renderer.Canvas.LABEL_ALIGN[style.labelAlign[0]] ||
                "center";
            this.canvas.font = fontStyle;
            this.canvas.textAlign = labelAlign;
            this.canvas.fillText(style.label, pt[0], pt[1]);
        } else if (this.canvas.mozDrawText) {
            // Mozilla pre-Gecko1.9.1 (<FF3.1)
            this.canvas.mozTextStyle = fontStyle;
            // No built-in text alignment, so we measure and adjust the position
            var len = this.canvas.mozMeasureText(style.label);
            switch(style.labelAlign[0]) {
                case "l":
                    break;
                case "r":
                    pt[0] -= len;
                    break;
                case "c":
                default:
                    pt[0] -= len / 2;
            }
            this.canvas.translate(pt[0], pt[1]);
            
            this.canvas.mozDrawText(style.label);
            this.canvas.translate(-1*pt[0], -1*pt[1]);
        }
        this.setCanvasStyle("reset");
    },

    /**
     * Method: getLocalXY
     * transform geographic xy into pixel xy
     *
     * Parameters: 
     * point - {<OpenLayers.Geometry.Point>}
     */
    getLocalXY: function(point) {
        var resolution = this.getResolution();
        var extent = this.extent;
        var x = (point.x / resolution + (-extent.left / resolution));
        var y = ((extent.top / resolution) - point.y / resolution);
        return [x, y];
    },
        
    /**
     * Method: clear
     * Clear all vectors from the renderer.
     * virtual function.
     */    
    clear: function() {
        this.canvas.clearRect(0, 0, this.root.width, this.root.height);
    },

    /**
     * Method: getFeatureIdFromEvent
     * Returns a feature id from an event on the renderer. 
     * 
     * Parameters:
     * evt - {<OpenLayers.Event>} 
     *
     * Returns:
     * {String} A feature id or null.
     */
    getFeatureIdFromEvent: function(evt) {
        var loc = this.map.getLonLatFromPixel(evt.xy);
        var resolution = this.getResolution();
        var bounds = new OpenLayers.Bounds(loc.lon - resolution * 5, 
                                           loc.lat - resolution * 5, 
                                           loc.lon + resolution * 5, 
                                           loc.lat + resolution * 5);
        var geom = bounds.toGeometry();
        geom.bounds = bounds; // cache the bounds
        
        if (this.mode === OpenLayers.Renderer.Canvas.MODE.RTREE) {
            return this.getFeatureIdFromRTree(geom);
        } else {
            return this.getFeatureId(geom);
        }
    },
    
    /**
     * Method: getFeatureIdFromRTree
     * Returns a feature id for the first feature that intersects the
     * passed-in geometry. 
     * 
     * The R-Tree is used to query all features whose MBR's intersect 
     * the search geometry. Then an accurate intersection test is run for 
     * these features taking the drawing order into account. The drawing
     * order is important, otherwise the sketching vertices (when editing
     * features) might not be found.
     * 
     * Parameters:
     * searchGeometry - {<OpenLayers.Geometry>} 
     * 
     * Returns:
     * {String} The feature's id which intersects searchGeometry
     */
    getFeatureIdFromRTree: function(searchGeometry) {
        var featuresMBR = this.rtree.search(searchGeometry.getBounds());
        
        if (featuresMBR.length <= 0) {
            // nothing found, quit
            return null;
        }
        
        // create a lookup table for the queried features, so that they can be accessed faster
        var featuresLookup = this.getAsDict(featuresMBR);
        var featureCount = featuresMBR.length;
        
        var feature = null;
        for (var i = this.featuresOrdered.length - 1; i >= 0; i--) {
            feature = this.featuresOrdered[i];
            
            if (featuresLookup.hasOwnProperty(feature.id)) {
                // if the feature is part of the R-Tree search, run 
                // an exact intersection test
                if (feature.geometry.intersects(searchGeometry)) {
                    return feature.id;
                } else {
                    featureCount--;
                    
                    if (featureCount === 0) {
                        // we checked all features from the R-Tree search, stop
                        return null;
                    }
                }
            }
        }
        
        return null;        
    },
    
    /**
     * Method: getFeatureId
     * Returns a feature id for the first feature that intersects the
     * passed-in geometry. 
     * 
     * If no R-Tree is used, a (slow) intersection test is run for 
     * every feature.
     * 
     * Parameters:
     * searchGeometry - {<OpenLayers.Geometry>} 
     * 
     * Returns:
     * {String} The feature's id which intersects searchGeometry
     */
    getFeatureId: function(searchGeometry) {
        var feature = null;
        // start at the end, because those features are on top
        for (var i = this.featuresOrdered.length - 1; i >= 0; i--) {
            feature = this.featuresOrdered[i];
            
            if (feature.geometry.getBounds().intersectsBounds(searchGeometry.getBounds()) &&
                feature.geometry.intersects(searchGeometry)) {
                return feature.id;
            }
        }
        
        return null;
    },
    
    /**
     * Method: eraseFeatures 
     * This is called by the layer to erase features; removes the feature from
     *     the list, then redraws the layer.
     * 
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector>)} 
     */
    eraseFeatures: function(features) {
        if(!(features instanceof Array)) {
            features = [features];
        }
        var feature = null;
        for(var i=0; i<features.length; ++i) {
            feature = features[i];
            if ((this.mode === OpenLayers.Renderer.Canvas.MODE.RTREE) && this.features.hasOwnProperty(feature.id)) {
                this.rtree.remove(this.features[feature.id][0]);
            }
            this.removeFromOrderedList(feature);
            delete this.features[feature.id];
        }
        this.redraw();
    },

    /**
     * Method: redraw
     * The real 'meat' of the function: any time things have changed,
     *     redraw() can be called to loop over all the data and (you guessed
     *     it) redraw it.  Unlike Elements-based Renderers, we can't interact
     *     with things once they're drawn, to remove them, for example, so
     *     instead we have to just clear everything and draw from scratch.
     *     
     *     For MODE.RTREE we query the features that are inside the
     *     current extent and then only draw those.
     *     For MODE.INTERACTICE we only draw the features whose bounding-box
     *     intersects the extent.
     *     For MODE.STATIC all features are drawn no matter if they are
     *     actually inside the current extent or not.
     */
    redraw: function() {
        if (!this.locked) {
            this.clear();
            var labelMap = [];
            
            if (this.mode === OpenLayers.Renderer.Canvas.MODE.RTREE) {
                this.redrawFeaturesUsingRTree(labelMap);
            } else {
                this.redrawFeatures(labelMap);
            }

            var item;
            for (var i=0, len=labelMap.length; i<len; ++i) {
                item = labelMap[i];
                this.drawText(item[0].geometry.getCentroid(), item[1]);
            }
        }    
    },

    /**
     * Method: redrawFeaturesUsingRTree
     * Redraws all features using the R-Tree.
     * 
     * Parameters:
     * labelMap - {Array} List of styles that have a label
     */ 
    redrawFeaturesUsingRTree: function(labelMap) {
        var featuresMBR = this.rtree.search(this.extent);
        
        if (featuresMBR.length > 0) {
            // create a Hash-Map for the features, so that they can be accessed faster
            var featuresLookup = this.getAsDict(featuresMBR);
            var featureCount = featuresMBR.length;
            
            for (var i = this.featuresOrdered.length - 1; i >= 0; i--) {
                feature = this.featuresOrdered[i];
                
                if (featuresLookup.hasOwnProperty(feature.id)) {
                    // if the feature is part of the R-Tree search, draw it 
                    this.handleRedrawFeature(this.featuresOrdered[i].id, labelMap);
                    
                    featureCount--;
                    if (featureCount === 0) {
                        // we checked all features from the R-Tree search, stop
                        break;
                    }
                }
            }
        }        
    },

    /**
     * Method: redrawFeatures
     * Redraws all features.
     * 
     * Parameters:
     * labelMap - {Array} List of styles that have a label
     */ 
    redrawFeatures: function(labelMap) {
        for (var i = 0; i < this.featuresOrdered.length; i++) {
            this.handleRedrawFeature(this.featuresOrdered[i].id, labelMap);
        }
    },

    /**
     * Method: handleRedrawFeature 
     * Takes care of drawing a feature. For MODE.INTERACTIVE the feature,
     *      will only be drawn if its bounding-box intersects the current extent.
     * 
     * Parameters:
     * featureId - {String} Feature-Id
     * labelMap - {Array}
     */  
    handleRedrawFeature: function(featureId, labelMap) {
        if (!this.features.hasOwnProperty(featureId)) { return; }
        var feature = this.features[featureId][0];
        var style = this.features[featureId][1];
        if (!feature.geometry) { return; }
        
        if ((this.mode === OpenLayers.Renderer.Canvas.MODE.INTERACTIVE) && 
                !feature.geometry.getBounds().intersectsBounds(this.extent)) {
            return; 
        }
        
        this.drawGeometry(feature.geometry, style);
        if(style.label) {
            labelMap.push([feature, style]);
        }        
    },
    
    /**
     * Method: addToOrderedList
     * Adds a feature to the array 'featuresOrdered'. If the
     * feature is already in the list, remove it first and then
     * add it again, so that the drawing order is correct.
     * 
     * Parameters:
     * feature - {<OpenLayers.Feature>} The feature to add.
     */
    addToOrderedList: function(feature) {
        if (this.features.hasOwnProperty(feature.id)) {
            this.removeFromOrderedList(feature);
        }
        this.featuresOrdered.push(feature);
    },
    
    /**
     * Method: removeFromOrderedList
     * Removes a feature from the array 'featuresOrdered'.
     * 
     * Parameters:
     * feature - {<OpenLayers.Feature>} The feature to remove.
     */
    removeFromOrderedList: function(feature) {
        for(var i = this.featuresOrdered.length - 1; i >= 0; i--) {
            if(this.featuresOrdered[i] === feature) {
                this.featuresOrdered.splice(i,1);
                break;
            }
        }        
    },
    
    /**
     * Method: getAsDict
     * Creates a hash map/dictionary for an array of features
     * by using the feature's id as key.
     * 
     * Parameters:
     * feature - {Array(<OpenLayers.Feature>)} Array of features.
     * 
     * Returns:
     * {Object} The dictionary
     */
    getAsDict: function(features) {
        var obj = {};
        
        for (var i = features.length - 1; i >= 0; i--) {
            obj[features[i].id] = features[i];
        }
        
        return obj;
    },

    CLASS_NAME: "OpenLayers.Renderer.Canvas"
});

/**
 * Constant: OpenLayers.Renderer.Canvas.LABEL_ALIGN
 * {Object}
 */
OpenLayers.Renderer.Canvas.LABEL_ALIGN = {
    "l": "left",
    "r": "right"
};

/**
 * Constant: OpenLayers.Renderer.Canvas.MODE
 * {Object}
 * 
 *      STATIC        
 *          Best option if the features should be displayed only once
 *          and if there is no further interaction (panning/zooming/
 *          selecting features) with the map.
 *      INTERACTIVE
 *          Mode optimized for interactions with the map, requires the
 *          calculation of the features' bounds which slows down.
 *          The feature bounds are used to render only the features that
 *          are inside the current map extent and to find the feature that
 *          is selected by a mouse click (getFeatureIdFromEvent).
 *      RTREE
 *          Like INTERACTIVE, but a R-Tree is used to find features within
 *          a bounding-box.
 */
OpenLayers.Renderer.Canvas.MODE = {
    STATIC: 0,
    INTERACTIVE: 1,
    RTREE: 2
}