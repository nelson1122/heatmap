/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * Class: OpenLayers.RTree
 * A wrapper class to store OpenLayers features in a R-Tree.
 *     Depends on the 'R-Tree Library for Javascript' (http://stackulator.com/rtree/). 
 *     If this library is not available, an exception will be thrown when
 *     instantiating an R-Tree object. 
 */
OpenLayers.RTree = OpenLayers.Class({
    /**
     * Property: rtree
     * {RTree} The internal RTree.
     */
    rtree: null,

    /**
     * Property: featureBounds
     * {Object} A hash-table which stores the features' bounds and which is used
     *              to avoid that a feature is inserted multiple times with
     *              different bounds.
     */    
    featureBounds: {},
    
    /** 
     * Constructor: OpenLayers.RTree
     * Creates an OpenLayers.RTree which internally uses the
     * 'R-Tree Library for Javascript' (http://stackulator.com/rtree/).
     *
     * Parameters:
     * maxNodeWidth - {Integer} Optional maximum width of a node before a split is performed.
     * 
     * Return:
     * {<OpenLayers.RTree>}
     */
    initialize: function(maxNodeWidth) {
        if (!window.RTree) {
            throw "RTree library is not available";         
        }
        this.rtree = new RTree(maxNodeWidth);
    }, 
    
    /**
     * APIMethod: insert
     * Inserts a feature into the R-Tree.
     * 
     * Parameters:
     * feature - {OpenLayers.Feature} A feature to be added to the R-Tree.
     */
    insert: function(feature) {
        if (this.featureBounds.hasOwnProperty(feature.id)) {
            // feature is already in the R-Tree
            if (this.featureBounds[feature.id] === feature.geometry.getBounds()) {
                return;
            } else {
                // the feature is already in the R-Tree and the bounds have changed: 
                // remove it and then insert it again, so that the bounds are updated
                var oldBounds = this.wrapBounds(this.featureBounds[feature.id]);
                this.rtree.remove(oldBounds, feature);
            }
        }
        this.featureBounds[feature.id] = feature.geometry.getBounds();
        var bounds = this.wrapBounds(feature.geometry.getBounds());
        this.rtree.insert(bounds, feature);    
    },

    /**
     * APIMethod: remove
     * Removes a feature from the R-Tree.
     * 
     * Parameters:
     * feature - {OpenLayers.Feature} A feature to be removed from the R-Tree.
     * 
     * Returns:
     * {Integer} Returns 1 if the feature was removed, otherwise 0.
     */
    remove: function(feature) {
        return this.rtree.remove(this.wrapBounds(feature.geometry.getBounds()), feature);    
    },

    /**
     * APIMethod: search
     * Retrieves all features that are within a rectangle.
     * 
     * Parameters:
     * bounds - {OpenLayers.Bounds} An area to search within.
     * 
     * Returns:
     * {Array(<OpenLayers.Feature>)} Returns all features that overlap or touch the rectangle.
     */ 
    search: function(bounds) {
        return this.rtree.search(this.wrapBounds(bounds));    
    },

    /**
     * Method: wrapBounds
     * Transforms a <OpenLayers.Bounds> object into an object
     * that can be used with the R-Tree library.
     * 
     * Parameters:
     * bounds - {OpenLayers.Bounds} A bounds object.
     * 
     * Returns:
     * {object} An object that has the properties 'x', 'y', 'w' and 'h'.
     */ 
    wrapBounds: function(bounds) {
        return {
            x: bounds.left,
            y: bounds.bottom,
            w: bounds.getWidth(),
            h: bounds.getHeight()
        };    
    }
});