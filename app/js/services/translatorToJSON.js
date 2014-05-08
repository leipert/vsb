'use strict';
/**
 * JSON Translator Factory 
 * A factory to handle translation of GSBL -> JSON 
 *
 */

angular.module('GSB.services.translatorToJSON', ['GSB.config'])
  .factory('TranslatorToJSON', ['globalConfig', '$log',  function (globalConfig, $log) {
    var factory = {};

  

   /**
     * Function that takes built query and creates a JSON Object for the translation to SPARQL, returns it as a String
	 *
	 * @param mainSubjectSelected 
	 * @param subjects
	 * @return JSON object as String
     */
    factory.translateGSBLToJSON = function (mainSubjectSelected, subjects) {
    
      $log.info('Translate JSON to SPARQL');
	  
	
	  $log.info('Translate GSBL to JSON');
      if (mainSubjectSelected == null) {
        $log.error("Main Subject not connected");
        return null;
      }
	  
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
          delete currentSubject["availableInverseProperties"];
          currentSubject.properties = currentSubject["selectedProperties"].concat(currentSubject["selectedInverseProperties"]).map(function (currentProperty) {
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
          delete currentSubject["selectedInverseProperties"];
          return currentSubject;
        });
	  
      json.SUBJECTS = allSubjects;

       return JSON.stringify(json, null, 2);
    };
	
	
    return factory;

  }]);
