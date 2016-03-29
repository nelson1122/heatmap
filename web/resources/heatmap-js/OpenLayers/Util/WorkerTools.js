/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Util.js
 * @requires OpenLayers/BaseTypes/Class.js
 */

/**
 * Namespace: Util.WorkerTools
 * 
 * This package provides functions to interchange OpenLayers objects
 * with web workers. If an object is sent to a web worker using
 * postMessage(), the object is serialized using the 'internal structured 
 * cloning algorithm' which does not clone methods and the prototype
 * attribute. 
 */
OpenLayers.Util.WorkerTools = {};

/**
 * APIFunction: exportData
 * For OpenLayers objects, this function stores the class
 * name in the attribute '__CLASS_NAME__' on the object.
 * 
 * This function is supposed to be used before passing
 * objects to the postMessage() function:
 * 
 *      worker.postMessage(OpenLayers.Util.WorkerTools.exportData(data));
 * 
 * This function does not pay attention to cycle references. If you want to
 * send objects containing cycles, you manually have to resolve the cycles.
 * The 'filter' parameter can be used for that, see 'tests/Util/WorkerTools.html'
 * for an example.
 * 
 * Note that this method directly works on the object. Keep this in mind
 * when applying custom modifications using the 'filter' parameter.
 *
 * Parameters:
 * data - {Object} The object to prepare.
 * filter - {Array(Function)} Optional, called with every object the class name is set on.
 *
 * Returns:
 * {Object} Same object as the argument.
 */
OpenLayers.Util.WorkerTools.exportData = function(data, filters) {
    if (filters === undefined) {
        filters = [];
    }
    
    for(var property in data) {
        if (!data.hasOwnProperty(property)) {
            // skip prototype properties
            continue;
        }
        
        var value = data[property];
        OpenLayers.Util.WorkerTools.__setClassName(value, filters);
    }
    
    return data;    
};

OpenLayers.Util.WorkerTools.__setClassName = function(data, filters) {
    if (data) {
        if (data.__proto__ && data.__proto__.CLASS_NAME) {
            // for OL objects store the class name directly on the object
            data.__CLASS_NAME__ = data.__proto__.CLASS_NAME;
            
            OpenLayers.Util.WorkerTools.__applyFilters(data, filters);
        }
        
        if (data.__CLASS_NAME__ || (data instanceof Array)) {
            for (var property in data) {
                if (!data.hasOwnProperty(property)) {
                    // skip prototype properties
                    continue;
                }
                
                var value = data[property];
                OpenLayers.Util.WorkerTools.__setClassName(value, filters);
            }
        }
    }    
};

/**
 * APIFunction: importData
 * Objects received in onmessage-handlers do not contain their
 * prototype information anymore. This method restores the
 * '__proto__' attribute, so that the attributes and methods of 
 * the class can be used again. This requires that the class name
 * was stored in the object using the function 'exportData()'.
 *
 * Parameters:
 * data - {Object} The object to restore.
 * filter - {Array(Function)} Optional, called for every restored object.
 *
 * Returns:
 * {Object} Same object as the argument.
 */
OpenLayers.Util.WorkerTools.importData = function(data, filters) {
    if (filters === undefined) {
        filters = [];
    }
    
    for (var property in data) {
        var value = data[property];
        OpenLayers.Util.WorkerTools.__setPrototypeAttributes(value, filters);
    }
    
    return data;
};

OpenLayers.Util.WorkerTools.__setPrototypeAttributes = function(data, filters) {
    if (data && (data.__CLASS_NAME__ || (data instanceof Array))) {
        for (var property in data) {
            var value = data[property];
            OpenLayers.Util.WorkerTools.__setPrototypeAttributes(value, filters);    
        }  
        
        if (data.__CLASS_NAME__) {
            // if a class name was set on this object, restore the class
            var clazz = OpenLayers.Util.WorkerTools.getClassByName(data.__CLASS_NAME__);
            if (clazz === undefined) {
                OpenLayers.Console.error("Class '" + data.__CLASS_NAME__ + "' does not exist!");
            } else {
                data.__proto__ = clazz.prototype;
                
                OpenLayers.Util.WorkerTools.__applyFilters(data, filters);
            }
        }  
    }
};

OpenLayers.Util.WorkerTools.CLASS_CACHE = {};

/**
 * Function: getClassByName
 * Obtains a class by its name. Classes are cached, because
 * "eval" is a heavy operation. This dramatically improves the
 * performance.
 *
 * Parameters:
 * className - {String} The class name.
 *
 * Returns:
 * {Object} The class.
 */
OpenLayers.Util.WorkerTools.getClassByName = function(className) {
    // todo: check if the name only contains the characters '.a-zA-Z'
    var clazz;
    
    // first check if we cached this class already
    if (OpenLayers.Util.WorkerTools.CLASS_CACHE.hasOwnProperty(className)) {
        return OpenLayers.Util.WorkerTools.CLASS_CACHE[className];
    }
    
    try {
        clazz = eval(className);
    } catch(error) {
        clazz = undefined;
    }
    
    // cache the class
    OpenLayers.Util.WorkerTools.CLASS_CACHE[className] = clazz;
    
    return clazz;  
};

OpenLayers.Util.WorkerTools.__applyFilters = function(data, filters){
    for (var i = 0; i < filters.length; i++) {
        filters[i](data);
    }
}

/**
 * Method: OpenLayers.Util.WorkerTools.geometryExportFilter
 * This method is used as export filter in <OpenLayers.Util.WorkerTools.exportData()>.
 * It releases the back reference of geometries inside a geometry collection,
 * so that we don't have cycle reference which are not supported
 * by postMessage().
 *
 * Parameters:
 * obj - {<OpenLayers.Class>}
 */
