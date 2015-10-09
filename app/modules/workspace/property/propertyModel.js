(function () {
    'use strict';
    angular.module('VSB.property.model', [
        'VSB.endPointService',
        'VSB.connectionService',
        'pascalprecht.translate'
        ])
        .factory('Property', PropertyConstructor);

    function PropertyConstructor(EndPointService, $log, $translate, $q, connectionService, $rootScope) {
        return function (data) {
            var property = {
                uri: null,
                type: null,
                filterExists: true,
                hasFilter: false,
                compareRaw: {},
                linkTo: null,
                view: true,
                optional: false,
                arithmetic: null,
                compare: null,
                $subject: {}
            };
            _.extend(property, data);
            property.$id = connectionService.generateID();
            connectionService.addPropertyToSubject(property.$subject.$id, property.$id);

            var getSubClassesOfRange = function (range) {
                if (!_.isEmpty(range)) {
                    var originalPropertyRange = angular.copy(range);
                    var promises = [];
                    originalPropertyRange.forEach(function (rangeItem) {
                        promises.push(EndPointService.getSubAndEqClasses(rangeItem));
                    });
                    return $q.all(promises).then(function ($range) {
                        $range = _.uniq(_.flatten($range));
                        property.$range = $range;
                    }).then(function () {
                        if (!property.typeCasted && property.type !== 'INVERSE_PROPERTY' && property.type !== 'AGGREGATE_PROPERTY') {
                            property.type = EndPointService.getPropertyType(property);
                        }
                    });
                }
            };

            if (property.$copied) {
                if (!_.startsWith(property.uri, '$$')) {
                    EndPointService.getPropertyDetails(property.$subject.uri, property)
                        .then(function (data) {
                            data = data[0];
                            if (!_.isEmpty(data)) {
                                property.$range = data.$range;
                                if (!property.typeCasted) {
                                    property.type = data.type;
                                }
                                return data.$range;
                            }
                            return null;
                        })
                        .then(getSubClassesOfRange)
                        .catch(function (error) {
                            $log.error(error);
                        });
                }
            } else {
                getSubClassesOfRange(property.$range);
            }

            var currentLanguage = null;

            $rootScope.$on('$translateChangeSuccess', function (event, data) {

                if (!property.$label || currentLanguage !== data.language) {
                    var $comment = property.uri + '.$comment';
                    var $label = property.uri + '.$label';

                    $translate([$comment, $label]).then(function (translated) {
                        if ($label !== translated[$label]) {
                            currentLanguage = data.language;
                            property.$label = translated[$label];

                            property.$comment = ($comment !== translated[$comment]) ? translated[$comment] : false;


                        }
                    });
                }

            });


            return property;

        };
    }

})();