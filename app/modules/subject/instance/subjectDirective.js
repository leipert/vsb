'use strict';

/**
 * Subject directive
 * Creates the possibility to use a <subject-dir> element,
 * which will be replaced with the contents of template/subject.html
 * Additionally a subject directive uses it's own scope which is needed,
 * so that each subject can hold it's own property list
 *
 */

angular.module('GSB.subject.instance')

    .directive('subjectDir', function ($document,ArrowService) {
        return {
            restrict: 'E',
            replace: true,
            controller: 'SubjectInstanceCtrl',
            templateUrl: '/modules/subject/instance/subject.tpl.html',
            /**
             * The link function is the function where you can interact with the DOM
             *
             * @param scope The current Scope, equivalent to the scope holding subjectInst
             * @param element The current element
             *
             */
            link: function (scope, element) {
                var pos = scope.subjectInst.pos;
                var startX = 0, startY = 0, x = pos.x || 150, y = pos.y || 250;

                scope.$watch('offsetX', function (newValue) {
                    moveX(newValue);
                });

                scope.$watch('offsetY', function (newValue) {
                    moveY(newValue);
                });

                function moveX(offset) {
                    x = x + offset;
                    scope.subjectInst.pos.x = x;
                    element.css({left: x + 'px'});
                }

                function moveY(offset) {
                    y = y + offset;
                    scope.subjectInst.pos.y = y;
                    element.css({top: y + 'px'});
                }


                element.find('mover').on('mousedown', function (event) {
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    scope.dragging=true;
                    scope.$digest();
                    startX = event.pageX - x;
                    startY = event.pageY - y;
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                });

                function mousemove(event) {
                    y = event.pageY - startY;
                    x = event.pageX - startX;
                    ArrowService.repaintEverything();
                    scope.subjectInst.pos.x = x;
                    scope.subjectInst.pos.y = y;

                    element.css({
                        top: y + 'px',
                        left: x + 'px'
                    });
                }

                function mouseup() {
                    scope.dragging=false;
                    scope.$digest();
                    ArrowService.repaintEverything();
                    $document.unbind('mousemove', mousemove);
                    $document.unbind('mouseup', mouseup);
                }

            }
        };
    });