'use strict';

// Loads all our components
angular.module('GSB', [
  'ui.bootstrap',
  'GSB.controllers.subject',
  'GSB.controllers.property',
  'GSB.directives.subject',
  'GSB.directives.property'
]);

var ModalDemoCtrl = function ($scope,$http, $modal, $log) {

    $scope.items = [];

    $http.get('/app/mockup/classes.json').success(function (data){
        $scope.items = [];
        var availClasses = data.results.bindings;
        console.log(availClasses)
        for (var key in availClasses){
            console.log(availClasses[key]);
            $scope.items.push(
                {
                    alias: availClasses[key].alias.value,
                    uri: availClasses[key].class.value
                }
            );
        }
    });

    $scope.open = function () {

        console.log($scope.items);
        var modalInstance = $modal.open({
            templateUrl: 'template/modal.html',
            controller: ModalInstanceCtrl,
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
            $scope.$emit('newSubjectEvent', selectedItem);
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
};

var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

//src="directives/subject.js"

    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {

        $modalInstance.close($scope.selected.item);
        //alert($scope.selected.item);
        console.log("OK")
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};

