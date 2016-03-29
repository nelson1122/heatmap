/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Layer/Grid.js
 * @requires OpenLayers/Tile/Image.js
 */

/**
 * Class: OpenLayers.Layer.WMS
 * Instances of OpenLayers.Layer.WMS are used to display data from OGC Web
 *     Mapping Services. Create a new WMS layer with the <OpenLayers.Layer.WMS>
 *     constructor.
 * 
 * If the layer has a different CRS than the map, the layer is reprojected
 * on the client side using gdalwarp-js (only for singleTile = true and
 * useCanvas = OpenLayers.Layer.Grid.ONECANVASPERTILE). 
 * If canvasAsync is set to true, the reprojection is run in a web worker.
 * In this case the parameters gdalwarpWebWorkerPath and proj4JSPath
 * have to be set.
 * The reprojection progress can be monitored by registering for the
 * event 'tileReprojectionProgress'.
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Grid>
 */
OpenLayers.Layer.WMS = OpenLayers.Class(OpenLayers.Layer.Grid, {

    /**
     * Constant: DEFAULT_PARAMS
     * {Object} Hashtable of default parameter key/value pairs 
     */
    DEFAULT_PARAMS: { service: "WMS",
                      version: "1.1.1",
                      request: "GetMap",
                      styles: "",
                      exceptions: "application/vnd.ogc.se_inimage",
                      format: "image/jpeg"
                     },
    
    /**
     * Property: reproject
     * *Deprecated*. See http://trac.openlayers.org/wiki/SphericalMercator
     * for information on the replacement for this functionality. 
     * {Boolean} Try to reproject this layer if its coordinate reference system
     *           is different than that of the base layer.  Default is true.  
     *           Set this in the layer options.  Should be set to false in 
     *           most cases.
     */
    reproject: false,
 
    /**
     * APIProperty: isBaseLayer
     * {Boolean} Default is true for WMS layer
     */
    isBaseLayer: true,
    
    /**
     * APIProperty: encodeBBOX
     * {Boolean} Should the BBOX commas be encoded? The WMS spec says 'no', 
     * but some services want it that way. Default false.
     */
    encodeBBOX: false,
    
    /** 
     * APIProperty: noMagic 
     * {Boolean} If true, the image format will not be automagicaly switched 
     *     from image/jpeg to image/png or image/gif when using 
     *     TRANSPARENT=TRUE. Also isBaseLayer will not changed by the  
     *     constructor. Default false. 
     */ 
    noMagic: false,
    
    /**
     * Property: yx
     * {Array} Array of strings with the EPSG codes for which the axis order
     *     is to be reversed (yx instead of xy, LatLon instead of LonLat). This
     *     is only relevant for WMS versions >= 1.3.0.
     */
    yx: ['EPSG:4326'],
    
    /**
     * APIProperty: gdalwarpWebWorkerPath 
     * {String} Path to the gdalwarp-js web worker script (gdalwarp-webworker.js). 
     * When reprojecting on the client side, this parameter has to be set.
     */
    gdalwarpWebWorkerPath: null,

    /**
     * APIProperty: proj4JSPath 
     * {String} Path to Proj4JS. 
     * When reprojecting on the client side, this parameter has to be set.
     */    
    proj4JSPath: null,

    /**
     * APIProperty: proj4JSDefinitions 
     * {Array} Additional Proj4JS projection definitions.
     * This parameter is used, when reprojecting on the client side.
     * 
     * Example:
     *          [
     *              {
     *                  code: "EPSG:54009",
     *                  definition: "+proj=moll +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
     *              }   
     *          ] 
     */     
    proj4JSDefinitions: [],
    
    /**
     * Constructor: OpenLayers.Layer.WMS
     * Create a new WMS layer object
     *
     * Example:
     * (code)
     * var wms = new OpenLayers.Layer.WMS("NASA Global Mosaic",
     *                                    "http://wms.jpl.nasa.gov/wms.cgi", 
     *                                    {layers: "modis,global_mosaic"});
     * (end)
     *
     * Parameters:
     * name - {String} A name for the layer
     * url - {String} Base url for the WMS
     *                (e.g. http://wms.jpl.nasa.gov/wms.cgi)
     * params - {Object} An object with key/value pairs representing the
     *                   GetMap query string parameters and parameter values.
     * options - {Ojbect} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, url, params, options) {
        var newArguments = [];
        //uppercase params
        params = OpenLayers.Util.upperCaseObject(params);
        newArguments.push(name, url, params, options);
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
        OpenLayers.Util.applyDefaults(
                       this.params, 
                       OpenLayers.Util.upperCaseObject(this.DEFAULT_PARAMS)
                       );


        //layer is transparent        
        if (!this.noMagic && this.params.TRANSPARENT && 
            this.params.TRANSPARENT.toString().toLowerCase() == "true") {
            
            // unless explicitly set in options, make layer an overlay
            if ( (options == null) || (!options.isBaseLayer) ) {
                this.isBaseLayer = false;
            } 
            
            // jpegs can never be transparent, so intelligently switch the 
            //  format, depending on teh browser's capabilities
            if (this.params.FORMAT == "image/jpeg") {
                this.params.FORMAT = OpenLayers.Util.alphaHack() ? "image/gif"
                                                                 : "image/png";
            }
        }
		
        this.events.addEventType("tileReprojectionProgress");
    },    

    /** 
     * Method: addTileMonitoringHooks
     * This function takes a tile as input and adds a hook to
     *     monitor the reprojection progress.
     * 
     * Parameters: 
     * tile - {<OpenLayers.Tile>}
     */
    addTileMonitoringHooks: function(tile) {
        OpenLayers.Layer.Grid.prototype.addTileMonitoringHooks.apply(this, [tile]);            
        
        // register an event to monitor the reprojection progress
        tile.onReprojectionProgress = function(event) {
            this.events.triggerEvent("tileReprojectionProgress", event);
        };
        tile.events.register("reprojectionProgress", this, tile.onReprojectionProgress);
    },

    /** 
     * Method: removeTileMonitoringHooks
     * This function takes a tile as input and removes the tile hooks 
     *     that were added in addTileMonitoringHooks()
     * 
     * Parameters: 
     * tile - {<OpenLayers.Tile>}
     */
    removeTileMonitoringHooks: function(tile) {
        OpenLayers.Layer.Grid.prototype.removeTileMonitoringHooks.apply(this, [tile]);  
              
        tile.events.un({
            "reprojectionProgress": tile.onReprojectionProgress,
            scope: this
        });    
    },
    
    /**
     * Method: destroy
     * Destroy this layer
     */
    destroy: function() {
        // for now, nothing special to do here. 
        OpenLayers.Layer.Grid.prototype.destroy.apply(this, arguments);  
    },

    
    /**
     * Method: clone
     * Create a clone of this layer
     *
     * Returns:
     * {<OpenLayers.Layer.WMS>} An exact clone of this layer
     */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new OpenLayers.Layer.WMS(this.name,
                                           this.url,
                                           this.params,
                                           this.getOptions());
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.Grid.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here

        return obj;
    },    
    
    /**
     * APIMethod: reverseAxisOrder
     * Returns true if the axis order is reversed for the WMS version and
     * projection of the layer.
     * 
     * Returns:
     * {Boolean} true if the axis order is reversed, false otherwise.
     */
    reverseAxisOrder: function() {
        return (parseFloat(this.params.VERSION) >= 1.3 && 
            OpenLayers.Util.indexOf(this.yx, 
            this.map.getProjectionObject().getCode()) !== -1)
    },
    
    /**
     * Method: getURL
     * Return a GetMap query string for this layer
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} A bounds representing the bbox for the
     *                                request.
     *
     * Returns:
     * {String} A string with the layer's url and parameters and also the
     *          passed-in bounds and appropriate tile size specified as 
     *          parameters.
     */
    getURL: function (bounds) {
        bounds = this.adjustBounds(bounds);
        var imageSize = this.getImageSize();
        
        if (this.projection.getCode() != this.map.getProjection()) {
            // if the WMS uses a different CRS than the map, 
            // we have to reproject the bounds and calculate
            // new image bounds
            bounds = this.getReprojectedBounds(bounds);

            var ratio = bounds.getWidth() / bounds.getHeight();
            imageSize = new OpenLayers.Size(
                imageSize.w,
                Math.round(imageSize.w / ratio)
            );
        }
        
        var newParams = {};
        // WMS 1.3 introduced axis order
        var reverseAxisOrder = this.reverseAxisOrder();
        newParams.BBOX = this.encodeBBOX ?
            bounds.toBBOX(null, reverseAxisOrder) :
            bounds.toArray(reverseAxisOrder);
        newParams.WIDTH = imageSize.w;
        newParams.HEIGHT = imageSize.h;
        var requestString = this.getFullRequestString(newParams);
        return requestString;
    },
    
    /**
     * Method: getReprojectedBounds
     * Reprojects the bounds from the map CRS to the 
     * CRS used by the WMS. The bounds are clipped to
     * the maximum extent, otherwise Proj4JS may return
     * bounds with bounds.left > bounds.right.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} 
     *
     * Returns:
     * {<OpenLayers.Bounds>} The reprojected bounds
     */
    getReprojectedBounds: function(bounds) {
        var maxExtent = this.maxExtent; 
        
        // clip bounds to maximum extent
        var left = bounds.left;
        var right = bounds.right;
        var top = bounds.top;
        var bottom = bounds.bottom;
        
        if (bounds.left < maxExtent.left) {
            left = maxExtent.left;
        }
        
        if (bounds.right > maxExtent.right) {
            right = maxExtent.right;
        }
                
        if (bounds.bottom < maxExtent.bottom) {
            bottom = maxExtent.bottom;
        }
        
        if (bounds.top > maxExtent.top) {
            top = maxExtent.top;
        }      
        
        bounds = new OpenLayers.Bounds(left, bottom, right, top);
        
        return bounds.transform(this.map.projection, this.projection);
    },

//    /**
//     * Method: addTile
//     * addTile creates a tile, initializes it, and adds it to the layer div. 
//     *
//     * Parameters:
//     * bounds - {<OpenLayers.Bounds>}
//     * position - {<OpenLayers.Pixel>}
//     * 
//     * Returns:
//     * {<OpenLayers.Tile.Image>} The added OpenLayers.Tile.Image
//     */
//    addTile:function(bounds,position) {
//        return new OpenLayers.Tile.Image(this, position, bounds, 
//                                         null, this.tileSize);
//    },

    /**
     * APIMethod: mergeNewParams
     * Catch changeParams and uppercase the new params to be merged in
     *     before calling changeParams on the super class.
     * 
     *     Once params have been changed, the tiles will be reloaded with
     *     the new parameters.
     * 
     * Parameters:
     * newParams - {Object} Hashtable of new params to use
     */
    mergeNewParams:function(newParams) {
        var upperParams = OpenLayers.Util.upperCaseObject(newParams);
        var newArguments = [upperParams];
        return OpenLayers.Layer.Grid.prototype.mergeNewParams.apply(this, 
                                                             newArguments);
    },

    /** 
     * APIMethod: getFullRequestString
     * Combine the layer's url with its params and these newParams. 
     *   
     *     Add the SRS parameter from projection -- this is probably
     *     more eloquently done via a setProjection() method, but this 
     *     works for now and always.
     *
     * Parameters:
     * newParams - {Object}
     * altUrl - {String} Use this as the url instead of the layer's url
     * 
     * Returns:
     * {String} 
     */
    getFullRequestString:function(newParams, altUrl) {
        var projectionCode = this.map.getProjection();
        
        if (this.projection.getCode() != this.map.getProjection()) {
            projectionCode = this.projection;
        }
        
        var value = (projectionCode == "none") ? null : projectionCode
        if (parseFloat(this.params.VERSION) >= 1.3) {
            this.params.CRS = value;
        } else {
            this.params.SRS = value;
        }

        return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(
                                                    this, arguments);
    },

    CLASS_NAME: "OpenLayers.Layer.WMS"
});
