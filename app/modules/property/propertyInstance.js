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

    function PropertyInstanceCtrl($scope, SubjectService, connectionService, $modal) {

        var property = $scope.property;

        connectionService.addMapping(property.$id, $scope.$id);

        var vm = this;

        vm.editAlias = false;

        vm.addAppropriateClass = function () {
            $modal.open({
                templateUrl: '/modules/modals/addAppropriateClass.tpl.html',
                controller: 'addAppropriateClassCtrl',
                resolve: {
                    subject: function () {
                        return SubjectService.getSubjectById(property.subject.$id);
                    },
                    property: function () {
                        return property;
                    }
                }
            });
        };

        vm.toggle = function (key) {
            if (property.hasOwnProperty(key)) {
                property[key] = !property[key];
            }
        };

        vm.removeProperty = function (id) {
            SubjectService.getSubjectById(property.subject.$id).forEach(function (subject) {
                subject.removeProperty(id);
            });
        };

    }
})();