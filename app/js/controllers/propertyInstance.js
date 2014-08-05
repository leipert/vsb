'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyInstance', ['GSB.config'])
    //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
    .controller('PropertyInstanceCtrl', ['$scope', '$log', 'EndPointService', function ($scope, $log, EndPointService) {

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

        if($scope.propertyInst.$copied){
            EndPointService.getProperties($scope.subjectInst.uri,$scope.propertyInst.uri)
                .then(function (data) {
                    data = data[0];
                    $scope.propertyInst.$comment = data.$comment;
                    $scope.propertyInst.$label = data.$label;
                    $scope.propertyInst.$propertyRange = data.$propertyRange;
                    $scope.propertyInst.type = data.type;
                })
                .fail(function (error) {
                    $log.error(error);
                });
        }


        $scope.$watch('propertyInst.$operator',function(nv){
            if(nv === 1){
                $scope.propertyInst.filterNotExists = false;
                $scope.propertyInst.optional = false;
            }else if(nv === 2){
                $scope.propertyInst.filterNotExists = false;
                $scope.propertyInst.optional = true;
            }else if(nv ===3){
                $scope.propertyInst.filterNotExists = true;
            }
        });

        $scope.$watch('propertyInst.linkTo', function (nv) {
            if (typeof nv === 'string') {
                var subjects = $scope.subjects;
                for (var i = 0, j = subjects.length; i < j; i++) {
                    if (subjects[i].hasOwnProperty('alias') && subjects[i].alias === nv) {
                        $scope.propertyInst.linkTo = subjects[i];
                        return;
                    }
                }
            }
        });


    }]);