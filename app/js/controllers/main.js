'use strict';

/**
 * MainCtrl
 * Controller that controls mainly everything.
 */

angular.module('GSB.controllers.main', ['GSB.config'])
  //Inject $scope, $log and globalConfig (see @ js/config.js) into controller
  .controller('MainCtrl', ['$scope', '$log', 'globalConfig', function ($scope, $log, globalConfig) {

    //** FUNCTIONS START **//

    $scope.showArea = 'workspace';
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
     * TODO: Call translate function...
     */
  $scope.translate = function () {
	
	  $scope.$broadcast('translationEvent');
	
    };


        $scope.saveJSON = function () {

            $scope.$broadcast('saveJsonEvent');

        };
	
    /**
     * Initializes the Workspace
     */
    $scope.initializeWorkspace = function () {
      $log.info('Initialize Workspace');
      $scope.translatedJSON = "In the near future the translated JSON will be here.";
      $scope.translatedSPARQL = "In the near future the translated SPARQL will be here.";
      $scope.expertView = false;
    };

    //** FUNCTIONS END **//

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