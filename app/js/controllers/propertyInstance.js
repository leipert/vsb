'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyInstance', ['GSB.config'])
    //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
    .controller('PropertyInstanceCtrl', function ($scope, $log, EndPointService) {

        /**
         * Changes visibility of a given propertyInst
         */
        $scope.togglePropertyView = function () {
            $scope.propertyInst.view = !$scope.propertyInst.view;
        };

        $scope.togglePropertyExists = function () {
            $scope.propertyInst.filterExists = !$scope.propertyInst.filterExists;
        };

        $scope.toggleHasFilter = function () {
            $scope.propertyInst.hasFilter = !$scope.propertyInst.hasFilter;
        };

        /**
         * Changes optionality of a given propertyInst
         */
        $scope.togglePropertyOptional = function () {
            $scope.propertyInst.optional = !$scope.propertyInst.optional;
        };

        if ($scope.propertyInst.$copied) {
            EndPointService.getPropertyDetails($scope.subjectInst.uri, $scope.propertyInst)
                .then(function (data) {
                    data = data[0];
                    $scope.propertyInst.$comment = data.$comment;
                    $scope.propertyInst.$label = data.$label;
                    $scope.propertyInst.$propertyRange = data.$propertyRange;
                    $scope.propertyInst.type = data.type;
                    return data.$propertyRange;
                })
                .fail(function (error) {
                    $log.error(error);
                });
        }

        $scope.$watch('propertyInst.linkTo', function (nv) {
            if (typeof nv === 'string') {
                var subjects = $scope.subjects;
                for (var i = 0, j = subjects.length; i < j; i++) {
                    if (subjects[i].hasOwnProperty('alias') && subjects[i].alias === nv) {
                        $scope.propertyInst.linkTo = subjects[i];
                        return;
                    }
                }
            }
        });


    });