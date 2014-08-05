'use strict';
angular.module('GSB.filters', [])
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
    .filter('replaceURIsWithPrefixes',function(){
        return function (string){
            return string
                .replace(/<?http:\/\/vocab.ub.uni-leipzig.de\/bibrm\/(\w+)>?/ig, 'bibrm:$1')
                .replace(/<?http:\/\/xmlns.com\/foaf\/0.1\/(\w+)>?/ig, 'foaf:$1')
                .replace(/<?http:\/\/www.w3.org\/2001\/XMLSchema#(\w+)>?/ig, 'xsd:$1')
                ;
        };
    })
    .filter('beautifySPARQL', function () {
        return function (string) {
            return string
                .replace(/<http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type>/ig, 'a')
                .replace(/select distinct/ig, 'SELECT DISTINCT \n')
                .replace(/where/ig, 'WHERE \n')
                .replace(/limit/ig, 'LIMIT')
                .replace(/ +\. +/ig, ' .\n')
                .replace(/\{/ig, '\n{\n')
                .replace(/\}/ig, '\n}\n')
                ;
        };
    });