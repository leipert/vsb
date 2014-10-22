'use strict';
/**
 * SubjectInstanceCtrl
 * Controller for all subjects.
 * TODO: Rausfinden, warum wir subjectInst benutzen müssen und wie wir das umgehen können.
 */

angular.module('GSB.controllers.subjectInstance', ['GSB.config', 'GSB.services.endPoint'])
    //Inject $scope, $log, EndPointService and globalConfig (see @ js/config.js, @js/services/endPoint.js) into controller
    .controller('SubjectInstanceCtrl', function ($scope, $log, $timeout, $translate, EndPointService, ArrowService) {

        /**
         * Change the View of the given Subject
         */
        $scope.toggleSubjectView = function () {
            $scope.subjectInst.view = !$scope.subjectInst.view;
        };

        EndPointService.getSuperAndEqClasses($scope.subjectInst.uri)
            .then(function (data) {
                $log.debug('SUBJECT Additional Classes loaded for ' + $scope.subjectInst.uri,data);
                $scope.subjectInst.$classURIs = data;
            })
            .catch(function (error) {
                $log.error(error);
            });

        if (!$scope.subjectInst.alias) {
            $translate($scope.subjectInst.uri + '.$label').then(function (label) {
                var alias = label, c = 1;
                while ($scope.doesAliasExist(alias)) {
                    alias = label + '_' + c;
                    c += 1;
                }
                $scope.subjectInst.alias = alias;
                $scope.subjectInst.$id = alias.toLowerCase();
                $timeout(function(){
                    ArrowService.addEndpoint($scope.subjectInst.$id);
                },50);
            });
        }else{
            $scope.subjectInst.$id = $scope.subjectInst.alias.toLowerCase();
            ArrowService.addEndpoint($scope.subjectInst.$id);
        }

    });

