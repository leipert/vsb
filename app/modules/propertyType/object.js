(function () {
    'use strict';

    /**
     * Property directive
     * Creates the possibility to use a <property> element,
     * which will be replaced with the contents of template/property.html
     */

    angular.module('GSB.propertyType.object', ['GSB.arrowService'])
        .directive('objectPropertyDir', objectPropertyDir)
        .filter('objectPropertyFilter', objectPropertyFilter);

    function objectPropertyDir() {
        return {
            restrict: 'A',
            replace: true,
            controller: ObjectPropertyCtrl,
            templateUrl: '/modules/propertyType/object.tpl.html'
        };
    }

    function ObjectPropertyCtrl($scope, ArrowService) {
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
                    if ($scope.propertyInst.type === 'INVERSE_PROPERTY') {
                        inverse = true;
                    }
                    ArrowService.connect(source, target, connectionLabel, inverse).then(setLastConnection);
                }
            }

        });

    }

    function objectPropertyFilter() {
        return function (arrayOfObjects, key, filter) {
            if (key === null || key === undefined || typeof filter !== 'object' || filter.length === 0) {
                return arrayOfObjects;
            }
            return arrayOfObjects.filter(function (currentObject) {
                    if (currentObject[this.key] === undefined) {
                        return true;
                    }
                    for (var i = 0, j = this.filter.length; i < j; i++) {
                        if (currentObject[this.key].indexOf(this.filter[i]) !== -1) {
                            return true;
                        }
                    }
                    return false;
                }, {key: key, filter: filter}
            );
        };
    }


})();