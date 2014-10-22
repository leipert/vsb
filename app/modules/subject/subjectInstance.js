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
            controller: SubjectInstanceCtrl,
            templateUrl: '/modules/subject/subject.tpl.html',
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
                    scope.dragging = true;
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
                    scope.dragging = false;
                    scope.$digest();
                    ArrowService.repaintEverything();
                    $document.unbind('mousemove', mousemove);
                    $document.unbind('mouseup', mouseup);
                }

            }
        };
    }

    function SubjectInstanceCtrl($scope, $log, $timeout, $translate, EndPointService, ArrowService) {

        /**
         * Change the View of the given Subject
         */
        $scope.toggleSubjectView = function () {
            $scope.subjectInst.view = !$scope.subjectInst.view;
        };

        EndPointService.getSuperAndEqClasses($scope.subjectInst.uri)
            .then(function (data) {
                $log.debug('SUBJECT Additional Classes loaded for ' + $scope.subjectInst.uri, data);
                $scope.subjectInst.$classURIs = data;
            })
            .catch(function (error) {
                $log.error(error);
            });

        if (!$scope.subjectInst.alias) {
            $translate($scope.subjectInst.uri + '.$label').then(function (label) {
                var alias = label, c = 1;
                while ($scope.doesAliasExist(alias)) {
                    alias = label + '_' + c;
                    c += 1;
                }
                $scope.subjectInst.alias = alias;
                $scope.subjectInst.$id = alias.toLowerCase();
                $timeout(function () {
                    ArrowService.addEndpoint($scope.subjectInst.$id);
                }, 50);
            });
        } else {
            $scope.subjectInst.$id = $scope.subjectInst.alias.toLowerCase();
            ArrowService.addEndpoint($scope.subjectInst.$id);
        }

    }


})();