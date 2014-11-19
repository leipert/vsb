(function () {
    'use strict';
    /**
     * SubjectCollectionCtrl
     * Controller for all subjects.
     */

    angular.module('GSB.layout.workspace', ['GSB.modals','ngSanitize', 'ui.select', 'GSB.config', 'GSB.endPointService', 'GSB.parser', 'GSB.arrowService', 'LocalForageModule'])
        .controller('WorkspaceCtrl', WorkspaceCtrl);

    function WorkspaceCtrl($scope, SubjectService, ArrowService, connectionService, $modal) {

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
        vm.searchSubject = null;
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

        $scope.$watchCollection(SubjectService.getSearchRelationSubjects, function (nv) {
            if (nv.length === 0) {
                vm.searchSubject = null;
            }
            if (nv.length === 1) {
                vm.searchSubject = nv[0];
            }
            if (nv.length === 2) {
                var modalInstance = $modal.open({
                    templateUrl: 'modules/modals/findRelationModal.tpl.html',
                    controller: 'findRelationModalCtrl',
                    resolve: {
                        subjects: function () {
                            return nv;
                        },
                        possibleRelations: function (EndPointService) {
                            return EndPointService.getPossibleRelations(nv[0].uri, nv[1].uri);
                        }
                    }
                });
                modalInstance.result.then(null, function () {
                    SubjectService.searchRelation(null);
                });
            }
        }, true);

        $scope.$watchCollection(SubjectService.getGroups, function (nv) {
            vm.groups = nv;
        }, true);


    }


})();