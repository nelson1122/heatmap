/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
DeferredPrimeFaces = function() {
    var deferredPrimeFaces = {};
    var calls = [];
    var primeFacesLoaded = !!window.PrimeFaces;

    function defer(name, args) {
        calls.push({ name: name, args: args });
    }

    deferredPrimeFaces.begin = function() {
        if (!primeFacesLoaded) {
            delete window.PrimeFaces;
        }
    };

    deferredPrimeFaces.apply = function() {
        if (window.PrimeFaces) {
            for (var i = 0; i < calls.length; i++) {
                window.PrimeFaces[calls[i].name].apply(window.PrimeFaces, calls[i].args);
            }
        }

        delete window.DeferredPrimeFaces;
    };

    if (!primeFacesLoaded) {
        window.PrimeFaces = {
            ab: function() { defer("ab", arguments); },
            cw: function() { defer("cw", arguments); },
            focus: function() { defer("focus", arguments); }
        };
    }

    return deferredPrimeFaces;
}();