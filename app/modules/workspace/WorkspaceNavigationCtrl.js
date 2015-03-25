(function () {
    'use strict';
    angular.module('VSB.layout.workspace.navigation', [])
        .controller('WorkspaceNavigationCtrl', WorkspaceNavigationCtrl);

    function WorkspaceNavigationCtrl($scope, $state, $translate, $log, SubjectService) {
        var vm = this;
        vm.changeLanguage = function (langKey) {
            $translate.use(langKey);
        };
        vm.translate = function () {
            $state.go('result');
        };

        vm.print = function(){
            window.print();
        } ;

        /**
         * Calls the function for resetting workspace
         */
        vm.resetWorkspace = function () {
            $log.debug('Cleared Workspace');
            SubjectService.reset();
            //TODO: Move to Result Ctrl
            $scope.translatedJSON = 'In the near future the translated JSON will be here.';
            $scope.translatedSPARQL = 'In the near future the translated SPARQL will be here.';
        };


    }

})();