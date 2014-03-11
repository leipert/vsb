'use strict';

/* Controllers */

angular.module('GSB.controllers', []).
  controller('SubjectCtrl', ['$scope', function($scope) {

        $scope.properties = []

        $scope.available = [
            {text:'areaTotal'},
            {text:'populationTotal'}
        ];


        $scope.addProperty = function() {
            console.log($scope.propertySelected)
            $scope.properties.push($scope.propertySelected);
            $scope.propertySelected = '';
        };
        $scope.removeProperty = function() {
            alert($scope.properties.text)//$scope.properties.slice()
        };

  }])
  .controller('PropertyCtrl', ['$scope', function($scope) {
        $scope.test = 'Test';
  }]);