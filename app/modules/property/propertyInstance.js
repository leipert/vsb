(function () {
    'use strict';

    /**
     * PropertyInstanceCtrl
     * Controller for a single property.
     */

    angular.module('GSB.property.instance', ['GSB.config', 'GSB.filters', 'GSB.arrowService'])
        //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
        .directive('propertyDir', propertyDir);

    function propertyDir() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                property: '='
            },
            controller: PropertyInstanceCtrl,
            controllerAs: 'vm',
            templateUrl: '/modules/property/property.tpl.html'
        };
    }

    function PropertyInstanceCtrl($scope, SubjectService, connectionService) {

        var property = $scope.property;

        connectionService.addMapping(property.$id, $scope.$id);

        var vm = this;

        vm.editAlias = false;

        /**
         * Changes visibility of a given propertyInst
         */
        vm.toggle = function (key) {
            if (property.hasOwnProperty(key)) {
                property[key] = !property[key];
            }
        };

        vm.removeProperty = function (id) {
            _.where(SubjectService.subjects, {$id: property.subject.$id}).forEach(function (subject) {
                subject.removeProperty(id);
            });
        };

    }
})();