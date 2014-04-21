'use strict';

/**
 * PropertyCollectionCtrl
 * Controller which holds all the properties of a subject.
 */

angular.module('GSB.controllers.propertyCollection', ['GSB.config', 'GSB.services.availableClasses'])
//Inject $scope, $http, $log and globalConfig (see @js/config.js, @js/services/availableClasses.js) into controller
  .controller('PropertyCollectionCtrl', ['$scope', '$http', '$log', 'globalConfig', 'AvailableClassesService', function($scope, $http, $log, globalConfig, AvailableClassesService) {

    var selectedProperties = $scope.subjectInst.selectedProperties;
    $scope.subjectInst.availableProperties = AvailableClassesService.getProperties($scope.subjectInst.uri);
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
