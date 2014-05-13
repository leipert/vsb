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

        /* Test output
        for (var i = 0; i < json.SUBJECTS.length; i++) {
            alert(json.SUBJECTS[i].alias);
        }*/

      var allTheSubjects =[];
      var workspaceContent = [];

        //Create subject object
        for (var i = 0; i < json.SUBJECTS.length; i++) {
            var subjectsProperties = []
                            for (var p=0; p < json.SUBJECTS[i].properties.length;p++)        {
                                    subjectsProperties.push(
                                    {
                                    "alias": json.SUBJECTS[i].properties[p].alias,
                                    "comment": json.SUBJECTS[i].properties[p].comment,
                                    "uri": json.SUBJECTS[i].properties[p].uri,
                                    "type": json.SUBJECTS[i].properties[p].type,
                                    "propertyRange": json.SUBJECTS[i].properties[p].propertyRange,
                                    "view": json.SUBJECTS[i].properties[p].view,
                                    "optional": json.SUBJECTS[i].properties[p].optional,
                                    "operator": json.SUBJECTS[i].properties[p].operator,
                                    "link": {},//json.SUBJECTS[i].properties[p].link,
                                    "arithmetic": json.SUBJECTS[i].properties[p].arithmetic,
                                    "compare": json.SUBJECTS[i].properties[p].compare
                                    });
                            }


                allTheSubjects.push(
                    {
                     alias: json.SUBJECTS[i].alias,
                     label: json.SUBJECTS[i].label,
                     uri: json.SUBJECTS[i].uri,
                     comment: json.SUBJECTS[i].comment,
                     view: json.SUBJECTS[i].view,
                     selectedProperties: subjectsProperties,
                     availableProperties: {},
                     selectedAggregates: [],
                     showAdditionalFields: json.SUBJECTS[i].showAdditionalFields
                    }
                );

        }


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

        workspaceContent.push(allTheSubjects);

        return workspaceContent;
    };	
    return factory;
  }]);
