angular.module('GSB', ['ui.bootstrap']);
var ModalDemoCtrl = function ($scope, $modal, $log) {

  $scope.items = ['Person', 'Stadt', 'Land'];

  $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: 'modal.html',
      controller: ModalInstanceCtrl,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
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
	//$scope.addSubject('Test');
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

