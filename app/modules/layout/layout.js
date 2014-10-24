(function(){
    'use strict';
    angular.module('GSB.layout',['toggle-switch'])
        .controller('NavigationCtrl',NavigationCtrl);

    function NavigationCtrl($scope, $rootScope){
        $scope.switchStatus = true;

        $scope.$watch('switchStatus',function(nv){
            $rootScope.switchStatus = nv;
        });
    }
})();