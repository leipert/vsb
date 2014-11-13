(function () {
    'use strict';
    angular.module('GSB.layout.workspace.navigation', [])
        .controller('WorkspaceNavigationCtrl', WorkspaceNavigationCtrl);

    function WorkspaceNavigationCtrl($scope, $state, $translate, $log, TranslatorManager, SubjectService) {
        var vm = this;
        vm.changeLanguage = function (langKey) {
            $translate.use(langKey);
        };
        vm.translate = function () {
            $state.go('result');
        };

        /**
         * Triggers load JSON event
         */
        vm.loadJSON = function () {
            SubjectService.reset();
            //TODO: Make it work again
            //TranslatorManager.loadJSON($scope.mainSubject, SubjectService.subjects);
        };

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