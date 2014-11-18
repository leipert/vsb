(function () {
    'use strict';
    angular.module('GSB.layout', ['GSB.layout.workspace', 'GSB.layout.workspace.navigation'])
        .controller('NavigationCtrl', NavigationCtrl);


    function NavigationCtrl($scope, $rootScope) {
        $scope.switchStatus = false;

        $rootScope.$on('updateJSON', function (event, json) {
            var blob = new Blob([json], {type: 'application/json'});
            $scope.blobURL = URL.createObjectURL(blob);
        });

    }

})();