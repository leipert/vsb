'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyType.date', ['GSB.config'])
    //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
    .controller('DatePropertyCtrl', ['$scope', '$http', '$log', 'globalConfig', function($scope, $http, $log, globalConfig) {

        $scope.allowedDateComparisons = [
            {
                label: "equals",
                f : '(str(%after_arithmetic%)="%input%")'
            },
            {
                label: "equals not",
                f : '(str(%after_arithmetic%)!="%input%")'
            },
            {
                label: "after",
                f : 'regex(%after_arithmetic%, "^%input%", "i")'
            },
            {
                label: "before",
                f : 'regex(%after_arithmetic%, "%input%$", "i")'
            }
        ];


        $scope.dateComparison = null;

        $scope.$watch('dateComparison',function (newValue){});

        $scope.comparisonInput = "";

        $scope.$watch('comparisonInput',function (newValue){});

        $scope.comparisonRegexFlags = "j";


        $scope.selectedLanguage = null;

    }]);
