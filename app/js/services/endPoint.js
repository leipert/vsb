'use strict';
/**
 * EndPointService
 * A Service, which gets the available SPARQL classes from the Server.
 *
 * @namespace data.results.bindings
 *
 */

angular.module('GSB.services.endPoint', ['GSB.config'])
    .factory('EndPointService', ['$http', '$q', '$log', 'globalConfig', function ($http, $q, $log, globalConfig) {
        _.mixin(_.str.exports());
        var factory = {};

        var service = Jassa.service;
        var sponate = Jassa.sponate;

        var sparqlService = new service.SparqlServiceHttp(globalConfig.baseURL, globalConfig.defaultGraphURIs);
        sparqlService = new service.SparqlServiceCache(sparqlService);
        var store = new sponate.StoreFacade(sparqlService, globalConfig.prefixes);

        var cleanURI = function (str) {
            if (str === null) {
                return null;
            }
            return str.replace(/^</, '').replace(/>$/, '');
        };

        /**
         * Returns the type of a Property
         * @param $propertyRange
         * @returns string
         */
        var getPropertyType = function ($propertyRange) {
            if ($propertyRange !== null) {
                var conf = globalConfig.propertyTypeURIs;
                for (var key in conf) {
                    if (conf.hasOwnProperty(key)) {
                        for (var i = 0, j = conf[key].length; i < j; i++) {
                            if ($propertyRange.search(conf[key][i]) > -1) {
                                return key;
                            }
                        }
                    }
                }
            }
            return 'STANDARD_PROPERTY';
        };

        var makeLabel = function($label, uri){
            if ($label !== null) {
                return $label;
            } else {
                uri = cleanURI(uri);
                var hashPos = uri.lastIndexOf('#'),
                    slashPos = uri.lastIndexOf('/');
                if (hashPos > slashPos) {
                    $label = uri.substr(hashPos + 1);
                } else {
                    $label = uri.substr(slashPos + 1);
                }
                return $label;
            }

        };

        var createAvailablePropertyObject = function (data,filterURI) {
            var ret = [], retMap = {};
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var property = data[key],
                        uri = cleanURI(property.uri),
                        type = 'STANDARD_PROPERTY';

                    if(filterURI === uri || filterURI === undefined) {

                        property.$label = makeLabel(property.$label, uri);

                        /* Check whether a property.range is given.*/
                        if (property.inverse === 'I') {
                            type = 'INVERSE_PROPERTY';
                            property.$label = 'is ' + property.$label + ' of';
                        } else {
                            type = getPropertyType(property.range);
                        }

                        /* If we already have a property with the same URI,
                         then we just add the property.range to the corresponding URI. */
                        if (!ret.hasOwnProperty(uri)) {
                            ret.push({
                                alias: property.$label,
                                $label: property.$label,
                                $comment: property.$comment,
                                uri: uri,
                                type: type,
                                $propertyRange: []
                            });
                            retMap[uri] = ret.length - 1;
                        }

                        if (property.range !== null) {
                            ret[retMap[uri]].$propertyRange.push(property.range);
                        }
                    }

                }
            }
            return ret;
        };

        factory.getAvailableClasses = function () {
            if (!store.hasOwnProperty('classes')) {

                store.addMap({
                    name: 'classes',
                    template: [
                        {
                            id: '?s',
                            uri: '?s',
                            $label: '?l',
                            $comment: '?c'
                        }
                    ],
                    from: '?s a rdfs:Class .' +
                    'OPTIONAL { ?s rdfs:label ?l } .' +
                    'OPTIONAL { ?s rdfs:comment ?c} '
                });
            }

            return store.classes.find().asList()
                .then(function (docs) {
                    docs.forEach(function (doc) {
                        doc.id = cleanURI(doc.id);
                        doc.uri = doc.id;
                        doc.$label = makeLabel(doc.$label,doc.id);
                    });
                    return docs;
                })
                .fail(function (error) {
                    $log.error('Getting Classes:', error);
                });
        };

        factory.getURIMetaData = function (uri) {
            if (!store.hasOwnProperty('metaData' + uri)) {
                store.addMap({
                    name: 'metaData' + uri,
                    template: [
                        {
                            id: '?s',
                            $comment: '?c',
                            $label: '?l'
                        }
                    ],
                    from:
                    '?s a rdfs:Class .' +
                    'FILTER ( str(?s) = "' + uri + '")' +
                    'OPTIONAL { <'+ uri + '> rdfs:label ?l } .' +
                    'OPTIONAL { <'+ uri + '> rdfs:comment ?c} '
                });
            }
            var flow = store['metaData' + uri].find();

            return flow.asList()
                .then(function (docs) {
                    docs.forEach(function (doc) {
                        doc.$label = makeLabel(doc.$label,cleanURI(doc.id));
                    });
                    return docs[0];
                })
                .fail(function (err) {
                    $log.error('An error occurred: ', err);
                });

        };


        factory.getAllClassURIs = function (uri) {
            if (!store.hasOwnProperty('anotherClasses' + uri)) {
                store.addMap({
                    name: 'anotherClasses' + uri,
                    template: [
                        {
                            id: '?uri'
                        }
                    ],
                    from: '{   <' + uri + '> rdfs:subClassOf* ?uri. }' +
                    'UNION' +
                    '{  <' + uri + '> owl:equivalentClass ?uri.  }'

                });
            }
            var flow = store['anotherClasses' + uri].find();

            return flow.asList()
                .then(function (docs) {
                    var ret = [];
                    docs.forEach(function (doc) {
                        ret.push(doc.id);
                    });
                    return ret;
                })
                .fail(function (err) {
                    $log.error('An error occurred: ', err);
                });

        };

        factory.getProperties = function (uri,filterURI) {
            if (!store.hasOwnProperty('props' + uri)) {
                store.addMap({
                    name: 'props' + uri,
                    template: [
                        {
                            id: '?uri',
                            uri: '?uri',
                            inverse: '?inverse',
                            $comment: '?comment',
                            $label: '?alias',
                            range: '?range'
                        }
                    ],
                    from: ' {' +
                    '  <' + uri + '> rdfs:subClassOf* ?class.' +
                    '    { ?uri rdfs:domain ?class .' +
                    '      BIND("D" as ?inverse)' +
                    '      OPTIONAL { ?uri rdfs:range ?range}' +
                    '    } UNION {' +
                    '      ?uri rdfs:range ?class .' +
                    '      BIND("I" as ?inverse)' +
                    '      OPTIONAL { ?uri rdfs:domain ?range}' +
                    '    }' +
                    '  }' +
                    '  OPTIONAL { ?uri rdfs:comment ?comment . }' +
                    '  OPTIONAL { ?uri rdfs:label ?alias . } '
                });
            }
            var flow = store['props' + uri].find();

            return flow.asList()
                .then(function (docs) {
                    return (createAvailablePropertyObject(docs,filterURI));
                })
                .fail(function (err) {
                    $log.error('An error occurred: ', err);
                });
        };

        return factory;

    }]);
