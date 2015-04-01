(function () {
    'use strict';

    /**
     * SubjectCollectionCtrl
     * Controller for all subjects.
     */

    angular.module('VSB.layout.workspace', ['VSB.modals', 'VSB.print', 'ngSanitize', 'VSB.select', 'VSB.config', 'VSB.endPointService', 'VSB.parser', 'VSB.arrowService', 'LocalForageModule'])
        .controller('WorkspaceCtrl', WorkspaceCtrl);

    function WorkspaceCtrl(SubjectService, ArrowService, connectionService, zIndexService, $rootScope, $q) {

        var vm = this;
        vm.groups = [];
        vm.availableSubjectClasses = [];
        vm.totalItems = 0;
        vm.matchingItems = 0;
        vm.selectedSubject = undefined;
        vm.subjects = SubjectService.subjects;
        vm.addSubject = addSubject;
        vm.workspaceMouseDown = workspaceMouseDown;
        vm.workspaceMouseMove = workspaceMouseMove;
        vm.workspaceMouseUp = workspaceMouseUp;
        vm.searchSubject = null;

        connectionService.resetService();
        zIndexService.reset();

        function addSubject(uri) {
            if (uri) { // If the selected option is undefined no subject will be added.
                SubjectService.addSubjectByURI(uri);
                vm.selectedSubject = undefined;
            }
        }

        vm.loading = true;

        $q.when(SubjectService.loading).then(function () {
            vm.loading = false;
            vm.refreshClasses('');
        });

        var startX = 0;
        var startY = 0;
        vm.mouseDown = false;

        function workspaceMouseDown($event) {
            //$scope.offset.x = 0;
            //$scope.offset.y = 0;
            startX = $event.pageX;
            startY = $event.pageY;
            vm.mouseDown = true;
            //ArrowService.setVisibilityForAllConnection(false);
        }

        function workspaceMouseMove($event) {
            if (vm.mouseDown) {
                var offset = {
                    x: ($event.pageX - startX),
                    y: ($event.pageY - startY)
                };
                $rootScope.$emit('moveSubjectDrag', offset);
                startX = $event.pageX;
                startY = $event.pageY;
                ArrowService.repaintEverything();
            }
        }

        function workspaceMouseUp() {
            //$scope.offset.x = 0;
            //$scope.offset.y = 0;
            $rootScope.$emit('moveSubjectEnd');
            vm.mouseDown = false;
            //ArrowService.setVisibilityForAllConnection(true);
            //ArrowService.repaintEverything();
            ArrowService.repaintEverything();
        }

        $rootScope.$on('translateEverything', function () {
            vm.refreshClasses('');
        });

        /** Watchers **/

        vm.refreshClasses = function (search) {

            return SubjectService.getAvailableClasses(search, 50)
                .then(function (data) {
                    var diff = _.xor(_.pluck(data.items, 'uri'),
                        _.pluck(vm.availableSubjectClasses, 'uri'));
                    if (diff.length > 0) {
                        vm.availableSubjectClasses = data.items;
                        vm.totalItems = data.total;
                        vm.matchingItems = data.matching;
                    }
                });
        };

        /**
         * Watches whether the Mainsubject changes
         */

        vm.groups = SubjectService.groups;
        if (SubjectService.mainSubject !== null) {
            vm.mainSubject = SubjectService.mainSubject;
            SubjectService.redrawMainConnection(SubjectService.mainSubject);
        }

        $rootScope.$on('mainSubjectChanged', function () {
            vm.mainSubject = SubjectService.mainSubject;
        });

        $rootScope.$on('availableGroupsChanged', function () {
            vm.groups = SubjectService.groups;
        });

        vm.updateMainSubject = function () {
            SubjectService.setMainSubjectWithAlias(vm.mainSubject.alias);
        };

    }

})();