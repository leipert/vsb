(function () {
    'use strict';
    angular.module('GSB.layout', ['GSB.layout.workspace','GSB.layout.workspace.navigation'])
        .controller('NavigationCtrl', NavigationCtrl);

    function NavigationCtrl($scope) {
        $scope.switchStatus = false;
    }

})();