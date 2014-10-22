'use strict';

/**
 * Property directive
 * Creates the possibility to use a <property> element,
 * which will be replaced with the contents of template/property.html
 */

angular.module('GSB.propertyType.string', ['GSB.config'])
    .directive('stringPropertyDir', function () {
        return {
            restrict: 'A',
            replace: true,
            controller: 'StringPropertyCtrl',
            templateUrl: '/modules/propertyType/string.tpl.html'
        };
    })
    .controller('StringPropertyCtrl', function ($scope, $http, globalConfig) {

        var start = angular.copy($scope.propertyInst.compareRaw);

        //Rules for String comparisons
        $scope.allowedStringComparisons = [
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

        $scope.allowedLanguages = globalConfig.allowedLanguages;

        $scope.stringComparison = null;
        $scope.comparisonInput = '';
        $scope.comparisonRegexFlags = 'i';

        $scope.getStringComparisonLabel = function(){
            if($scope.stringComparison === null){
                return 'NO_COMPARISON';
            }
            return $scope.allowedStringComparisons[$scope.stringComparison].label;
        };

        $scope.changeStringComparison = function(key){
            $scope.stringComparison = key;
        };

        if (start !== null && start !== undefined) {
            if (start.selectedLanguage !== null && start.selectedLanguage !== undefined) {
                $scope.selectedLanguage = start.selectedLanguage;
            }
            if (start.stringComparison !== null && start.stringComparison !== undefined) {
                $scope.stringComparison = start.stringComparison;
            }
            if (start.comparisonInput !== null && start.comparisonInput !== undefined) {
                $scope.comparisonInput = start.comparisonInput;
            }
            if (start.comparisonRegexFlags !== null && start.comparisonRegexFlags !== undefined) {
                $scope.comparisonRegexFlags = start.comparisonRegexFlags;
            }
        }

        //Observers for String comparisons
        $scope.$watch('stringComparison', function (newValue) {
            renderComparison(newValue, $scope.comparisonInput, $scope.comparisonRegexFlags);
            $scope.propertyInst.compareRaw.stringComparison = newValue;
            if (newValue !== null) {
                $scope.showFlags = $scope.allowedStringComparisons[newValue].showFlags;
            }
        });


        $scope.$watch('comparisonInput', function (newValue) {
            $scope.propertyInst.compareRaw.comparisonInput = newValue;
            renderComparison($scope.stringComparison, newValue, $scope.comparisonRegexFlags);
        });


        $scope.$watch('comparisonRegexFlags', function (newValue) {
            $scope.propertyInst.compareRaw.comparisonRegexFlags = newValue;
            renderComparison($scope.stringComparison, $scope.comparisonInput, newValue);
        });

        /*
         * Handles updates comparison for String properties
         */
        function renderComparison(method, input, flags) {
            if (input === null || input === undefined || input === '' || method === undefined || method === null) {
                $scope.compare = null;
                renderLangCompare();
                return;
            }
            $scope.compare = $scope.allowedStringComparisons[method].f.replace(/%input%/, input).replace(/%flags%/, flags);
            renderLangCompare();
        }

        $scope.selectedLanguage = null;

        $scope.$watch('selectedLanguage', function () {
            renderLangCompare();
        });

        /*
         * Updates comparison for String properties
         */
        function renderLangCompare() {
            $scope.propertyInst.compareRaw.selectedLanguage = $scope.selectedLanguage;
            if ($scope.selectedLanguage === null || $scope.selectedLanguage === undefined || $scope.selectedLanguage === '') {
                $scope.propertyInst.compare = $scope.compare;
            } else if ($scope.compare === null || $scope.compare === undefined) {
                $scope.propertyInst.compare = 'langMatches(lang(%after_arithmetic%), "' + $scope.selectedLanguage + '")';
            } else {
                $scope.propertyInst.compare = 'langMatches(lang(%after_arithmetic%), "' + $scope.selectedLanguage + '") && ' + $scope.compare;
            }
        }

    });