'use strict';

/* Property Controller */

angular.module('GSB.controllers.property', [])
  //Inject $scope, $http and globalConfig (see @ js/config.js) into controller
  .controller('PropertyCtrl', ['$scope', '$http', 'globalConfig', function($scope, $http, globalConfig) {

    //Named a few variables, for shorter access
    var $parentSubject = $scope.subjectInst,
      $selectedProperties = $parentSubject.selectedProperties;
    $parentSubject.availableProperties = {};
    $scope.propertyOperators = globalConfig.propertyOperators;

    console.log('Lade die Properties von ' + $parentSubject.uri);
    //Retrieve Properties from Server and add them to availableProperties
    $http.get($parentSubject.uri).success(function (data){
      $parentSubject.availableProperties = {};
      var returnedProperties = data.results.bindings;
      for (var key in returnedProperties){
        if(returnedProperties.hasOwnProperty(key)){
          $scope.addToAvailableProperties(returnedProperties[key]);
        }
      }
    });

    //Returns whether a property is an Object Property
    $scope.isObjectProperty = function (propertyType) {
      var dataTypeURIs = globalConfig['dataTypeURIs'];
      for(var key in dataTypeURIs){
        if(dataTypeURIs.hasOwnProperty(key) && propertyType.startsWith(dataTypeURIs[key])){
          return false;
        }
      }
      return true;
    };

    //Adds Property to availableProperties.
    $scope.addToAvailableProperties = function (property) {
      var propertyURI = property.property.value,
        propertyType = property.propertyType.value,
        isObjectProperty = ($scope.isObjectProperty(propertyType));
      if($parentSubject.availableProperties.hasOwnProperty(propertyURI)){
        $parentSubject.availableProperties[propertyURI].propertyType.push(propertyType);
      }else {
        $parentSubject.availableProperties[propertyURI] = {
          alias: property.propertyAlias.value,
          uri: propertyURI,
          type: isObjectProperty ? 'OBJECT_PROPERTY' : 'DATATYPE_PROPERTY',
          isObjectProperty: isObjectProperty,
          propertyType: [propertyType],
          view: true,
          operator: "MUST", //Vorprojekt okay
          link : {direction: "TO", linkPartner: null}, //Vorprojekt okay
          arithmetic : {} , //Vorprojekt leave empty
          compare : {} //Vorprojekt leave empty
        };
      }
    };

    //Adds the selected property in dropdown to selectedProperties
    $scope.addProperty = function(){
      $selectedProperties.push(angular.copy($scope.propertySelected));
      $scope.propertySelected = '';
    };

    //Removes the selected from selectedProperties
    $scope.removeProperty = function(propertyInst) {
      $selectedProperties.splice($selectedProperties.indexOf(propertyInst), 1);
    };

    //Change visibility of a property
    $scope.togglePropertyView = function(propertyInst) {
      propertyInst.view = !propertyInst.view;
    };

  }]);