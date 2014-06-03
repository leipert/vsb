'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyType.number', ['GSB.config'])
  //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
  .controller('NumberPropertyCtrl', ['$scope', '$http', '$log', 'globalConfig', function($scope, $http, $log, globalConfig) {
    $scope.numberArithmetic = '';


    var start = angular.copy($scope.propertyInst.compareRaw);

    $scope.numberArithmetic = '';
    $scope.numberComparison = '';

    if(start !== null && start !== undefined){
      if(start.numberArithmetic !== null) {
        $scope.numberArithmetic = start.numberArithmetic;
      }
      if(start.numberComparison !== null) {
        $scope.numberComparison = start.numberComparison;
      }
    }


    //Observes and updates the values of the chosen number arithmetics
    $scope.$watch('numberArithmetic',function (newValue){
      if(newValue === '' || newValue === null || newValue === undefined){
        newValue = 'x';
      }
      $scope.propertyInst.compareRaw.numberArithmetic = newValue;
      $scope.propertyInst.arithmetic = newValue.replace(/x/g,'%before_arithmetic%');
    });

    $scope.$watch('numberComparison',function (newValue){
      if(newValue === '' || newValue === null || newValue === undefined){
        newValue = 'y';
      }
      $scope.propertyInst.compareRaw.numberComparison = newValue;
      $scope.propertyInst.compare = newValue
        .replace(/x/g,'%before_arithmetic%')
        .replace(/y/g,'%after_arithmetic%');
    });

  }]);