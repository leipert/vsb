'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyType.number', ['GSB.config'])
  //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
  .controller('NumberPropertyCtrl', ['$scope', '$http', '$log', 'globalConfig', function($scope, $http, $log, globalConfig) {
    $scope.numberArithmetic = "";
    //Observes and updates the values of the choosen number arithmetics
    $scope.$watch('numberArithmetic',function (newValue){
      if(newValue === "" || newValue === null || newValue === undefined){
        newValue = "x";
      }
      $scope.propertyInst.arithmetic = newValue.replace(/x/g,"%before_arithmetic%")
    });

    $scope.numberComparison = "";

    $scope.$watch('numberComparison',function (newValue){
      if(newValue === "" || newValue === null || newValue === undefined){
        newValue = "y";
      }
      $scope.propertyInst.compare = newValue
        .replace(/x/g,"%before_arithmetic%")
        .replace(/y/g,"%after_arithmetic%")
    });

  }]);