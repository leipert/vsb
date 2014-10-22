'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyType.object', ['GSB.config'])
    //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
    .controller('ObjectPropertyCtrl', function ($scope, ArrowService) {
        //Observes and updates the values of linked partner of the choosen object properties

        var lastConnection = null;

        function setLastConnection(connection) {
            lastConnection = connection;
        }

        $scope.$watch('propertyInst.alias', function (nv) {
            ArrowService.updateConnectionLabel(lastConnection, nv);
        });

        $scope.$watch('propertyInst.linkTo', function (nv) {
            ArrowService.detach(lastConnection);
            if (nv !== undefined && nv !== null) {
                $scope.propertyInst.linkTo = nv;
                var source = angular.copy($scope.propertyInst.$id),
                    target = angular.copy(nv.$id),
                    connectionLabel = $scope.propertyInst.alias;
                if ($scope.subjectInst.$id === target) {
                    ArrowService.connectToSelf(source).then(setLastConnection);
                } else {
                    var inverse = false;
                    if($scope.propertyInst.type === 'INVERSE_PROPERTY'){
                        inverse = true;
                    }
                    ArrowService.connect(source, target, connectionLabel, inverse).then(setLastConnection);
                }
            }

        });

    });