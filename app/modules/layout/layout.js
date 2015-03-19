(function () {
    'use strict';
    angular.module('GSB.layout', ['GSB.layout.workspace', 'GSB.layout.workspace.navigation', 'GSB.language'])
        .controller('NavigationCtrl', NavigationCtrl);


    function NavigationCtrl($scope, $rootScope, $localForage, ArrowService, $timeout) {

        $scope.setSwitchStatus = function (newStatus) {
            if (!_.isBoolean(newStatus)) {
                newStatus = true;
            }
            $localForage.setItem('switchStatus', [newStatus]).then(function () {
                $scope.switchStatus = newStatus;
                $timeout(function () {
                    ArrowService.repaintEverything();
                }, 0);
            });

        };

        $localForage.getItem('switchStatus').then(function (data) {
            $scope.setSwitchStatus(data[0]);
        },function(){
            $scope.setSwitchStatus(true);
        });

        $rootScope.$on('updateJSON', function (event, json) {
            var blob = new Blob([json], {type: 'application/json'});
            $scope.blobURL = URL.createObjectURL(blob);
        });

    }

})();