(function () {
    'use strict';

    /**
     * Property directive
     * Creates the possibility to use a <property> element,
     * which will be replaced with the contents of template/property.html
     */

    angular.module('GSB.propertyType.string', ['GSB.config'])
        .directive('stringPropertyDir', stringPropertyDir);

    function stringPropertyDir() {
        return {
            restrict: 'A',
            replace: true,
            controller: StringPropertyCtrl,
            controllerAs: 'vm',
            scope: {
                property: '=',
                hideLanguageFilter : '=hideLanguage'
            },
            templateUrl: '/modules/propertyType/string.tpl.html'
        };
    }

    function StringPropertyCtrl($scope, $http, globalConfig) {

        var property = $scope.property;

        var vm = this;

        var start = angular.copy(property.compareRaw);

        //Rules for String comparisons
        vm.allowedStringComparisons = [
            {
                label: 'CONTAINS',
                f: 'regex(%after_arithmetic%, "%input%", "i")',
                showFlags: false
            },
            {
                label: 'EQUALS',
                f: '(str(%after_arithmetic%)="%input%")',
                showFlags: false
            },
            {
                label: 'EQUALS_NOT',
                f: '(str(%after_arithmetic%)!="%input%")',
                showFlags: false
            },
            {
                label: 'STARTS_WITH',
                f: 'regex(%after_arithmetic%, "^%input%", "i")',
                showFlags: false
            },
            {
                label: 'ENDS_WITH',
                f: 'regex(%after_arithmetic%, "%input%$", "i")',
                showFlags: false

            },
            {
                label: 'REGEX',
                f: 'regex(%after_arithmetic%, "%input%", "%flags%")',
                showFlags: true
            }
        ];

        vm.allowedLanguages = globalConfig.allowedLanguages;

        vm.stringComparison = null;
        vm.comparisonInput = '';
        vm.comparisonRegexFlags = 'i';

        $scope.getStringComparisonLabel = function () {
            if (vm.stringComparison === null) {
                return 'NO_COMPARISON';
            }
            return vm.allowedStringComparisons[vm.stringComparison].label;
        };

        $scope.changeStringComparison = function (key) {
            vm.stringComparison = key;
        };

        if (start !== null && start !== undefined) {
            if (start.selectedLanguage !== null && start.selectedLanguage !== undefined) {
                vm.selectedLanguage = start.selectedLanguage;
            }
            if (start.stringComparison !== null && start.stringComparison !== undefined) {
                vm.stringComparison = start.stringComparison;
            }
            if (start.comparisonInput !== null && start.comparisonInput !== undefined) {
                vm.comparisonInput = start.comparisonInput;
            }
            if (start.comparisonRegexFlags !== null && start.comparisonRegexFlags !== undefined) {
                vm.comparisonRegexFlags = start.comparisonRegexFlags;
            }
        }

        //Observers for String comparisons
        $scope.$watch('vm.stringComparison', function (newValue) {
            renderComparison(newValue, vm.comparisonInput, vm.comparisonRegexFlags);
            property.compareRaw.stringComparison = newValue;
            if (newValue !== null) {
                vm.showFlags = vm.allowedStringComparisons[newValue].showFlags;
            }
        });


        $scope.$watch('vm.comparisonInput', function (newValue) {
            property.compareRaw.comparisonInput = newValue;
            renderComparison(vm.stringComparison, newValue, vm.comparisonRegexFlags);
        });


        $scope.$watch('vm.comparisonRegexFlags', function (newValue) {
            property.compareRaw.comparisonRegexFlags = newValue;
            renderComparison(vm.stringComparison, vm.comparisonInput, newValue);
        });

        /*
         * Handles updates comparison for String properties
         */
        function renderComparison(method, input, flags) {
            if (input === null || input === undefined || input === '' || method === undefined || method === null) {
                property.compare = null;
                renderLangCompare();
                return;
            }
            property.compare = vm.allowedStringComparisons[method].f.replace(/%input%/, input).replace(/%flags%/, flags);
            renderLangCompare();
        }

        vm.selectedLanguage = null;

        $scope.$watch('vm.selectedLanguage', function () {
            renderLangCompare();
        });

        /*
         * Updates comparison for String properties
         */
        function renderLangCompare() {
            property.compareRaw.selectedLanguage = vm.selectedLanguage;
            if (vm.selectedLanguage === null || vm.selectedLanguage === undefined || vm.selectedLanguage === '') {
                property.compare = property.compare;
            } else if (property.compare === null || property.compare === undefined) {
                property.compare = 'langMatches(lang(%after_arithmetic%), "' + vm.selectedLanguage + '")';
            } else {
                property.compare = 'langMatches(lang(%after_arithmetic%), "' + vm.selectedLanguage + '") && ' + property.compare;
            }
        }

    }
})();