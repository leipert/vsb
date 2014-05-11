'use strict';

/**
 * PropertyCollectionCtrl
 * Controller which holds all the properties and inverse properties of a subject.
 */

angular.module('GSB.controllers.propertyCollection', ['GSB.config', 'GSB.services.availableClasses'])
//Inject $scope, $http, $log and globalConfig (see @js/config.js, @js/services/availableClasses.js) into controller
  .controller('PropertyCollectionCtrl', ['$scope', '$http', '$q', '$log', 'globalConfig', 'AvailablePropertiesService', function($scope, $http, $q, $log, globalConfig, AvailablePropertiesService) {

    var selectedProperties = $scope.subjectInst.selectedProperties;
	AvailablePropertiesService.availableProperties = '';
    AvailablePropertiesService.getProperties($scope.subjectInst.uri)
      .then(function(data) {
        $scope.subjectInst.availableProperties = data;
      }, function(error) {
        $log.error(error);
      });

    $scope.propertyOperators = globalConfig.propertyOperators;
    $scope.inversePropertyOperators = globalConfig.inversePropertyOperators;

    /**
     * Adds a property selected from the availableProperties of a
     * subjectInst to the selectedProperties of the same subjectInst
     */
    $scope.addProperty = function(){
      var temp = angular.copy($scope.propertySelected);
      temp.operator = 'MUST';
      temp.link.direction = 'TO';

      selectedProperties.push(temp);
      $scope.propertySelected = '';
    };

    /**
     * Removes a given propertyInst from the selectedProperties of the subjectInst
     * @param propertyInst
     */
    $scope.removeProperty = function(propertyInst) {
      selectedProperties.splice(selectedProperties.indexOf(propertyInst), 1);
    };

    // inverse Properties
    var selectedInverseProperties = $scope.subjectInst.selectedInverseProperties;
    AvailablePropertiesService.getInverseProperties($scope.subjectInst.uri)
      .then(function(data) {
        $scope.subjectInst.availableInverseProperties = data;
      }, function(error) {
        log.error(error);
      });

    /**
     * Adds an inverse property selected from the availableInverseProperties of a
     * subjectInst to the selectedInverseProperties of the same subjectInst
     */
    $scope.addInverseProperty = function(){
      var temp = angular.copy($scope.inversePropertySelected);
      temp.operator = 'IS_OF';
      temp.link.direction = 'FROM';

      selectedInverseProperties.push(temp);
      $scope.propertySelected = '';
    };

    /**
     * Removes a given propertyInst from the selectedInverseProperties of the subjectInst
     * @param propertyInst
     */
    $scope.removeInverseProperty = function(propertyInst) {
      selectedInverseProperties.splice(selectedInverseProperties.indexOf(propertyInst), 1);
    };

    $scope.addAggregate = function(){
      console.log("test");
      $scope.subjectInst.selectedAggregates.push(
        angular.copy(
          {
            alias:"cnt",
            operator:"COUNT",
            type:"AGGREGATE_PROPERTY",
            link: {
              linkPartner:null
            },
            available: angular.copy(globalConfig['aggregateFunctions'])
          }
        ));
    };

    $scope.removeAggregate = function(aggregateInst){
      $scope.subjectInst.selectedAggregates.splice($scope.subjectInst.selectedAggregates.indexOf(aggregateInst),1);
    };

  }]);