OpenLayers.Util.WorkerTools.geometryExportFilter = function(obj) {
    if (obj instanceof OpenLayers.Geometry) {
        if (obj.parent !== null) {
            obj.parent = null;
        }
    }    
};

/**
 * Method: OpenLayers.Util.WorkerTools.geometryImportFilter
 * This method is used as import filter in <OpenLayers.Util.WorkerTools.importData()>.
 * It re-assigns the back reference for geometries inside a geometry
 * collection.
 *
 * Parameters:
 * obj - {<OpenLayers.Class>}
 */
OpenLayers.Util.WorkerTools.geometryImportFilter = function(obj) {
    if (obj instanceof OpenLayers.Geometry.Collection) {
        if (obj.components !== null) {
            for (var i = 0; i < obj.components.length; i++) {
                obj.components[i].parent = obj;    
            }
        }
    }      
};

/**
 * Method: OpenLayers.Util.WorkerTools.projectionImportFilter
 * This method is used as import filter in <OpenLayers.Util.WorkerTools.importData()>.
 * It re-creates Proj4JS objects for OpenLayer.Projection objects.
 *
 * Parameters:
 * obj - {<OpenLayers.Class>}
 */
OpenLayers.Util.WorkerTools.projectionImportFilter = function(obj){
    if (obj instanceof OpenLayers.Projection) {
        obj.proj = new Proj4js.Proj(obj.projCode);;
    }
}

/**
 * Method: OpenLayers.Util.WorkerTools.projectionExportFilter
 * This method is used as export filter in <OpenLayers.Util.WorkerTools.importData()>.
 * It removes Proj4JS projection instances from OpenLayer.Projection objects.
 *
 * Parameters:
 * obj - {<OpenLayers.Class>}
 */
OpenLayers.Util.WorkerTools.projectionExportFilter = function(obj){
    if (obj instanceof OpenLayers.Projection) {
        obj.proj = null;
    }
}

/**
 * Method: OpenLayers.Util.WorkerTools.idImportFilter
 * This method is used as import filter in <OpenLayers.Util.WorkerTools.importData()>.
 * It generates new IDs for all objects.
 *
 * Parameters:
 * obj - {<OpenLayers.Class>}
 */
OpenLayers.Util.WorkerTools.idImportFilter = function(obj){
    if (obj.id) {
        // If the object has an ID, we have to generate a new one.
        // The ID was unique in the web worker, but is not in the main script.
        obj.id = OpenLayers.Util.createUniqueID(obj.CLASS_NAME + "_");
    }
}

/**
 * APIFunction: asyncCall
 * This function can be used to execute arbitrary method calls on
 * OpenLayers objects in a web worker.
 * See 'examples/asynCall-webworker.js' for an example.
 *
 * Parameters:
 * obj - {<OpenLayers.Class>|Array(<OpenLayers.Class>)} Single object or array of
 *      objects the method 'functionName' should be called on.
 * functionName - {String} The name of the function to call in a web worker.
 * args - {Array} Arguments passed to the function.
 * scope - {Object} Scope the callback function will be called in.
 * callback - {Function} Called when the web worker is finished. Receives one argument,
 *      the return value of the function call. If 'obj' is an Array, the callback also
 *      receives an array of return values.
 * options - {Object} Options
 *      Valid parameters:
 *      
 *          webworkerScript - {String} Path to the script 'AsyncCallWorker.js'
 *          basepath - {String} Optional, path to the OpenLayers library root folder (lib/), seen from 
 *                              the web worker script. Default is "../../..".
 *          scriptsOpenLayers - {Array(String)} Optional, files to import in the web worker. The file path
 *                              will be prefixed with 'basepath'.
 *          scriptsAdditional - {Array(String)} Optional, additional files to import in the web worker.
 *          importFilter - {Array(Function)} Optional, filters that are applied on the returned result.
 *          exportFilter - {Array(Function)} Optional, filters that are applied on the objects passed
 *                              to the web worker.
 *          webworkerImportFilterNames - {Array(String)} Optional, list of filter names which are 
 *                              applied on the received objects inside the web worker.
 *          webworkerExportFilterNames - {Array(String)} Optional, list of filter names which are 
 *                              applied on the result objects inside the web worker.
 *          
 *             
 *
 * Returns:
 * {Worker} The web worker which processes the task.
 */
OpenLayers.Util.WorkerTools.asyncCall = function(obj, functionName, args, scope, callback, options) {
    if (!(obj instanceof Array) && 
        (!obj[functionName] || !obj.__proto__.CLASS_NAME)) {
        OpenLayers.Console.error("Argument 'obj' not a valid OpenLayers class, " + 
                                 "or 'obj' has no method '" + functionName + "'.");
        return null;
    } 
    
    var worker = new Worker(options.webworkerScript);
    worker.onmessage = function(event) {
        if (event.data.status === "done") {
            var result = event.data.result;
            OpenLayers.Util.WorkerTools.importData([result], options.importFilter);
            callback.call(scope, result);
        }    
    };
    worker.onerror = function(error) {
        OpenLayers.Console.error(error); 
        callback.call(scope, undefined);   
    };
    
    var data = {
        status: "start",
        obj: obj,
        functionName: functionName,
        args: args,
        options: {
            basepath: options.basepath,
            scriptsOpenLayers: options.scriptsOpenLayers,
            scriptsAdditional: options.scriptsAdditional,
            webworkerImportFilterNames: options.webworkerImportFilterNames,
            webworkerExportFilterNames: options.webworkerExportFilterNames
        }    
    };
    
    OpenLayers.Util.WorkerTools.exportData(data, options.exportFilter);
    worker.postMessage(data);
    
    return worker;
};
