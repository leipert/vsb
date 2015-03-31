(function () {
    'use strict';
    angular.module('VSB.layout.workspace.navigation', [])
        .controller('WorkspaceNavigationCtrl', WorkspaceNavigationCtrl);

    function WorkspaceNavigationCtrl($scope, $state, $translate, $log, SubjectService, MessageService, $localForage, PrintService) {
        var vm = this;
        vm.changeLanguage = function (langKey) {
            $translate.use(langKey);
        };

        var currentMessage;

        vm.translate = function () {
            if (SubjectService.mainSubject === null) {
                MessageService.dismiss(currentMessage);
                currentMessage = MessageService.addMessage({
                    message: '{{ "MINIMUM_SUBJECTS" | translate }}',
                    'class': 'warning',
                    icon: 'exclamation-triangle'
                });
            } else {
                $state.go('result');
            }
        };

        vm.print = function () {
            PrintService.beforePrint();
        };

        /**
         * Calls the function for resetting workspace
         */
        vm.resetWorkspace = function () {
            $localForage.removeItem('current');
            $log.debug('Cleared Workspace');
            SubjectService.reset();
            //TODO: Move to Result Ctrl
            $scope.translatedJSON = 'In the near future the translated JSON will be here.';
            $scope.translatedSPARQL = 'In the near future the translated SPARQL will be here.';
        };


    }

})();