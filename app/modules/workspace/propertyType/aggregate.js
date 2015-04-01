(function () {
    'use strict';

    /**
     * Property directive
     * Creates the possibility to use a <property> element,
     * which will be replaced with the contents of template/property.html
     */

    angular.module('VSB.propertyType.aggregate', [])
        .directive('aggregatePropertyDir', aggregatePropertyDir)
        .filter('aggregatePropertyFilter', aggregatePropertyFilter);

    function aggregatePropertyDir() {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                property: '='
            },
            controllerAs: 'vm',
            controller: AggregatePropertyCtrl,
            templateUrl: '/modules/workspace/propertyType/aggregate.tpl.html'
        };
    }

    function AggregatePropertyCtrl($scope, SubjectService) {

        var property = $scope.property;

        var vm = this;
        vm.availableProperties = [];

        $scope.$watchCollection(function () {
            return SubjectService.getSubjectById(property.$subject.$id).$selectedProperties;
        }, function (nv) {
            vm.availableProperties = _.reject(nv, {type: 'AGGREGATE_PROPERTY'});
        });

    }

    function aggregatePropertyFilter() {
        return function (arrayOfObjects, filter) {
            if (!_.isEmpty(filter)) {
                arrayOfObjects = _.filter(arrayOfObjects, {type: filter});
            }
            return arrayOfObjects;

        };
    }

})();