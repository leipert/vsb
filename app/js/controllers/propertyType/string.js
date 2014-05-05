'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyType.string', ['GSB.config'])
  //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
  .controller('StringPropertyCtrl', ['$scope', '$http', '$log', 'globalConfig', function($scope, $http, $log, globalConfig) {

    $scope.allowedStringComparisons = [
      {
        label: "contains",
        f : 'regex(%after_arithmetic%, "%input%", "i")'
      },
      {
        label: "equals",
        f : '?%after_arithmetic%="%input%"^^xsd:string'
      },
      {
        label: "equals not",
        f : '?%after_arithmetic%!="%input%"^^xsd:string'
      },
      {
        label: "starts with",
        f : 'regex(%after_arithmetic%, "^%input%", "i")'
      },
      {
        label: "ends with",
        f : 'regex(%after_arithmetic%, "%input%$", "i")'
      },
      {
        label: "REGEX",
        f : 'regex(%after_arithmetic%, "%input%", "%flags%")'
      }
    ];

    $scope.$watch('stringComparison',function (newValue){
      if(newValue === null || newValue === undefined || newValue === ''){
        $scope.propertyInst.compare = null;
        return;
      }
      $scope.propertyInst.compare = newValue.f.replace(/%input%/,$scope.comparisonInput);
    });

    $scope.$watch('comparisonInput',function (newValue){
      if(newValue === null || newValue === undefined || newValue === ''){
        $scope.propertyInst.compare = null;
        return;
      }
      $scope.propertyInst.compare = $scope.stringComparison.f.replace(/%input%/,newValue);
    });
    $scope.$watch('comparisonRegexFlags',function (newValue){
      if(newValue === null || newValue === undefined || newValue === ''){
        $scope.propertyInst.compare = null;
        return;
      }
      $scope.propertyInst.compare = $scope.stringComparison.f.replace(/%input%/,newValue);
    });

  }]);