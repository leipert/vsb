(function () {
    'use strict';

    /**
     * Property directive
     * Creates the possibility to use a <property> element,
     * which will be replaced with the contents of template/property.html
     */

    angular.module('VSB.propertyType.number', ['VSB.config'])
        .directive('numberPropertyDir', numberPropertyDir)
        .filter('replace', function () {
            return function (string, replacementObject) {
                if (!_.isString(string) || !_.isObject(replacementObject)) {
                    return string;
                }

                _.forEach(replacementObject, function (value, key) {
                    string = string.replace(key, value);
                });

                return string;
            };
        })
        //limitates the input characters on a number input field
        .directive('limitInput', limitInput);

    function numberPropertyDir() {
        return {
            restrict: 'A',
            replace: true,
            controller: NumberPropertyCtrl,
            controllerAs: 'vm',
            scope: {
                property: '='
            },
            templateUrl: '/modules/workspace/propertyType/number.tpl.html'
        };
    }

    function NumberPropertyCtrl($scope) {

        var property = $scope.property;

        var vm = this;

        var start = angular.copy(property.compareRaw);

        vm.numberArithmetic = 'x';
        vm.numberComparison = 'y';


        if (start !== null && start !== undefined) {
            if (start.numberArithmetic !== null && start.numberArithmetic !== undefined) {
                vm.numberArithmetic = start.numberArithmetic;
            }
            if (start.numberComparison !== null && start.numberComparison !== undefined) {
                vm.numberComparison = start.numberComparison;
            }
        }

        //Observes and updates the values of the chosen number arithmetics
        $scope.$watch('vm.numberArithmetic', function (newValue) {
            if (newValue === '' || newValue === null || newValue === undefined) {
                newValue = 'x';
            }
            property.compareRaw.numberArithmetic = newValue;
            if (newValue === 'x') {
                property.arithmetic = null;
            } else {
                property.arithmetic = newValue.replace(/x/g, '%before_arithmetic%');
            }
        });

        $scope.$watch('vm.numberComparison', function (newValue) {
            if (newValue === '' || newValue === null || newValue === undefined) {
                newValue = 'y';
            }
            property.compareRaw.numberComparison = newValue;
            if (newValue === 'x' || newValue === 'y') {
                property.compare = null;
            } else {
                property.compare = newValue
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