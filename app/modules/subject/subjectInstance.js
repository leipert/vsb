(function () {
    'use strict';

    /**
     * Subject directive
     * Creates the possibility to use a <subject-dir> element,
     * which will be replaced with the contents of template/subject.html
     * Additionally a subject directive uses it's own scope which is needed,
     * so that each subject can hold it's own property list
     *
     */

    angular.module('GSB.subject.instance', ['GSB.config', 'GSB.endPointService', 'GSB.arrowService', 'GSB.filters'])

        .directive('subjectDir', subjectDir);

    function subjectDir($document, ArrowService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                subject: '=',
                offset: '='
            },
            controller: SubjectInstanceCtrl,
            controllerAs: 'vm',
            templateUrl: '/modules/subject/subject.tpl.html',
            link: linkFunction($document, ArrowService)
        };
    }

    function SubjectInstanceCtrl($scope, connectionService, SubjectService) {

        var subject = $scope.subject;

        connectionService.addMapping(subject.$id, $scope.$id);

        var vm = this;
        vm.editAlias = false;
        vm.comment = subject.uri + '.$comment';
        vm.removeSubject = removeSubject;
        vm.addProperty = addProperty;
        vm.searchRelation = searchRelation;

        function addProperty() {
            subject.addProperty(vm.propertySelected);
            vm.propertySelected = undefined;
            vm.showAddProperty = false;
        }

        function removeSubject() {
            SubjectService.removeSubject(subject.$id);
        }

        function searchRelation(){
            SubjectService.searchRelation(subject);
        }

        $scope.$watch(subject.getAvailableProperties, function (nv) {
            vm.$availableProperties = nv;
        }, true);

    }


    /**
     * The Link Function enables Drag & Drop and saves position back to the VM
     *
     */
    function linkFunction($document, ArrowService) {
        return function (scope, element) {
            var pos = scope.subject.pos;
            var startX = 0, startY = 0, x = pos.x || 150, y = pos.y || 250;

            function moveSubject(newX, newY) {
                x = newX;
                y = newY;
                pos.x = newX;
                pos.y = newY;
                element.css({
                    left: newX + 'px',
                    top: newY + 'px'
                });
            }

            scope.$watch('offset', function (offset) {
                moveSubject(x + offset.x, y + offset.y);
            }, true);

            element.find('mover').on('mousedown', function (event) {
                // Prevent default dragging of selected content
                event.preventDefault();
                scope.dragging = true;
                startX = event.pageX - x;
                startY = event.pageY - y;
                // scope.$digest();
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                y = event.pageY - startY;
                x = event.pageX - startX;
                ArrowService.repaintEverything();
                moveSubject(event.pageX - startX, event.pageY - startY);
            }

            function mouseup() {
                scope.dragging = false;
                scope.$digest();
                ArrowService.repaintEverything();
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
            }

        };
    }

})();