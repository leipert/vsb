(function () {
    'use strict';
    /**
     * SubjectCollectionCtrl
     * Controller for all subjects.
     */

    angular.module('GSB.layout.workspace', ['ngSanitize', 'ui.select', 'GSB.config', 'GSB.endPointService', 'GSB.parser', 'GSB.arrowService', 'LocalForageModule'])
        .controller('WorkspaceCtrl', WorkspaceCtrl);

    function WorkspaceCtrl($scope, SubjectService, ArrowService, connectionService) {

        var vm = this;
        vm.x = SubjectService.x;
        vm.groups = [];
        vm.selectedSubject = undefined;
        vm.availableSubjectClasses = [];
        vm.subjects = SubjectService.subjects;
        vm.getSubjects = SubjectService.getSubjects;
        vm.addSubject = addSubject;
        vm.workspaceMouseDown = workspaceMouseDown;
        vm.workspaceMouseMove = workspaceMouseMove;
        vm.workspaceMouseUp = workspaceMouseUp;

        vm.connections = connectionService.getConnections;

        ArrowService.resetService();


        function addSubject(uri) {
            if (uri) { // If the selected option is undefined no subject will be added.
                SubjectService.addSubjectByURI(uri);
                vm.selectedSubject = undefined;
            }
        }

        /** Drag and Drop of the complete Workspace **/

        var startX, startY, mouseDown = false;
        $scope.offset = {
            x: 0,
            y: 0
        };

        function workspaceMouseDown($event) {
            $scope.offset.x = 0;
            $scope.offset.y = 0;
            startX = $event.pageX;
            startY = $event.pageY;
            mouseDown = true;
            ArrowService.setVisibilityForAllConnection(false);
        }

        function workspaceMouseMove($event) {
            if (mouseDown) {
                $scope.offset.x = $event.pageX - startX;
                $scope.offset.y = $event.pageY - startY;
                startX = $event.pageX;
                startY = $event.pageY;
            }
        }

        function workspaceMouseUp() {
            $scope.offset.x = 0;
            $scope.offset.y = 0;
            mouseDown = false;
            ArrowService.setVisibilityForAllConnection(true);
            ArrowService.repaintEverything();
        }

        /** Watchers **/

        /**
         * Watches whether availableClasses change (for example after translation Event)
         */
        $scope.$watch(SubjectService.getAvailableClasses, function (nv) {
            vm.availableSubjectClasses = nv;
        }, true);

        /**
         * Watches whether the Mainsubject changes
         */
        $scope.$watch(SubjectService.getMainSubject, function (nv) {
            vm.x = nv;
        }, true);

        $scope.$watchCollection(SubjectService.getGroups, function (nv) {
            vm.groups = nv;
        }, true);


    }
})();