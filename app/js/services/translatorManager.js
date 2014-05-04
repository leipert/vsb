'use strict';
/**
 * Translator Manager Factory
 * A factory to manage translation of GSBL -> JSON and JSON -> SPARQL
 *
 */

angular.module('GSB.services.translatorManager', ['GSB.config'])
  .factory('TranslatorManager', ['$log', 'globalConfig', '$rootScope', 'TranslatorToJSON', 'TranslatorToSPARQL', function ($log, globalConfig, $rootScope, TranslatorToJSON, TranslatorToSPARQL) {
    var factory = {};


   /**
    *  Function initiates JSON-saving
    */
    factory.saveAsJSON = function (mainSubjectSelected, subjects) {

        alert(TranslatorToJSON.translateGSBLToJSON(mainSubjectSelected, subjects));

    }




   /**
     *  Function first calls the factory to translate GSBL to JSON, then the one to translate JSON to SPARQL
     */
    factory.translateGSBLToSPARQL = function (mainSubjectSelected, subjects) {
    
      $log.info('Managing translation from GSBL to SPARQL');
	  
	  var newJSON = TranslatorToJSON.translateGSBLToJSON(mainSubjectSelected, subjects);
	  $rootScope.$broadcast('JSONUpdateEvent', newJSON);
	  
	
      if (newJSON == null) {
        $log.error("JSON is not valid / empty");
        return;
      }
	  
	  
	  var newSPARQL = TranslatorToSPARQL.translateJSONToSPARQL(JSON.parse(newJSON));
	   $rootScope.$broadcast('SPARQLUpdateEvent', newSPARQL);
	   
   
    };
	

	
    return factory;

  }]);
