'use strict';

/**
 * PropertyCollectionCtrl
 * Controller which holds all the properties of a subject.
 */

angular.module('GSB.controllers.propertyCollection', ['GSB.config', 'GSB.services.availableClasses'])
//Inject $scope, $http, $log and globalConfig (see @js/config.js, @js/services/availableClasses.js) into controller
  .controller('PropertyCollectionCtrl', ['$scope', '$http', '$q', '$log', 'globalConfig', 'AvailablePropertiesService', function($scope, $http, $q, $log, globalConfig, AvailablePropertiesService) {

    var selectedProperties = $scope.subjectInst.selectedProperties;
    AvailablePropertiesService.getProperties($scope.subjectInst.uri)
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
      selectedProperties.push(angular.copy($scope.propertySelected));
      $scope.propertySelected = '';
    };

    /**
     * Removes a given propertyInst from the selectedProperties of the subjectInst
     * @param propertyInst
     */
    $scope.removeProperty = function(propertyInst) {
      selectedProperties.splice(selectedProperties.indexOf(propertyInst), 1);
    };

  }]);
