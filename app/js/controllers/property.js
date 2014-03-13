'use strict';

/* Property Controller */

angular.module('GSB.controllers.property', [])
    .controller('PropertyController', ['$scope', function($scope) {

        //Named a few variables, for shorter access
        var $subject = $scope.subject,
            $selectedProperties = $subject.selectedProperties;

        //TODO: Here the availableProperties have to be loaded from the Server / Mockup Data
        console.log('Lade die Properties von ' + $subject.uri);
        $subject.availableProperties = [
            {
                alias: "Property 1",
                uri: "http://a.de/property1"
            },
            {
                alias: "Property 2",
                uri: "http://a.de/property2"
            }
        ]

        //Adds the selected property in dropdown to selectedProperties
        $scope.addProperty = function(){
            $selectedProperties.push(angular.copy($scope.propertySelected));
            $scope.propertySelected = '';
        }

        //Removes the selected from selectedProperties
        $scope.removeProperty = function(property) {
            $selectedProperties.splice($selectedProperties.indexOf(property), 1);
        }
    }]);