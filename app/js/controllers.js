'use strict';

/* Controllers */

angular.module('GSB.controllers', [])
  .controller('WorkSpaceController', ['$scope', function($scope) {
        $scope.person={name: "Person"};
        $scope.city={name: "City"};
  }]);

//  controller('SubjectCtrl', ['$scope', function($scope) {
//
//        $scope.name = "City"
//
//        $scope.properties = []
//
//        $scope.available = [
//            {text:'areaTotal', uri: 'uri'},
//            {text:'bürgermeister', uri: 'uri'},
//            {text:'is Standort of', uri: 'uri'}
//        ];
//
//
//        $scope.addProperty = function() {
//            $scope.properties.push($scope.propertySelected);
//            $scope.propertySelected = '';
//        };
//
//        $scope.removeProperty = function() {
//            alert($scope.properties.text)//$scope.properties.slice()
//        };
//
//        $scope.translate = function() {
//            console.log($scope);
//        }
//
//  }])
//  .controller('PropertyCtrl', ['$scope', function($scope) {
//
//        $scope.translate = function() {
//            console.log($scope);
//        }
//
//  }]);