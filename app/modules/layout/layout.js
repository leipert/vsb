(function () {
    'use strict';
    angular.module('GSB.layout', ['GSB.layout.workspace', 'GSB.layout.workspace.navigation', 'GSB.language'])
        .controller('NavigationCtrl', NavigationCtrl);


    function NavigationCtrl($scope, $rootScope, $localForage, ArrowService, $timeout) {

        $scope.setSwitchStatus = function (newStatus) {
           setSwitchStatus(newStatus).then(function(newStatus){
               if(newStatus){
                   $rootScope.$emit('moveSubjectDrag',{x:200,y:0},true);
               }else{
                   $rootScope.$emit('moveSubjectDrag',{x:-200,y:0},true);
               }
           });

        };

        $localForage.getItem('switchStatus').then(function (data) {
            if(_.isArray(data)){
                setSwitchStatus(data[0]);
            }else{
                setSwitchStatus(data);
            }
        },function(){
            setSwitchStatus(true);
        });

        function setSwitchStatus(newStatus){
            if (!_.isBoolean(newStatus)) {
                newStatus = true;
            }
            return $localForage.setItem('switchStatus', [newStatus]).then(function () {
                $scope.switchStatus = newStatus;
                $timeout(function () {
                    ArrowService.repaintEverything();
                }, 0);
                return newStatus;
            });
        }

        $rootScope.$on('updateJSON', function (event, json) {
            var blob = new Blob([json], {type: 'application/json'});
            $scope.blobURL = URL.createObjectURL(blob);
        });

    }

})();