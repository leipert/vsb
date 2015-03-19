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

    function PropertyInstanceCtrl($scope, SubjectService, connectionService, $modal, ArrowService, $timeout) {

        var property = $scope.property;

        property.$addAppropriateClass = addAppropriateClass;

        connectionService.addMapping(property.$id, $scope.$id);

        var vm = this;

        vm.toggle = toggle;

        vm.dropdownConfig = [
            {
                hide: function () {
                    return !(property.filterExists && property.hasFilter);
                },
                click: function () {
                    toggle('hasFilter');
                },
                template: '<i class="fa fa-fw fa-filter"></i> {{"REMOVE_FILTER" | translate}}'
            },
            {
                hide: function () {
                    return !(property.filterExists && !property.hasFilter);
                },
                click: function () {
                    toggle('hasFilter');
                },
                template: '<i class="fa fa-fw fa-filter"></i> {{"ADD_FILTER" | translate}}'
            },
            {
                field: 'filterExists',
                click: function () {
                    toggle('filterExists');
                },
                templateArray: [
                    '<i class="fa fa-fw fa-check-square-o"></i> {{ "EXISTS" | translate }}',
                    '<i class="fa fa-fw fa-square-o"></i> {{ "EXISTS_NOT" | translate }}'
                ]
            },
            {
                hide: function () {
                    return !(property.filterExists && property.optional);
                },
                click: function () {
                    toggle('optional');
                },
                template: '<i class="fa fa-fw fa-exclamation-circle"></i> {{"IS_MANDATORY" | translate}}'
            },
            {
                hide: function () {
                    return !(property.filterExists && !property.optional);
                },
                click: function () {
                    toggle('optional');
                },
                template: '<i class="fa fa-fw fa-question-circle"></i> {{"IS_OPTIONAL" | translate}}'
            },
            {
                field: 'view',
                click: function () {
                    toggle('view');
                },
                templateArray: [
                    '<i class="fa fa-fw fa-eye"></i> {{ "SHOW_PROPERTY" | translate }}',
                    '<i class="fa fa-fw fa-eye-slash"></i> {{ "HIDE_PROPERTY" | translate }}'
                ]
            },
            {
                hide: function () {
                    return !(property.type === 'OBJECT_PROPERTY' || property.type === 'INVERSE_PROPERTY');
                },
                click: function () {
                    addAppropriateClass();
                },
                template: '<i class="fa fa-fw fa-plug"></i> {{"ADD_APPROPRIATE_CLASS" | translate}}'
            },
            {
                hide: function () {
                    return !(property.type !== 'OBJECT_PROPERTY' && property.type !== 'INVERSE_PROPERTY' && property.type !== 'AGGREGATE_PROPERTY');
                },
                click: function () {
                    castProperty();
                },
                template: '<i class="fa fa-fw fa-magic"></i> {{"CAST_PROPERTY" | translate}}'
            },
            {
                click: function () {
                    vm.removeProperty(property.$id);
                },
                template: '<i class="fa fa-fw fa-trash-o"></i> {{"DELETE_PROPERTY" | translate}}'
            }
        ];

        vm.editAlias = false;

        function addAppropriateClass() {
            $modal.open({
                template: '/modules/modals/addAppropriateClass.tpl.html',
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
        }

        function castProperty() {
            $modal.open({
                template: '/modules/modals/castProperty.tpl.html',
                controller: 'castPropertyCtrl',
                resolve: {
                    property: function () {
                        return property;
                    }
                }
            });
        }

        function toggle(key) {
            if (property.hasOwnProperty(key)) {
                property[key] = !property[key];
                $timeout(function () {
                    connectionService.getScopeID(property.subject.$id).then(function (id) {
                        ArrowService.repaintEverything(id);
                    });
                });
            }
        }

        vm.removeProperty = function (id) {
            SubjectService.getSubjectById(property.subject.$id)
                .removeProperty(id);

        };

    }
})();