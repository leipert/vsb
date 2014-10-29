(function () {
    'use strict';

    /**
     * MainCtrl
     * Controller that controls mainly everything.
     */

    angular.module('GSB.mainCtrl', ['GSB.config', 'ngTable'])
//Inject $scope, $log and globalConfig (see @ js/config.js) into controller
        .controller('MainCtrl', MainCtrl);
    function MainCtrl($scope, $log, globalConfig, $http, $translate, languageStorage) {

        $http.get('locale.json').success(function (data) {
            languageStorage.mergeLanguages(data);
            $translate.refresh();
        });

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

        /**
         * Open the SPARQL Query in a new dbpedia tab
         */
        $scope.openInNewTab = function () {
            var win = window.open(globalConfig.resultURL + encodeURIComponent($scope.translatedSPARQL), '_blank');
            win.focus();
        };


    }


})();