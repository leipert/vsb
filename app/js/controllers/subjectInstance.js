'use strict';
/**
 * SubjectInstanceCtrl
 * Controller for all subjects.
 * TODO: Rausfinden, warum wir subjectInst benutzen müssen und wie wir das umgehen können.
 */

angular.module('GSB.controllers.subjectInstance', ['GSB.config', 'GSB.services.endPoint'])
    //Inject $scope, $log, EndPointService and globalConfig (see @ js/config.js, @js/services/endPoint.js) into controller
    .controller('SubjectInstanceCtrl', function ($scope, $log, EndPointService) {


        /**
         * Change the View of the given Subject
         */
        $scope.toggleSubjectView = function () {
            $scope.subjectInst.view = !$scope.subjectInst.view;
        };

        EndPointService.getAllClassURIs($scope.subjectInst.uri)
            .then(function (data) {
                $log.info('Additional Classes loaded',data);
                $scope.subjectInst.$classURIs = data;
            })
            .fail(function (error) {
                $log.error(error);
            });

        if($scope.subjectInst.$copied){
            EndPointService.getURIMetaData($scope.subjectInst.uri)
                .then(function (data) {
                    $scope.subjectInst.$comment = data.$comment;
                    $scope.subjectInst.$label = data.$label;
                })
                .fail(function (error) {
                    $log.error(error);
                });

        }



    });

