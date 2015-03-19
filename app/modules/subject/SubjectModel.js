(function () {
    'use strict';
    angular.module('GSB.subject.model', ['GSB.endPointService', 'pascalprecht.translate', 'GSB.connectionService'])
        .factory('Subject', SubjectConstructor);

    function SubjectConstructor(EndPointService, $log, $translate, helperFunctions, $q, Property, connectionService, translationCacheService) {
        return function (data) {
            var subject = {
                uri: null,
                pos: {},
                view: true,
                $classURIs: [],
                $id: null,
                $selectedProperties: []
            };
            _.extend(subject, data);

            subject.$id = connectionService.generateID();
            connectionService.addSubject(subject.$id);

            subject.getAvailableProperties = getAvailableProperties;
            subject.addProperty = addProperty;
            subject.removeProperty = removeProperty;

            function addProperty(data) {
                data.subject = {
                    uri: subject.uri,
                    $id: subject.$id
                };
                var newProperty = new Property(data);
                subject.$selectedProperties.push(newProperty);
                return newProperty;
            }

            function removeProperty(id) {
                connectionService.remove(id).then(function () {
                    _.remove(subject.$selectedProperties, {$id: id});
                });
            }

            function getAvailableProperties(filter, limit) {


                var customFilters = {
                    pre: function (array, searchTerm) {

                        if (!_.isArray(array) || !_.isString(searchTerm) || _.isEmpty(searchTerm)) {
                            return {};
                        }

                        var types = _(array).pluck('type').uniq()
                            .map(function (type) {
                                return type.toLowerCase().replace('_property', '');
                            }).value();

                        var searchRegex = new RegExp(':(' + _.map(types, _.escapeRegExp).join('|') + ')(?=\\s+|$)', 'ig');

                        if (!searchTerm.match(searchRegex)) {
                            return {};
                        }

                        var classToken = _.words(searchTerm, searchRegex)[0]
                                .toUpperCase().replace(':', '') + '_PROPERTY';

                        return {
                            array: _.where(array, {type: classToken}),
                            filter: searchTerm.replace(searchRegex,'')
                        };
                    },
                    post: function (array) {
                        return {
                            array: _.sortBy(array, 'type')
                        };
                    }
                };

                return translationCacheService.getFromCache('availableProperties' + subject.$id).then(function (classes) {
                    return helperFunctions.filterByTokenStringWithLimit(classes, filter, limit, customFilters);
                });
            }

            EndPointService.getSuperAndEqClasses(subject.uri)
                .then(function (data) {
                    $log.debug('SUBJECT Additional Classes loaded for ' + subject.uri, data);
                    subject.$classURIs = data;
                })
                .catch(function (error) {
                    $log.error(error);
                });

            var getDirectProperties = EndPointService.getDirectProperties(subject.uri)
                //.then(function (properties) {
                //    $log.debug('PROPERTIES (direkt) loaded for ' + subject.uri, properties);
                //    subject.$availableProperties = _.union(subject.$availableProperties, properties);
                //})
                .catch(function (err) {
                    $log.error('An error occurred: ', err);
                    return [];
                });

            var getInverseProperties = EndPointService.getInverseProperties(subject.uri)
                //.then(function (properties) {
                //    $log.debug('PROPERTIES (inverse) loaded for ' + subject.uri, properties);
                //    subject.$availableProperties = _.union(subject.$availableProperties, properties);
                //})
                .catch(function (err) {
                    $log.error('An error occurred: ', err);
                    return [];
                });

            subject.loading = $q.all([getDirectProperties, getInverseProperties]).then(function (properties) {
                properties = _.flatten(properties);
                translationCacheService.putInCache('availableProperties' + subject.$id, 'property', properties);
            });

            if (!subject.alias) {
                $translate(subject.uri + '.$label').then(function (alias) {
                    subject.alias = alias;
                });
            }

            return subject;

        };
    }

})();