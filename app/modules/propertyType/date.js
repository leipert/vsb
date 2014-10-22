'use strict';

/**
 * Property directive
 * Creates the possibility to use a <property> element,
 * which will be replaced with the contents of template/date.html
 */

angular.module('GSB.propertyType.date', ['ui.bootstrap','GSB.config'])
    .directive('datePropertyDir', function () {
        return {
            restrict: 'A',
            replace: true,
            controller: 'DatePropertyCtrl',
            templateUrl: '/modules/propertyType/date.tpl.html'
        };
    })
    .controller('DatePropertyCtrl', function ($scope) {

        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        var start = angular.copy($scope.propertyInst.compareRaw);

        //Rules for date comparisons
        $scope.allowedDateComparisons = [
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

        $scope.getDateComparisonLabel = function(key){
            return $scope.allowedDateComparisons[key].label;
        };

        $scope.changeDateComparison = function(key){
            $scope.dateComparison = key;
        };

        $scope.dateComparison = 0;
        $scope.comparisonInput = new Date();


        if (start !== null && start !== undefined) {
            if (start.dateComparison !== null && start.dateComparison !== undefined) {
                $scope.dateComparison = start.dateComparison;
            }
            if (start.comparisonInput !== null && start.comparisonInput !== undefined) {
                $scope.comparisonInput = new Date(start.comparisonInput);
            }
        }

        //Observers for date comparison

        $scope.$watch('dateComparison', function (newValue) {
            $scope.propertyInst.compareRaw.dateComparison = newValue;
            renderDate();
        });


        $scope.$watch('comparisonInput', function (newValue) {
            $scope.propertyInst.compareRaw.comparisonInput = newValue;
            renderDate();
        });

        /*
         * Updates comparison for date properties
         */

        function renderDate() {
            if ($scope.dateComparison !== null && $scope.comparisonInput instanceof Date) {
                var date = $scope.comparisonInput;
                $scope.propertyInst.compare =
                    $scope.allowedDateComparisons[$scope.dateComparison].f
                        .replace(/%input_start_of_day%/g, moment(date).hour(0).minute(0).second(0).format())
                        .replace(/%input_end_of_day%/g, moment(date).hour(23).minute(59).second(59).format());

            } else {
                $scope.propertyInst.compare = null;
            }
        }

    });
