'use strict';
angular.module('GSB.filters', ['GSB.config'])
    .filter('aggregatePropertyFilter', function () {
        return function (arrayOfObjects, filter) {
            if (filter === null || filter === undefined || !filter.hasOwnProperty('restrictTo') || filter.restrictTo === null) {
                return arrayOfObjects;
            }
            return arrayOfObjects.filter(
                function (currentObject) {
                    return currentObject.type === this.restrictTo;
                },
                filter
            );
        };
    }).filter('objectPropertyFilter', function () {
        return function (arrayOfObjects, key, filter) {
            if (key === null || key === undefined || typeof filter !== 'object' || filter.length === 0) {
                return arrayOfObjects;
            }
            return arrayOfObjects.filter(function (currentObject) {
                    if (currentObject[this.key] === undefined) {
                        return true;
                    }
                    for (var i = 0, j = this.filter.length; i < j; i++) {
                        if (currentObject[this.key].indexOf(this.filter[i]) !== -1) {
                            return true;
                        }
                    }
                    return false;
                }, {key: key, filter: filter}
            );
        };
    })
    .filter('replaceURIsWithPrefixes',function(globalConfig){
        return function (string){
            for(var key in globalConfig.prefixes){
                if(globalConfig.prefixes.hasOwnProperty(key)){
                    var regex = new RegExp('<?'+globalConfig.prefixes[key]+'(\\w+)>?','ig');
                    string = string.replace(regex,key+':$1');
                }
            }
            return string;
        };
    })
    .filter('beautifySPARQL', function () {
        return function (string) {
            return string
                .replace(/<http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type>/ig, 'a')
                .replace(/where\s+/ig, 'WHERE \n')
                .replace(/limit/ig, 'LIMIT')
                .replace(/ +\.\s+/ig, ' .\n')
                .replace(/ +;\s+/ig, ' .\n')
                .replace(/\{/ig, '\n{\n')
                .replace(/}\s+/ig, '\n}\n')
                .replace(/^\?/igm, '\t?')
                .replace(/^FILTER/igm, '\tFILTER')
                .replace(/^BIND/igm, '\tBIND')
                .replace(/select distinct\s+/ig, 'SELECT DISTINCT \n')
            ;
        };
    });