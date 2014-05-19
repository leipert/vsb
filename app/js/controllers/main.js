'use strict';

/**
 * MainCtrl
 * Controller that controls mainly everything.
 */

angular.module('GSB.controllers.main', ['GSB.config'])
//Inject $scope, $log and globalConfig (see @ js/config.js) into controller
  .controller('MainCtrl', ['$scope', '$log', 'globalConfig', function ($scope, $log, globalConfig) {

    //Some drag and drop variables
    $scope.showArea = 'workspace';
    $scope.initialisedSubjects = false;
    $scope.offsetX = 0;
    $scope.offsetY = 0;
    $scope.mouseDownAct = false;
    $scope.theMouseDown = function($event){
      $scope.offsetX = 0;
      $scope.offsetY = 0;
      $scope.startX = $event.pageX;
      $scope.startY = $event.pageY;
      $scope.mouseDownAct = true;
    };

    $scope.theMouseMove = function($event){
      if($scope.mouseDownAct){
        $scope.offsetX = $event.pageX - $scope.startX;
        $scope.offsetY = $event.pageY - $scope.startY;
        $scope.startX = $event.pageX;
        $scope.startY = $event.pageY;
      }
    };

    $scope.theMouseUp = function(){
      $scope.mouseDownAct = false;
    };

    /**
     * Triggers translation event
     */
    $scope.translate = function () {
	    
	    $scope.$broadcast('translationEvent');
	    
    };

    /**
     * Triggers save JSON event
     */
    $scope.saveJSON = function () {

      $scope.$broadcast('saveJsonEvent');

    };

    /**
     * Calls the function for resetting workspace
     */
    $scope.resetWorkspace = function () {
      $scope.clearWorkspace();

    };
    /**
     * Triggers load JSON event
     */
    $scope.loadJSON = function () {

      $scope.resetWorkspace();
      $scope.$broadcast('loadJsonEvent');

    };



    /**
     * Initializes the Workspace
     */
    $scope.initializeWorkspace = function () {
      $log.info('Initialized Workspace');
      $scope.translatedJSON = "In the near future the translated JSON will be here.";
      $scope.translatedSPARQL = "In the near future the translated SPARQL will be here.";
      $scope.expertView = false;
    };


    /**
     * Clears the Workspace
     */
    $scope.clearWorkspace = function () {
      $log.info('Cleared Workspace');
      $scope.$broadcast('removeAllSubjectsEvent');
      $scope.translatedJSON = "In the near future the translated JSON will be here.";
      $scope.translatedSPARQL = "In the near future the translated SPARQL will be here.";
      $scope.expertView = false;
    };

    //Initialize Workspace
    $scope.initializeWorkspace();


    /** FOLGENDES MUSS AUS DIESEM CONTROLLER RAUS! **/

    /**
     * Open the SPARQL Query in a new dbpedia tab
     * TODO-NICO: Use or delete it.
     */
    $scope.openInNewTab = function () {
      var win = window.open(globalConfig.resultURL + encodeURIComponent($scope.translatedSPARQL), '_blank');
      win.focus();
    };


  }]);