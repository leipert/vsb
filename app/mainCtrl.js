(function () {
    'use strict';

    /**
     * MainCtrl
     * Controller that controls mainly everything.
     */

    angular.module('VSB.mainCtrl', ['VSB.config', 'ngTable', 'angular-intro'])
        .controller('MainCtrl', MainCtrl);
    function MainCtrl($scope, $log, $compile, $interpolate, $rootScope) {

        var IntroOptionsTemplate = {
            steps: [
                {
                    intro: '{{ "HELP_FIRST" | translate}}',
                    tooltipClass: 'wide'
                },
                {
                    intro: '<div><h2>Arbeitsfläche</h2>' +
                    '<p>Im Hintergrund sehen Sie die Arbeitsfläche, das Kernstück des VSB.... </p></div>'
                },
                {
                    element: '#navigation',
                    intro: '<div><h2>Navigation</h2>' +
                    '<p>Here will be an explanation for the tour</p></div>',
                    position: 'right'
                },
                {
                    intro: '<div>This is it for now.</div>',
                    position: 'Future implementations will hold more helpful information'
                }
            ],
            showBullets: true,
            exitOnOverlayClick: true,
            exitOnEsc: true,
            showStepNumbers: false,
            nextLabel: 'Weiter <i class="fa fa-chevron-right"></i>',
            prevLabel: '<i class="fa fa-chevron-left"></i> Zurück',
            skipLabel: 'Abbruch',
            doneLabel: 'Fertig'
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

        //TODO: Implement IntroJS completely
        //$scope.ChangeEvent = function (targetElement) {
        //    console.log("Change Event called", targetElement.id);
        //    if (targetElement.id === 'navigation') {
        //        //SubjectService.reset();
        //    }
        //};

        /**
         * Triggers save JSON event
         */
        $scope.saveJSON = function () {
            $scope.$broadcast('saveJsonEvent');

        };

        /**
         * Initializes the Workspace
         */
        $scope.initializeWorkspace = function () {
            $log.debug('Initialized Workspace');
            $scope.translatedJSON = 'In the near future the translated JSON will be here.';
            $scope.translatedSPARQL = 'In the near future the translated SPARQL will be here.';
        };

        //Initialize Workspace
        $scope.initializeWorkspace();

        /** FOLGENDES MUSS AUS DIESEM CONTROLLER RAUS! **/


    }


})();