(function () {
    'use strict';
    angular.module('VSB.filters', ['VSB.config'])
        .filter('replaceURIsWithPrefixes', replaceURIsWithPrefixes)
        .filter('beautifySPARQL', beautifySPARQL);

    var rdfType = new RegExp('<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>','ig');

    function replaceURIsWithPrefixes(globalConfig) {
        return function (string, isQuery) {
            if(!_.isString(string)){
                return string;
            }

            if(isQuery) {
                string = string.replace(rdfType, 'a');
            }

            var usedPrefixes = '';
            _.forEach(globalConfig.prefixes, function(prefix, key){
                var regex = new RegExp('<?' + prefix + '(\\w+)>?', 'ig');
                if(regex.test(string)) {
                    string = string.replace(regex, key + ':$1');
                    if(isQuery){
                        usedPrefixes += 'PREFIX ' + key + ': <' + prefix + '>\n';
                    }
                }
            });

            return usedPrefixes + string;
        };
    }

    function beautifySPARQL() {
        return function (query) {
            return query
                .replace(/where\s+/ig, '\nWHERE')
                .replace(/limit/ig, 'LIMIT')
                .replace(/ +\.\s+/ig, ' .\n')
                .replace(/ +;\s+/ig, ' .\n')
                .replace(/^\?/igm, '\t?')
                .replace(/^FILTER/igm, '\tFILTER')
                .replace(/^BIND/igm, '\tBIND')
                .replace(/select distinct\s+/ig, 'SELECT DISTINCT \n')
                ;
        };
    }
})();