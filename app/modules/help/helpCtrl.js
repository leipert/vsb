(function () {
    'use strict';

    /**
     * HelpCtrl
     * Controller that controls mainly everything.
     */

    angular.module('VSB.helpCtrl', ['VSB.config', 'angular-intro'])
        .controller('HelpCtrl', HelpCtrl);

    function HelpCtrl($scope, $log, $compile, $interpolate, $rootScope) {

        var IntroOptionsTemplate = {
            steps: [
                {
                    intro: '{{ "HELP_FIRST" | translate}}',
                    tooltipClass: 'wide'
                },
                {
                    intro: '{{ "HELP_SECOND" | translate}}'
                },
                {
                    element: '#navigation',
                    intro: '{{ "HELP_THIRD" | translate}}',
                    position: 'right'
                },
                {
                    intro: '{{ "HELP_FOURTH" | translate}}'
                }
            ],
            showBullets: true,
            exitOnOverlayClick: true,
            exitOnEsc: true,
            showStepNumbers: false,
            nextLabel: '<i class="fa fa-chevron-right"></i>',
            prevLabel: '<i class="fa fa-chevron-left"></i>',
            skipLabel: '<i class="fa fa-times"></i>',
            doneLabel: '<i class="fa fa-check"></i>'
        };

        var currentLanguage = null;

        $rootScope.$on('$translateChangeSuccess', function (event, data) {
            if (data.language !== currentLanguage) {

                currentLanguage = data.language;

                var IntroOptions = angular.copy(IntroOptionsTemplate);

                IntroOptions.steps = _.map(IntroOptions.steps, function (step) {

                    var cellScope = $rootScope.$new(false);

                    var interpolated = $interpolate('<div>' + step.intro + '</div>')(cellScope);

                    var linker = $compile(interpolated);

                    step.intro = linker(cellScope)[0].outerHTML;
                    return step;
                });


                $scope.IntroOptions = IntroOptions;
            }
        });

        /**
         * Triggers save JSON event
         */
        $scope.saveJSON = function () {
            $scope.$broadcast('saveJsonEvent');

        };


    }


})();