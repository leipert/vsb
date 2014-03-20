'use strict';

/* Property Controller */

angular.module('GSB.controllers.property', [])
.controller('PropertyCtrl', ['$scope','$http', function($scope,$http) {

  //Named a few variables, for shorter access
  var $parentSubject = $scope.subjectInst,
  $selectedProperties = $parentSubject.selectedProperties;

  $parentSubject.availableProperties = [];

  console.log('Lade die Properties von ' + $parentSubject.uri);
  //Retrieve Properties from Server
  $http.get($parentSubject.uri).success(function (data){
      $parentSubject.availableProperties = [];
      var returnedProperties = data.results.bindings;
      for (var key in returnedProperties){
          var property = returnedProperties[key];
          $parentSubject.availableProperties.push(
              {
                  alias: property.property.value, // TODO!!!
                  uri: property.property.value,
                  type: $scope.getType(property.propertyType.value),
                  propertyType: property.propertyType.value, // URI des
                  view: true,
                  operator: "MUST", //Vorprojekt okay
                  link : {},
                  arithmetic : {} , //Vorprojekt leave empty
                  compare : {} //Vorprojekt leave empty
              }
          );
      }
  });

  //Return type based on propertyType TODO!!!-> Distinction OBJECT_PROPERTY || DATATYPE_PROPERTY
  $scope.getType = function (propertyType) {
      return "OBJECT_PROPERTY";
  }

  //Adds the selected property in dropdown to selectedProperties
  $scope.addProperty = function(){
    $selectedProperties.push(angular.copy($scope.propertySelected));
    $scope.propertySelected = '';
  }

  //Removes the selected from selectedProperties
  $scope.removeProperty = function(propertyInst) {
    $selectedProperties.splice($selectedProperties.indexOf(propertyInst), 1);
  }

  //TODO: Change visibility of property

  //TODO: Link Objectproperty with another subject
}]);