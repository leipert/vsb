(function () {
    'use strict';

    /**
     * Property directive
     * Creates the possibility to use a <property> element,
     * which will be replaced with the contents of template/property.html
     */

    angular.module('GSB.propertyType.number', ['GSB.config'])
        .directive('numberPropertyDir', numberPropertyDir)
        //limitates the input characters on a number input field
        .directive('limitInput', limitInput);

    function numberPropertyDir() {
        return {
            restrict: 'A',
            replace: true,
            controller: NumberPropertyCtrl,
            templateUrl: '/modules/propertyType/number.tpl.html'
        };
    }

    function NumberPropertyCtrl($scope) {
        $scope.numberArithmetic = '';


        var start = angular.copy($scope.propertyInst.compareRaw);

        $scope.numberArithmetic = 'x';
        $scope.numberComparison = 'y';


        if (start !== null && start !== undefined) {
            if (start.numberArithmetic !== null && start.numberArithmetic !== undefined) {
                $scope.numberArithmetic = start.numberArithmetic;
            }
            if (start.numberComparison !== null && start.numberComparison !== undefined) {
                $scope.numberComparison = start.numberComparison;
            }
        }

        //Observes and updates the values of the chosen number arithmetics
        $scope.$watch('numberArithmetic', function (newValue) {
            if (newValue === '' || newValue === null || newValue === undefined) {
                newValue = 'x';
            }
            $scope.propertyInst.compareRaw.numberArithmetic = newValue;
            if (newValue === 'x') {
                $scope.propertyInst.arithmetic = null;
            } else {
                $scope.propertyInst.arithmetic = newValue.replace(/x/g, '%before_arithmetic%');
            }
        });

        $scope.$watch('numberComparison', function (newValue) {
            if (newValue === '' || newValue === null || newValue === undefined) {
                newValue = 'y';
            }
            $scope.propertyInst.compareRaw.numberComparison = newValue;
            if (newValue === 'x' || newValue === 'y') {
                $scope.propertyInst.compare = null;
            } else {
                $scope.propertyInst.compare = newValue
                    .replace(/x/g, '%before_arithmetic%')
                    .replace(/y/g, '%after_arithmetic%');
            }
        });

    }

    function limitInput() {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {

                function createNewParser(attrs) {
                    return function (inputValue) {
                        var regEx = new RegExp(attrs.limitInput, 'g');
                        var transformedInput = inputValue.toLowerCase().replace(regEx, '');
                        transformedInput = transformedInput.replace(/\s+/g, ' ');
                        if (transformedInput !== inputValue) {
                            modelCtrl.$setViewValue(transformedInput);
                            modelCtrl.$render();
                        }

                        return transformedInput;

                    };

                }

                modelCtrl.$parsers.push(createNewParser(attrs));
            }
        };
    }
})();