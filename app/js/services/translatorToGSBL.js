'use strict';
/**
 * GSBL Translator Factory 
 * A factory to handle translation of JSON -> GSBL 
 *
 */

angular.module('GSB.services.translatorToGSBL', ['GSB.config'])
  .factory('TranslatorToGSBL', ['globalConfig', '$log',  function (globalConfig, $log) {
    var factory = {};

   /**
     * Function that takes an uploaded JSON and creates a GSBL query for the representation in GSB
	 *
	 * @param json
         * @return workspaceContent Array of all the workspace Content
     */
    factory.translateJSONToGSBL = function (json) {
    
      $log.info('Translate JSON to GSBL');

      if (json === null) {
        $log.error("Empty JSON File");
        return null;
      }
      
      var workspaceContent = new Array();
      

// Here is where the magic should happen
// reverse all the things
/*
      var json = {
          START: {
            type: "LIST_ALL",
            "link": {
              "direction": "TO",
              "linkPartner": mainSubjectSelected.alias
            }
          },
          SUBJECTS: []
        },
                
        allSubjects = angular.copy(subjects);
        allSubjects.map(function (currentSubject) {
          delete currentSubject["availableProperties"];
          currentSubject.properties = currentSubject["selectedProperties"].map(function (currentProperty) {
            delete currentProperty["propertyType"];
            if (currentProperty.link.linkPartner !== null && currentProperty.link.linkPartner.hasOwnProperty("alias")) {
              currentProperty.link.linkPartner = currentProperty.link.linkPartner.alias;
            } else {
              currentProperty.link = {};
            }
            return currentProperty;
          });
          currentSubject.selectedAggregates = currentSubject.selectedAggregates.map(function (currentAggregate){
            delete currentAggregate.available;
            return currentAggregate;
          });
          currentSubject.properties = currentSubject.properties.concat(currentSubject.selectedAggregates);
          delete currentSubject["selectedProperties"];
          delete currentSubject["selectedAggregates"];
          return currentSubject;
        });
	  
      json.SUBJECTS = allSubjects;

       return JSON.stringify(json, null, 2);*/
        return workspaceContent;
    };	
    return factory;
  }]);
