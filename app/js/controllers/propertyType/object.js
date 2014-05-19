'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyType.object', ['GSB.config'])
  //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
  .controller('ObjectPropertyCtrl', ['$scope', '$http', '$log', 'globalConfig', function($scope, $http, $log, globalConfig) {
    $scope.$watch('propertyInst.link.linkPartner',function(nv,ov){
//      if(nv === ov || $scope.propertyInst.link.linkPartner === nv){
//        return;
//      }propertyInst.link.linkPartner
      if(nv !== undefined && nv !== null) {
        $scope.propertyInst.link.linkPartner = nv;
//        alert("objectprop linkpartner changed to" + nv);
      }
    });

  }]);