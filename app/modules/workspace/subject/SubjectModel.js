(function () {
    'use strict';
    angular.module('VSB.subject.model', [
        'VSB.connectionService',
        'VSB.endPointService',
        'pascalprecht.translate'
    ])
        .factory('Subject', SubjectConstructor);

    function SubjectConstructor(EndPointService, $log, $translate, helperFunctions, $q, Property, connectionService, translationCacheService, MessageService, $rootScope) {
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
                data.$subject = {
                    uri: subject.uri,
                    $id: subject.$id
                };
                data.alias = createUniqueAlias(data.alias, data.$label, data.uri);
                var newProperty = new Property(data);
                subject.$selectedProperties.push(newProperty);
                connectionService.recalculateOffsets(subject.$id);
                return newProperty;
            }

            function createUniqueAlias(alias, label, uri) {
                if (!alias) {
                    alias = label;
                }
                if (!alias) {
                    alias = $translate.instant(uri + '.$label');
                }
                alias = _.trunc(alias, 35);
                var newAlias = alias;
                var c = 1;
                while (!isAliasUnique(newAlias)) {
                    newAlias = alias + ' ' + c;
                    c += 1;
                }
                return newAlias;
            }

            function isAliasUnique(alias) {
                return _.filter(subject.$selectedProperties, {alias: alias}).length === 0;
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
                            filter: searchTerm.replace(searchRegex, '')
                        };
                    }
                };

                return translationCacheService.getFromCache(subject.$id).then(function (classes) {
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
                .catch(function (err) {
                    var message = '<span> An error occured while loading direct properties for ' + subject.uri + '<br>' + _.escape(err) + '</span>';
                    MessageService.addMessage({message: message, icon: 'times-circle-o', 'class': 'danger'});
                    $log.error('PROPERTIES (direct) loaded for ' + subject.uri, 'An error occurred: ', err);
                    return [];
                });


            var getInverseProperties = EndPointService.getInverseProperties(subject.uri)
                .catch(function (err) {
                    var message = '<span> An error occured while loading indirect properties for ' + subject.uri + '<br>' + _.escape(err) + '</span>';
                    MessageService.addMessage({message: message, icon: 'times-circle-o', 'class': 'danger'});
                    $log.error('An error occurred: ', err);
                    return [];
                });

            subject.$loading = $q.all([getDirectProperties, getInverseProperties]).then(function (properties) {
                properties = _.flatten(properties);
                translationCacheService.putInCache(subject.$id, 'property', properties);
            });

            var currentLanguage = null;

            $rootScope.$on('$translateChangeSuccess', function (event, data) {

                if (!subject.$label || currentLanguage !== data.language) {
                    var $comment = subject.uri + '.$comment';
                    var $label = subject.uri + '.$label';

                    $translate([$comment, $label]).then(function (translated) {
                        if ($label !== translated[$label]) {
                            currentLanguage = data.language;
                            subject.$label = translated[$label];

                            subject.$comment = ($comment !== translated[$comment]) ? translated[$comment] : false;


                        }
                    });
                }

            });

            return subject;

        };
    }

})();