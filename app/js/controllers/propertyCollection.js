'use strict';

/**
 * PropertyCollectionCtrl
 * Controller which holds all the properties of a subject.
 */

angular.module('GSB.controllers.propertyCollection', ['GSB.config', 'GSB.services.availableClasses'])
//Inject $scope, $http, $log and globalConfig (see @js/config.js, @js/services/availableClasses.js) into controller
  .controller('PropertyCollectionCtrl', ['$scope', '$http', '$log', 'globalConfig', 'AvailableClassesService', function($scope, $http, $log, globalConfig, AvailableClassesService) {

    //Named a few variables, for shorter access
    var $parentSubject = $scope.subjectInst,
      $selectedProperties = $parentSubject.selectedProperties;
    $parentSubject.availableProperties = {};
    $scope.propertyOperators = globalConfig.propertyOperators;

    /**
     * Adds a property selected from the availableProperties of a
     * subjectInst to the selectedProperties of the same subjectInst
     */
    $scope.addProperty = function(){
      $selectedProperties.push(angular.copy($scope.propertySelected));
      $scope.propertySelected = '';
    };

    /**
     * Removes a given propertyInst from the selectedProperties of the subjectInst
     * @param propertyInst
     */
    $scope.removeProperty = function(propertyInst) {
      $selectedProperties.splice($selectedProperties.indexOf(propertyInst), 1);
    };

    /** FOLGENDES MUSS AUS DIESEM CONTROLLER RAUS!
     * TODO-SIGGI: Move the stuff below to the availableClasses/endPoint - Service.
     * **/

    $log.info('Lade die Properties von ' + $parentSubject.uri);

    //Retrieve Properties from Server and add them to availableProperties
    $http.get(globalConfig.baseURL + $parentSubject.uri).success(function (data){
      $log.info(' Properties loaded from: ' + $parentSubject.uri, data);
      $parentSubject.availableProperties = {};
      var returnedProperties = data.results.bindings;
      for (var key in returnedProperties){
        if(returnedProperties.hasOwnProperty(key)){
          $scope.addToAvailableProperties(returnedProperties[key]);
        }
      }
    }).error(function(){
      $log.error('Error loading properties from: ' + $parentSubject.uri)
    });

    /**
     * Returns whether an property is an objectProperty
     * @param propertyRange
     * @returns {boolean}
     */
    $scope.isObjectProperty = function (propertyRange) {
      var dataTypeURIs = globalConfig['dataTypeURIs'];
      for(var key in dataTypeURIs){
        if(dataTypeURIs.hasOwnProperty(key) && propertyRange.startsWith(dataTypeURIs[key])){
          return false;
        }
      }
      return true;
    };

    /**
     * Adds a given property to the availableProperties of a subjectInst
     * @param property
     * @namespace property.propertyURI
     */
    $scope.addToAvailableProperties = function (property) {
      var propertyURI = property.propertyURI.value,
        propertyRange = property.propertyRange.value,
        isObjectProperty = ($scope.isObjectProperty(propertyRange));
      if($parentSubject.availableProperties.hasOwnProperty(propertyURI)){
        $parentSubject.availableProperties[propertyURI].propertyRange.push(propertyRange);
      }else {
        $parentSubject.availableProperties[propertyURI] = {
          alias: property.propertyAlias.value,
          uri: propertyURI,
          type: isObjectProperty ? 'OBJECT_PROPERTY' : 'DATATYPE_PROPERTY',
          isObjectProperty: isObjectProperty,
          propertyRange: [propertyRange],
          view: true,
          operator: "MUST", //Vorprojekt okay
          link : {direction: "TO", linkPartner: null}, //Vorprojekt okay
          arithmetic : {} , //Vorprojekt leave empty
          compare : {} //Vorprojekt leave empty
        };
      }
    };

  }]);