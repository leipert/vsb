(function () {
    'use strict';
    function WorkspaceCtrl(SubjectService, connectionService, $rootScope, $q) {

        var vm = this;
        vm.groups = [];
        vm.selectedSubject = undefined;
        vm.subjects = SubjectService.subjects;
        vm.addSubject = addSubject;
        vm.searchSubject = null;

        connectionService.resetService();


        function addSubject(uri) {
            if (uri) { // If the selected option is undefined no subject will be added.
                SubjectService.addSubjectByURI(uri);
                vm.selectedSubject = undefined;
            }
        }

        vm.loading = true;

        $q.when(SubjectService.loading).then(function(){
            vm.loading = false;
        });

        $rootScope.$on('translateEverything',function(){
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
        if (SubjectService.x.mainSubject !== null) {
            vm.mainSubject = SubjectService.x.mainSubject;
            SubjectService.redrawMainConnection(SubjectService.x.mainSubject);
        }

        $rootScope.$on('mainSubjectChanged', function () {
            vm.mainSubject = SubjectService.x.mainSubject;
        });

        $rootScope.$on('availableGroupsChanged', function () {
            vm.groups = SubjectService.groups;
        });

        vm.updateMainSubject = function () {
            SubjectService.setMainSubjectWithAlias(vm.mainSubject.alias);
        };

    }

    /**
     * SubjectCollectionCtrl
     * Controller for all subjects.
     */

    angular.module('GSB.layout.workspace', ['GSB.modals', 'ngSanitize', 'VSB.select', 'GSB.config', 'GSB.endPointService', 'GSB.parser', 'GSB.arrowService', 'LocalForageModule'])
        .controller('WorkspaceCtrl', WorkspaceCtrl);


})();