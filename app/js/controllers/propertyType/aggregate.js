'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyType.aggregate', ['GSB.config'])
    //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
    .controller('AggregatePropertyCtrl', function ($scope) {
        //Observes and updates the values of the choosen aggregate properties
        $scope.$watch('selected', function (nv) {
            if (nv !== undefined && nv !== null) {
                $scope.propertyInst.alias = nv.alias;
                $scope.propertyInst.operator = nv.operator;
                if (nv.restrictTo !== null && $scope.linkTo !== undefined && $scope.linkTo !== null) {
                    if (nv.restrictTo !== $scope.linkTo.type) {
                        $scope.linkTo = null;
                    }
                }
            }
        });
        $scope.$watch('link', function (nv) {
            if (nv !== undefined && nv !== null) {
                $scope.propertyInst.linkTo = nv.alias;
            }
        });
    });