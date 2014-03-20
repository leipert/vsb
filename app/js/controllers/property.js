'use strict';

/* Property Controller */

angular.module('GSB.controllers.property', [])
.controller('PropertyController', ['$scope','$http', function($scope,$http) {

  //Named a few variables, for shorter access
  var $subject = $scope.subject,
  $selectedProperties = $subject.selectedProperties;

  //TODO: Here the availableProperties have to be loaded from the Server / Mockup Data
  console.log('Lade die Properties von ' + $subject.uri);
  $subject.availableProperties = [
    {
      alias: "Property 1",
      uri: "http://a.de/property1"
    },
    {
      alias: "Property 2",
      uri: "http://a.de/property2"
    }
  ];

  $http.get($subject.uri).success(function (data){
      $subject.availableProperties = [];
      var availProperty = data.results.bindings;
      console.log(availProperty)
      for (var key in availProperty){
          var property = availProperty[key];
          $subject.availableProperties.push(
              {
                  alias: property.property.value,
                  uri: property.property.value,
                  type: property.propertyType.value
              }
          );
      }
  });

  //Adds the selected property in dropdown to selectedProperties
  $scope.addProperty = function(){
    $selectedProperties.push(angular.copy($scope.propertySelected));
    $scope.propertySelected = '';
  }

  //Removes the selected from selectedProperties
  $scope.removeProperty = function(property) {
    $selectedProperties.splice($selectedProperties.indexOf(property), 1);
  }
}]);