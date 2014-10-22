(function () {
    'use strict';

    /**
     * Property directive
     * Creates the possibility to use a <property> element,
     * which will be replaced with the contents of template/property.html
     */

    angular.module('GSB.propertyType.aggregate', [])
        .directive('aggregatePropertyDir', aggregatePropertyDir)
        .filter('aggregatePropertyFilter', aggregatePropertyFilter);

    function aggregatePropertyDir() {
        return {
            restrict: 'E',
            replace: true,
            controller: AggregatePropertyCtrl,
            templateUrl: '/modules/propertyType/aggregate.tpl.html'
        };
    }

    function AggregatePropertyCtrl($scope) {
        //Observes and updates the values of the choosen aggregate properties
        $scope.$watch('selected', function (nv) {
            if (nv !== undefined && nv !== null) {
                $scope.propertyInst.alias = nv.alias;
                $scope.propertyInst.operator = nv.operator;
                if (nv.restrictTo !== null && $scope.linkTo !== undefined && $scope.linkTo !== null) {
                    if (nv.restrictTo !== $scope.linkTo.type) {
                        $scope.linkTo = null;
                    }
                }
            }
        });
        $scope.$watch('link', function (nv) {
            if (nv !== undefined && nv !== null) {
                $scope.propertyInst.linkTo = nv.alias;
            }
        });
    }

    function aggregatePropertyFilter() {
        return function (arrayOfObjects, filter) {
            if (filter === null || filter === undefined || !filter.hasOwnProperty('restrictTo') || filter.restrictTo === null) {
                return arrayOfObjects;
            }
            return arrayOfObjects.filter(
                function (currentObject) {
                    return currentObject.type === this.restrictTo;
                },
                filter
            );
        };
    }

})();