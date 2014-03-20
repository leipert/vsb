'use strict';

// Loads all our components
angular.module('GSB', [
  'ui.bootstrap',
  'GSB.controllers.workspace',
  'GSB.controllers.property',
  'GSB.directives.subject',
  'GSB.directives.property'
]);

var ModalCtrl = function ($scope,$http, $modal, $log) {

    $scope.items = [];

    // Get Availabe Subject Classes from Server
    $http.get('/app/mockup/classes.json').success(function (data){
        $scope.items = [];
        var availClasses = data.results.bindings;
        for (var key in availClasses){
            $scope.items.push(
                {
                    alias: availClasses[key].alias.value,
                    uri: availClasses[key].class.value
                }
            );
        }
    });

    $scope.open = function () {

        // Create modalInstance
        var modalInstance = $modal.open({
            templateUrl: 'template/modal.html',
            controller: ModalInstanceCtrl,
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });

        // User closed modal
        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
            $scope.$emit('newSubjectEvent', selectedItem);
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
};

var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    // User clicked okay
    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    // USer clicked cancel
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};

