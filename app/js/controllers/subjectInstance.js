'use strict';
/**
 * SubjectInstanceCtrl
 * Controller for all subjects.
 * TODO: Rausfinden, warum wir subjectInst benutzen müssen und wie wir das umgehen können.
 */

angular.module('GSB.controllers.subjectInstance', ['GSB.config'])
  //Inject $scope, $log, AvailableClassesService and globalConfig (see @ js/config.js, @js/services/availableClasses.js) into controller
  .controller('SubjectInstanceCtrl', ['$scope', '$log', 'globalConfig', function ($scope, $log, globalConfig) {


    /**
     * Change the View of the given Subject
     * @param subjectInst
     */
    $scope.toggleSubjectView = function () {
      $scope.subjectInst.view = !$scope.subjectInst.view;
    };

  }]);

