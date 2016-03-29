/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * This script is called as web worker from WorkerTools.asyncCall().
 */

AsyncCallWorker = {};

onmessage = function(event) {
    if (event.data.status === "start") {
        AsyncCallWorker.fakeEnvironment();
        
        AsyncCallWorker.loadScripts(event.data.options);
                     
        var data = OpenLayers.Util.WorkerTools.importData(event.data,
                        AsyncCallWorker.getFilters(event.data.options.webworkerImportFilterNames));
        
        var obj = data.obj;
        var functionName = data.functionName;
        var args = data.args;
        
        var result = null;
        if (obj instanceof Array) {
            // if we have an array, call the function for every element in the array
            result = [];
            for (var i = 0; i < obj.length; i++) {
                var element = obj[i];
                var returnValue = element[functionName].apply(element, args);
                result.push(returnValue);    
            }
        } else {
            result = obj[functionName].apply(obj, args);
        }
        
        OpenLayers.Util.WorkerTools.exportData([result],
                    AsyncCallWorker.getFilters(data.options.webworkerExportFilterNames));
                    
        postMessage({
            status: "done",
            result: result    
        });
        close();
    }
};

/**
 * Method: AsyncCallWorker.loadScripts
 * Imports all OpenLayers files that are required to restore the classes for
 * the objects that are sent from the main script.
 * 
 * Parameters:
 * options - {Array(String)}
 */
AsyncCallWorker.loadScripts = function(options) {
    var basepath = (options.basepath) ?
                        options.basepath :
                        "../../";
                        
    var scriptsOpenLayers = (options.scriptsOpenLayers) ? 
                                options.scriptsOpenLayers : 
                                AsyncCallWorker.SCRIPTS;

    for (var i = 0; i < scriptsOpenLayers.length; i++) {
        var script = scriptsOpenLayers[i];
        importScripts(basepath + script);
    }
                        
    var scriptsAdditional = (options.scriptsAdditional) ? 
                                options.scriptsAdditional : [];

    for (var i = 0; i < scriptsAdditional.length; i++) {
        importScripts(scriptsAdditional[i]);
    }
};

/**
 * Method: AsyncCallWorker.fakeEnvironment
 * Inside a web worker the global variables 'window' and
 * 'document' can not be accessed. This method creates dummy
 * objects and functions, so that OpenLayer is still able to
 * work.
 */
AsyncCallWorker.fakeEnvironment = function() {
    window = {};
    
    document = {};
    document.getElementsByTagName = function(name) {
        return [];
    }
    window.document = document;
    
    window.Function = Function;
    window.location = {};
    window.XMLHttpRequest = XMLHttpRequest;
    window.setTimeout = function(f, time) {
        setTimeout(f, time);
    }    
    
    if (this.Proj4js) {
        window.Proj4js = Proj4js;
    }
};

/**
 * Method: AsyncCallWorker.getFilters
 * Obtains function references for a list of function names.
 * 
 * Parameters:
 * filterNames - {Array(String)} List of function names.
 * 
 * Returns:
 * {Array(Function)} List of functions.
 */
AsyncCallWorker.getFilters = function(filterNames) {
    var filters = [];
    
    for (var i = 0; i < filterNames.length; i++) {
        var filter = OpenLayers.Util.WorkerTools.getClassByName(filterNames[i]);
        filters.push(filter);
    }    
    
    return filters;
}; 

/**
 * Property: AsyncCallWorker.SCRIPTS
 * {Array} List of OpenLayers files.
 */  
AsyncCallWorker.SCRIPTS = [
    // generic files
    "OpenLayers/SingleFile.js",
    "OpenLayers/BaseTypes.js",
    "OpenLayers/BaseTypes/Class.js",
    "OpenLayers/Util.js",
    "OpenLayers/Util/WorkerTools.js",
    "OpenLayers/Console.js",
    
    // files for request
    "OpenLayers/Ajax.js",
    "OpenLayers/Events.js",
    "OpenLayers/Request.js",
    "OpenLayers/Request/XMLHttpRequest.js",
    
    // files for geometry/feature
    "OpenLayers/BaseTypes/Bounds.js",
    "OpenLayers/Geometry.js",
    "OpenLayers/Popup.js",
    "OpenLayers/Feature.js",
    "OpenLayers/Feature/Vector.js",
    "OpenLayers/Geometry/Point.js",
    "OpenLayers/Geometry/Collection.js",
    "OpenLayers/Geometry/MultiPoint.js",
    "OpenLayers/Geometry/Curve.js",
    "OpenLayers/Geometry/LineString.js",
    "OpenLayers/Geometry/LinearRing.js", 
    "OpenLayers/Geometry/MultiLineString.js",
    "OpenLayers/Geometry/Polygon.js",
    "OpenLayers/Geometry/MultiPolygon.js",
    "OpenLayers/Format.js",
    "OpenLayers/Format/WKT.js",
    "OpenLayers/Style.js"
];