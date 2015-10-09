(function () {
    'use strict';

    /**
     * Property directive
     * Creates the possibility to use a <property> element,
     * which will be replaced with the contents of template/date.html
     */

    angular.module('VSB.propertyType.date', ['zenubu.ngStrap'])
        .directive('datePropertyDir', datePropertyDir);
    function datePropertyDir() {
        return {
            restrict: 'A',
            replace: true,
            controller: DatePropertyCtrl,
            controllerAs: 'vm',
            scope: {
                property: '='
            },
            templateUrl: '/modules/workspace/propertyType/date.tpl.html'
        };
    }

    function DatePropertyCtrl($scope) {

        var property = $scope.property;

        var vm = this;

        vm.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened = true;
        };


        var start = angular.copy(property.compareRaw);

        //Rules for date comparisons
        vm.allowedDateComparisons = [
            {
                label: 'EQUALS',
                f: 'xsd:dateTime(%after_arithmetic%) >= "%input_start_of_day%"^^xsd:dateTime' +
                '&& xsd:dateTime(%after_arithmetic%) <= "%input_end_of_day%"^^xsd:dateTime'
            },
            {
                label: 'EQUALS_NOT',
                f: 'xsd:dateTime(%after_arithmetic%) < "%input_start_of_day%"^^xsd:dateTime' +
                '|| xsd:dateTime(%after_arithmetic%) > "%input_end_of_day%"^^xsd:dateTime'
            },
            {
                label: 'AFTER',
                f: 'xsd:dateTime(%after_arithmetic%) > "%input_end_of_day%"^^xsd:dateTime'
            },
            {
                label: 'BEFORE',
                f: 'xsd:dateTime(%after_arithmetic%) < "%input_start_of_day%"^^xsd:dateTime'
            }
        ];

        vm.dropdown = _.map(vm.allowedDateComparisons, function (comp, key) {
            return {
                click: function () {
                    vm.changeDateComparison(key);
                },
                template: '{{ "' + comp.label + '" | translate}}'
            };
        });

        vm.getDateComparisonLabel = function (key) {
            return vm.allowedDateComparisons[key].label;
        };

        vm.changeDateComparison = function (key) {
            vm.dateComparison = key;
        };

        vm.dateComparison = 0;
        vm.comparisonInput = new Date();


        if (start !== null && start !== undefined) {
            if (start.dateComparison !== null && start.dateComparison !== undefined) {
                vm.dateComparison = start.dateComparison;
            }
            if (start.comparisonInput !== null && start.comparisonInput !== undefined) {
                vm.comparisonInput = new Date(start.comparisonInput);
            }
        }

        //Observers for date comparison

        $scope.$watch('vm.dateComparison', function (newValue) {
            property.compareRaw.dateComparison = newValue;
            property.compare = '';
            renderDate();
        });


        $scope.$watch('vm.comparisonInput', function (newValue) {
            property.compareRaw.comparisonInput = newValue;
            property.compare = '';
            renderDate();
        });

        /*
         * Updates comparison for date properties
         */

        function renderDate() {
            if (vm.dateComparison !== null && vm.comparisonInput instanceof Date) {
                var date = vm.comparisonInput;
                property.compare =
                    vm.allowedDateComparisons[vm.dateComparison].f
                        .replace(/%input_start_of_day%/g, moment(date).hour(0).minute(0).second(0).format())
                        .replace(/%input_end_of_day%/g, moment(date).hour(23).minute(59).second(59).format());

            } else {
                property.compare = null;
            }
        }

    }
})();