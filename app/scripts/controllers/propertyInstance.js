'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyInstance', ['GSB.config'])
  //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
  .controller('PropertyInstanceCtrl', ['$scope', '$http', '$log', 'globalConfig', function($scope, $http, $log, globalConfig) {

    /**
     * Changes visibility of a given propertyInst
     */
    $scope.togglePropertyView = function () {
      $scope.propertyInst.view = !$scope.propertyInst.view;
    };
	
	
	/**
     * Changes optionality of a given propertyInst
     */
	$scope.togglePropertyOptional = function () {
      $scope.propertyInst.optional = !$scope.propertyInst.optional;
    };

    $scope.$watch('propertyInst.linkTo',function(nv){
      if(typeof nv === 'string'){
        var subjects = $scope.subjects;
        for (var i = 0, j = subjects.length; i < j; i++) {
          if(subjects[i].hasOwnProperty('alias') && subjects[i].alias === nv){
            $scope.propertyInst.linkTo = subjects[i];
            return;
          }
        }
      }
    });

	
  }]);