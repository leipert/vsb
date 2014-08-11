'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyType.number', ['GSB.config'])
    //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
    .controller('NumberPropertyCtrl', function ($scope) {
        $scope.numberArithmetic = '';


        var start = angular.copy($scope.propertyInst.compareRaw);

        $scope.numberArithmetic = 'x';
        $scope.numberComparison = 'y';


        if (start !== null && start !== undefined) {
            if (start.numberArithmetic !== null && start.numberArithmetic !== undefined) {
                $scope.numberArithmetic = start.numberArithmetic;
            }
            if (start.numberComparison !== null && start.numberComparison !== undefined) {
                $scope.numberComparison = start.numberComparison;
            }
        }

        //Observes and updates the values of the chosen number arithmetics
        $scope.$watch('numberArithmetic', function (newValue) {
            if (newValue === '' || newValue === null || newValue === undefined) {
                newValue = 'x';
            }
            $scope.propertyInst.compareRaw.numberArithmetic = newValue;
            if(newValue === 'x'){
                $scope.propertyInst.arithmetic = null;
            } else {
                $scope.propertyInst.arithmetic = newValue.replace(/x/g, '%before_arithmetic%');
            }
        });

        $scope.$watch('numberComparison', function (newValue) {
            if (newValue === '' || newValue === null || newValue === undefined) {
                newValue = 'y';
            }
            $scope.propertyInst.compareRaw.numberComparison = newValue;
            if(newValue === 'x' || newValue == 'y'){
                $scope.propertyInst.compare = null;
            } else {
                $scope.propertyInst.compare = newValue
                    .replace(/x/g, '%before_arithmetic%')
                    .replace(/y/g, '%after_arithmetic%');
            }
        });

    });