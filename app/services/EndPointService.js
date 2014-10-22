'use strict';
/**
 * EndPointService
 * A Service, which gets the available SPARQL classes from the Server.
 *
 * @namespace data.results.bindings
 *
 */
/* global $*/

angular.module('GSB.endPointService', ['GSB.config'])
    .factory('EndPointService', function ($http, $q, $log, globalConfig, languageStorage) {
        var factory = {};

        var jassa = new Jassa(Promise, $.ajax);
        var sparql = jassa.sparql;
        var service = jassa.service;
        var sponate = jassa.sponate;

        var sparqlService = new service.SparqlServiceHttp(globalConfig.baseURL, globalConfig.defaultGraphURIs);
        sparqlService = new service.SparqlServiceCache(sparqlService);
        var store = new sponate.StoreFacade(sparqlService, globalConfig.prefixes);

        factory.runSponateMap = function (sponateMap) {
            var key = sponateMap.name;

            //TODO: Use languages correctly
            var langs = ['de', 'en', ''];

            var labelConfig = new sparql.BestLabelConfig(langs);
            var labelTemplate = sponate.MappedConceptUtils.createMappedConceptBestLabel(labelConfig);

            sponateMap.template[0].rows[0] =  _.mapValues(sponateMap.template[0].rows[0],function(val,key){
                if(_.startsWith(key,'$')){
                    return {
                        id: val,
                        label: {$ref: {target: labelTemplate, on: val, attr: 'displayLabel'}}
                    };
                }
                return val;
            });

            store.addMap(sponateMap);
            var flow = store[key].find().limit(100);
            return flow.list();

        };

        var cleanURI = function (str) {
            if (str === null || str === undefined) {
                return str;
            }
            return str.replace(/^<+/, '').replace(/>+$/, '');
        };

        factory.extractLabelFromURI = function (uri) {
            uri = cleanURI(uri);
            var hashPos = uri.lastIndexOf('#'),
                slashPos = uri.lastIndexOf('/');
            if (hashPos > slashPos) {
                return uri.substr(hashPos + 1);
            } else {
                return uri.substr(slashPos + 1);
            }
        };

        //TODO: Deprecate
        var fillTranslationStorage = function (uri, labels, comments) {
            labels.forEach(function (label) {
                languageStorage.setItem(label.id, uri + '.$label', label.value);
            });
            languageStorage.setItem('default', uri + '.$label', factory.extractLabelFromURI(uri));
            comments.forEach(function (comment) {
                languageStorage.setItem(comment.id, uri + '.$comment', comment.value);
            });
        };

        /**
         * Returns the type of a Property
         * @param $range
         * @returns string
         */
        factory.getPropertyType = function (property) {
            var type = (_.find(globalConfig.propertyTypeByType,
                function (val, key) {
                    return new RegExp(key).test(property.$type);
                }));

            if (!!type) {
                return type;
            }

            type = (_.find(globalConfig.propertyTypeByRange,
                function (val, key) {
                    return new RegExp(key).test(property.$range);
                }));

            return (!!type) ? type : 'STANDARD_PROPERTY';
        };

        factory.getAvailableClasses = function (uri) {
            if (!store.hasOwnProperty('classes')) {

                store.addMap({
                    name: 'classes',
                    template: [
                        {
                            id: '?uri',
                            $labels: [{id: '?label_loc', value: '?label'}],
                            $comments: [{id: '?comment_loc', value: '?comment'}]
                        }
                    ],
                    from: globalConfig.endPointQueries.getAvailableClasses
                });
            }

            var flow = store.classes.find();
            return flow.list()
                .then(function (classCollection) {
                    classCollection = _.pluck(classCollection, 'val');
                    if (uri) {
                        classCollection = _.filter(classCollection, {id: '<' + cleanURI(uri) + '>'});
                    }
                    classCollection.forEach(function (doc) {
                        doc.uri = cleanURI(doc.id);
                        fillTranslationStorage(doc.uri, doc.$labels, doc.$comments);
                    });
                    return classCollection;
                })
                .catch(function (error) {
                    $log.error('Getting Classes:', error);
                });
        };

        var getOtherClasses = function (uri, query, key) {
            if (!store.hasOwnProperty(key + uri)) {
                store.addMap({
                    name: key + uri,
                    template: [
                        {
                            id: '?uri'
                        }
                    ],
                    from: query
                });
            }
            var flow = store[key + uri].find();
            return flow.list()
                .then(function (docs) {
                    return _.pluck(_.pluck(docs, 'val'), 'id');
                })
                .catch(function (err) {
                    $log.error('An error occurred: ', err);
                });

        };

        factory.getSuperAndEqClasses = function (uri) {
            return getOtherClasses(cleanURI(uri), globalConfig.endPointQueries.getSuperAndEqClasses.replace('%uri%', cleanURI(uri)), 'SuperAndEqClasses');
        };

        factory.getSubAndEqClasses = function (uri) {
            return getOtherClasses(cleanURI(uri), globalConfig.endPointQueries.getSubAndEqClasses.replace('%uri%', cleanURI(uri)), 'SubAndEqClasses');
        };

        var getProperties = function (uri, query, inverse, filterURI) {
            var storeKey = (inverse) ? 'InverseProperties' : 'DirectProperties';
            if (!store.hasOwnProperty(storeKey + uri)) {
                store.addMap({
                    name: storeKey + uri,
                    template: [
                        {
                            id: '?uri',
                            $labels: [{id: '?label_loc', value: '?label'}],
                            $comments: [{id: '?comment_loc', value: '?comment'}],
                            $range: [{id: '?range'}],
                            $type: '?type'
                        }
                    ],
                    from: query
                });
            }
            var flow = store[storeKey + uri].find();
            return flow.list()
                .then(function (propertyCollection) {
                    propertyCollection = _.pluck(propertyCollection, 'val');
                    if (filterURI) {
                        propertyCollection = _.filter(propertyCollection, {id: '<' + cleanURI(filterURI) + '>'});
                    }
                    propertyCollection.forEach(function (property) {
                        property.$range = _.pluck(property.$range, 'id');
                        property.uri = cleanURI(property.id);
                        fillTranslationStorage(property.uri, property.$labels, property.$comments);
                        if (inverse) {
                            property.type = 'INVERSE_PROPERTY';
                        } else {
                            property.type = factory.getPropertyType(property);
                        }
                    });
                    return propertyCollection;
                })
                .catch(function (err) {
                    $log.error('An error occurred: ', err);
                });
        };

        factory.getDirectProperties = function (uri, filterURI) {
            return getProperties(cleanURI(uri), globalConfig.endPointQueries.getDirectProperties.replace('%uri%', uri), false, filterURI);
        };

        factory.getInverseProperties = function (uri, filterURI) {
            return getProperties(cleanURI(uri), globalConfig.endPointQueries.getInverseProperties.replace('%uri%', uri), true, filterURI);
        };

        factory.getPropertyDetails = function (uri, property) {
            if (property.type === 'INVERSE_PROPERTY') {
                return factory.getInverseProperties(cleanURI(uri), property.uri);
            } else {
                return factory.getDirectProperties(cleanURI(uri), property.uri);
            }
        };

        return factory;

    });
