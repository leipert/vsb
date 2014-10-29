(function () {
    'use strict';
    angular.module('GSB.property.model', ['GSB.endPointService', 'pascalprecht.translate', 'GSB.connectionService'])
        .factory('Property', SubjectConstructor);

    function SubjectConstructor(EndPointService, $log, $translate, $filter, $q, connectionService) {
        return function (data) {
            var property = {
                uri: null,
                type: null,
                filterExists: true,
                hasFilter: false,
                compareRaw: {},
                link: null,
                view: true,
                optional: false,
                arithmetic: null,
                compare: null,
                subject: {}
            };
            _.extend(property, data);

            property.$id = connectionService.generateID();
            connectionService.addPropertyToSubject(property.subject.$id, property.$id);


            if (!property.alias) {
                $translate(property.uri + '.$label').then(function (label) {
                    var alias = label;

                    /* TODO: Make subject alias unique
                     var  c = 1;
                     while ($scope.doesAliasExist(alias)) {
                     alias = label + '_' + c;
                     c += 1;
                     }
                     */
                    property.alias = alias;
                });
            }

            var getSubClassesOfRange = function (range) {
                if (range !== undefined) {
                    var originalPropertyRange = angular.copy(range);
                    var promises = [];
                    originalPropertyRange.forEach(function (rangeItem) {
                        promises.push(EndPointService.getSubAndEqClasses(rangeItem));
                    });
                    return $q.all(promises).then(function ($range) {
                        $range = _.uniq(_.flatten($range));
                        property.$range = $range;
                    }).then(function () {
                        if (property.type !== 'INVERSE_PROPERTY') {
                            property.type = EndPointService.getPropertyType(property);
                        }
                    });
                }
            };

            if (property.$copied) {
                EndPointService.getPropertyDetails(property.subject.uri, property)
                    .then(function (data) {
                        data = data[0];
                        if (data !== undefined) {
                            property.$range = data.$range;
                            property.type = data.type;
                            return data.$range;

                        }
                    })
                    .then(getSubClassesOfRange)
                    .catch(function (error) {
                        $log.error(error);
                    });
            } else {
                getSubClassesOfRange(property.$range);
            }


            return property;

        };
    }

})();