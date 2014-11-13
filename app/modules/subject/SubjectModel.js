(function () {
    'use strict';
    angular.module('GSB.subject.model', ['GSB.endPointService', 'pascalprecht.translate', 'GSB.connectionService'])
        .factory('Subject', SubjectConstructor);

    function SubjectConstructor(EndPointService, $log, $translate, $filter, Property, connectionService) {
        return function (data) {
            var subject = {
                uri: null,
                pos: {},
                view: true,
                $availableProperties: [],
                $classURIs: [],
                $id: null,
                $selectedProperties: [],
                $selectedAggregates: []
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

            function getAvailableProperties() {
                var newValues = [];
                subject.$availableProperties.forEach(function (c) {
                    c.comment = c.uri + '.$comment';
                    c.label = c.uri + '.$label';
                    newValues.push(c);
                });
                return $filter('translateAndSortLocalizedObjectArrayByKey')(newValues, 'label');
            }

            EndPointService.getSuperAndEqClasses(subject.uri)
                .then(function (data) {
                    $log.debug('SUBJECT Additional Classes loaded for ' + subject.uri, data);
                    subject.$classURIs = data;
                })
                .catch(function (error) {
                    $log.error(error);
                });

            EndPointService.getDirectProperties(subject.uri)
                .then(function (properties) {
                    $log.debug('PROPERTIES (direkt) loaded for ' + subject.uri, properties);
                    $translate.refresh();
                    subject.$availableProperties = _.union(subject.$availableProperties, properties);
                })
                .catch(function (err) {
                    $log.error('An error occurred: ', err);
                });

            EndPointService.getInverseProperties(subject.uri)
                .then(function (properties) {
                    $log.debug('PROPERTIES (inverse) loaded for ' + subject.uri, properties);
                    $translate.refresh();
                    subject.$availableProperties = _.union(subject.$availableProperties, properties);
                })
                .catch(function (err) {
                    $log.error('An error occurred: ', err);
                });

            if (!subject.alias) {
                $translate(subject.uri + '.$label').then(function (label) {
                    var alias = label;

                    /* TODO: Make subject alias unique
                     var  c = 1;
                     while ($scope.doesAliasExist(alias)) {
                     alias = label + '_' + c;
                     c += 1;
                     }
                     */
                    subject.alias = alias;
                });
            }

            return subject;

        };
    }

})();