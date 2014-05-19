'use strict';

/**
 * PropertyCollectionCtrl
 * Controller which holds all the properties of a subject.
 */

angular.module('GSB.controllers.propertyCollection', ['GSB.config', 'GSB.services.endPoint'])
//Inject $scope, $http, $log and globalConfig (see @js/config.js, @js/services/endPoint.js) into controller
  .controller('PropertyCollectionCtrl', ['$scope', '$http', '$q', '$log', 'globalConfig', 'EndPointService', function($scope, $http, $q, $log, globalConfig, EndPointService) {

    var selectedProperties = $scope.subjectInst.selectedProperties;
	EndPointService.availableProperties = [];
    EndPointService.getProperties($scope.subjectInst.uri)
      .then(function(data) {
        $scope.subjectInst.availableProperties = data;
      }, function(error) {
        $log.error(error);
      });

    $scope.propertyOperators = globalConfig.propertyOperators;

    /**
     * Adds a property selected from the availableProperties of a
     * subjectInst to the selectedProperties of the same subjectInst
     */
    $scope.addProperty = function(){
      var temp = angular.copy($scope.propertySelected);
      temp.operator = 'MUST';
      temp.link.direction = 'TO';
      temp.arithmetic = null;
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

    /**
     * Adds an aggregate selected from the availableAggregates of a
     * subjectInst to the selectedAggregates of the same subjectInst
     */
    $scope.addAggregate = function(){
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
    
    /**
     * Removes a given aggregateInst from the selectedAggregates of the subjectInst
     * @param aggregateInst 
     */
    $scope.removeAggregate = function(aggregateInst){
      $scope.subjectInst.selectedAggregates.splice($scope.subjectInst.selectedAggregates.indexOf(aggregateInst),1);
    };
    
    $scope.$parent.$parent.$on('WorkspaceUpdateFromJSONEvent', function(scope, newWorkspaceContent){
      $scope.fillScopeWithProperties(newWorkspaceContent);
    });
    
    $scope.addPropertyObject = function(propertyObject){
      $log.info('Property added');
      selectedProperties.push(propertyObject);      
    };
    
    $scope.fillScopeWithProperties = function(newWorkspaceContent){
      for(var i = 0; i < newWorkspaceContent[0].length; i++) {
          for(var j = 0; j < newWorkspaceContent[0][i].selectedProperties.length; j++){
            $scope.addPropertyObject(newWorkspaceContent[0][i].selectedProperties[j]);
//            alert(JSON.stringify($scope.subjectInst.selectedProperties[j]));
//            alert(JSON.stringify(newWorkspaceContent[0][i].selectedProperties[j]));
        }      
      }
    };

  }]);
