'use strict';
/**
 * JSON Translator Factory 
 * A factory to handle translation of JSON -> SPARQL
 *
 */

angular.module('GSB.services.translatorToSPARQL', ['GSB.config'])
  .factory('TranslatorToSPARQL', ['globalConfig', '$log', function (globalConfig, $log) {
    
    var factory = {};

    /**
     * Function to start translation process, with call to changeURIs for the mockup data
	   * and replaceAliasSpaces to replace spaces with underscores
	   * @param json
     */
    factory.translateJSONToSPARQL = function (json) {
      
      //json = factory.changeURIs(json);
	    
	    json = factory.replaceAliasSpaces(json);
	    
	    return factory.translateAll(json);
    };
	  
    /**
     *  Initial translation function that takes a JSON-object, looks for the main class and starts translation there, 
     *  and in the end of the process adds shown values and SPARQL-'header' (e.g. SELECT DISTINCT..)
     * @param json
     */
    factory.translateAll = function (json) {

      var shownValues = [];
      var translated = [];
      var SPARQL = "";

      for(var i = 0; i < json.SUBJECTS.length; i++)
      {
        if(json.SUBJECTS[i].alias === json['START'].link.linkPartner)
        {
          SPARQL +=  factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
        }
      }

	 SPARQL += factory.translateInverseSubjects(shownValues, translated, json);
	  
    return factory.translateStartpoint(json, shownValues) + "\nwhere {\n" + SPARQL + "\n} LIMIT 200";
  };
	
	
	factory.translateInverseSubjects = function (shownValues, translated, json) {
	
	  var SPARQL = "";
	
	  for(var i = 0; i < json.SUBJECTS.length; i++)
        {
          if(!factory.presentInArray(translated, json.SUBJECTS[i].alias))
          {
            SPARQL +=  factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
          }
        }
		
		return SPARQL;
	};
	
	
	
  /**
   * Function to translate the header of a SPARQL query, including the shown values
   * @param json
   * @param shownValues
   */
  factory.translateStartpoint = function (json, shownValues) {

    var SPARQLStart = "";

    if(json.START.type === "LIST_ALL")   {
      SPARQLStart = "SELECT DISTINCT ";
    }
    else {
      SPARQLStart = "SELECT ";
    }

    for(var i = 0; i < shownValues.length; i++) {
      SPARQLStart += "?" + shownValues[i] + " ";
    }

    return SPARQLStart;
  };


	

    /**
     * Function to translate the header of a SPARQL query, including the shown values
     * @param json
     * @param shownValues
     */
    factory.translateStartpoint = function (json, shownValues) {

      var SPARQLStart = "";

      if(json.START.type === "LIST_ALL")   {
        SPARQLStart = "SELECT DISTINCT ";
      } else {
        SPARQLStart = "SELECT ";
      }

      for(var i = 0; i < shownValues.length; i++) {
        SPARQLStart += "?" + shownValues[i] + " ";
      }

      var spePro = false;
      //Search for specialProperty in the JSON
      for(i = 0; i < json.SUBJECTS.length; i++){

        for(var j = 0; j < json.SUBJECTS[i].properties.length; j++){
          if(json.SUBJECTS[i].properties[j].uri == 'test/specialObjectProperty' || json.SUBJECTS[i].properties[j].uri == 'test/specialDatatypeProperty') {spePro = true;}
        }
      }
      //If specialProperty is part of the properties it's added to the shown values
      if (spePro) {SPARQLStart += '?unknownConnection ';}

      return SPARQLStart;
    };

    /**
     * Function to translate a subject. Calls all translate-property functions for all the subjects properties
     * @param oneSubject
     * @param shownValues
     * @param translated
     * @param json
     */
    factory.translateSubject = function (oneSubject, shownValues, translated, json) {

      var SPARQL = "";
      
      if(!factory.presentInArray(translated, oneSubject.alias)) {
        if(oneSubject.uri != 'test/Thing')SPARQL += "?" + oneSubject.alias + " a <" + oneSubject.uri + "> .\n";

        if(oneSubject.view) {
          shownValues[shownValues.length] = oneSubject.alias;
        }

        translated[translated.length] = oneSubject.alias;


        for(var i in oneSubject.properties) {

          if(oneSubject.properties[i].type === "OBJECT_PROPERTY") {
            SPARQL += factory.translateObjectProperty(oneSubject, oneSubject.properties[i], shownValues, translated, json) + '\n';
          }
          else {
            SPARQL += factory.translateDatatypeProperty(oneSubject, oneSubject.properties[i], shownValues, translated, json) + '\n';
          }
        }
      }

      return SPARQL;
    };	

    /**
     * function to translate Object properties. Checks for operator of property, calls translateSubject when necessary
     * @param itsSubject
     * @param eigenschaft
     * @param shownValues
     * @param translated
     * @param json
     */
    factory.translateObjectProperty = function (itsSubject, eigenschaft, shownValues, translated, json) {

      var SPARQL = "";

      if(eigenschaft.optional) {
        SPARQL += "OPTIONAL { \n";
      }

      if(eigenschaft.operator === "MUST") {
        //Special-property has to be translated with ?alias instead of it's URI
        var tailoredURI = eigenschaft.uri;
        if(eigenschaft.uri == 'test/specialObjectProperty') {
          tailoredURI = '?' + 'unknownConnection';
        } else {
          tailoredURI = '<'+ tailoredURI + '>';
        }
        SPARQL += "?" + itsSubject.alias + " " + tailoredURI + " ?";

        if(typeof eigenschaft.link.linkPartner != "undefined") {
          SPARQL +=  eigenschaft.link.linkPartner + " .\n";
          
          for(i = 0; i < json.SUBJECTS.length; i++) {
            if(json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
              SPARQL +=  factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
            }
          }
        } else {
          SPARQL +=  eigenschaft.alias  + " .\n";
          if(eigenschaft.optional) {
            SPARQL += "}\n";
          }
          shownValues[shownValues.length] =  + eigenschaft.alias;
        }
      }

      if(eigenschaft.operator === "MUST_NOT") {
        if(typeof eigenschaft.link.linkPartner != "undefined") {
          for(i = 0; i < json.SUBJECTS.length; i++) {
            if(json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
              SPARQL +=  factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
            }
          }

          SPARQL += "FILTER NOT EXISTS { ?"  + itsSubject.alias + " <" + eigenschaft.uri + "> ?" + eigenschaft.link.linkPartner + " } .\n";
        } else {
          SPARQL += "FILTER NOT EXISTS { ?" + itsSubject.alias + " <" + eigenschaft.uri + "> ?"  + eigenschaft.alias + " } .\n";
        }
      }

      if(eigenschaft.operator === "IS_OF") {
        SPARQL +=  "?" + itsSubject.alias + " ^<" + eigenschaft.uri +  "> ?"  + eigenschaft.link.linkPartner + " .\n";
        for(i = 0; i < json.SUBJECTS.length; i++) {
          if(json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
            SPARQL +=  factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
          }
        }
      }

      if(eigenschaft.operator === "IS_NOT_OF") {
        for(var i = 0; i < json.SUBJECTS.length; i++) {
          if(json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
            SPARQL +=  factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
          }
        }
        SPARQL += "FILTER NOT EXISTS { ?" + itsSubject.alias + " ^<" + eigenschaft.uri +  "> ?" + eigenschaft.link.linkPartner + " } .\n";
      }

		  if(eigenschaft.optional) {
        SPARQL += "}\n";
      }
		  
      return SPARQL;
    };

	  
    /**
     * function to translate Datatype properties. Checks for operator of property
     * @param itsSubject
     * @param eigenschaft
     * @param shownValues
     * @param translated
     * @param json
     */
    factory.translateDatatypeProperty = function (itsSubject, eigenschaft, shownValues, translated, json) {

      var SPARQL = "";
      var x,y;
      x = "?" + itsSubject.alias + "_" + eigenschaft.alias;
      y = x;
      if(eigenschaft.operator === "MUST") {

        if (eigenschaft.optional) {
          SPARQL += "OPTIONAL { \n";
        }

        if (eigenschaft.arithmetic !== null && eigenschaft.arithmetic != "x") {
          x = y + "_temp";
          SPARQL += "?" + itsSubject.alias + " <" + eigenschaft.uri + "> " + x + ".\n";
          SPARQL += "BIND ((" + eigenschaft.arithmetic.replace(/x/g, x) + ") as " + y + ") .\n";
        }
        else {

          //Tailors the uri if the subject is thing.
          // Necessary because Properties have URIs like: <http://dbpedia.org/ontology/Person/weight> but <http://dbpedia.org/ontology/weight> is needed
          var tailoredURI = eigenschaft.uri;
          if (itsSubject.uri == 'test/Thing' && eigenschaft.uri !== 'test/specialDatatypeProperty') {
            var prop = tailoredURI.substr(tailoredURI.lastIndexOf('/'), tailoredURI.length - 1);
            tailoredURI = tailoredURI.substr(0, tailoredURI.lastIndexOf('/'));
            tailoredURI = tailoredURI.substr(0, tailoredURI.lastIndexOf('/')) + prop;

          }

          //Special-property has to be translated with ?alias instead of it's URI
          tailoredURI = '<' + tailoredURI + '>';
          if (eigenschaft.uri == 'test/specialDatatypeProperty') {
            tailoredURI = '?' + eigenschaft.alias;
          }

          SPARQL += "?" + itsSubject.alias + " " + tailoredURI + " " + y + " .\n";
        }

        if (eigenschaft.compare !== null) {

          SPARQL += "FILTER ( "
          + eigenschaft.compare
            .replace(/%before_arithmetic%/g, x)
            .replace(/%after_arithmetic%/g, y)
          + " ) .\n";


        }

        if (eigenschaft.optional) {
          SPARQL += "}\n";
        }

      }


      if(eigenschaft.operator === "MUST_NOT") {
        SPARQL += "FILTER NOT EXISTS { ?" +  itsSubject.alias + " <" + eigenschaft.uri + "> ?" +  y + " } .\n";
      }


      if(eigenschaft.view === true) {
        shownValues[shownValues.length] =  itsSubject.alias + "_" + eigenschaft.alias;
      }

      return SPARQL;
    };
	  
	  
	  

	  

    /**
     * little helper function to replace spaces in aliases with an underscore
     * @param json
     */
    factory.replaceAliasSpaces = function (json) {

      var patt = new RegExp("[^A-Za-z0-9_]","g");


      for(var i = 0; i < json.SUBJECTS.length; i++) {
        
        json.SUBJECTS[i].alias = json.SUBJECTS[i].alias.replace(patt, "_");
        
        for(var j = 0; j < json.SUBJECTS[i].properties.length; j++) {
          
          json.SUBJECTS[i].properties[j].alias = json.SUBJECTS[i].properties[j].alias.replace(patt, "_");
        }
      }
      return json;
    };

	  
    /**
     * little helper function to check, if an object obj is present in an array arr
     * @param arr
     * @param obj
     */
    factory.presentInArray = function (arr, obj) {

      for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return true;
      }
      return false;
    };
	  
	  
	  
    /*  ----------------- START MOCKUP ONLY ----------------- 	
	      
        /**
        * Function to exchange mockup-URIs with dbpedia counterparts
        ** @param json
        *
        factory.changeURIs = function (json) {

        for(var i = 0; i < json.SUBJECTS.length; i++) {
        
        json.SUBJECTS[i].uri = factory.findURI(json.SUBJECTS[i].uri, json.SUBJECTS[i].label);
        
        for(var j = 0; j < json.SUBJECTS[i].properties.length; j++) {
        
        json.SUBJECTS[i].properties[j].uri = factory.findURI(json.SUBJECTS[i].properties[j].uri, json.SUBJECTS[i].label);
        }
        }

        return json;
        };	

        *
        **
        * Helper function for changeURIs to find specific URIs for given mockup URI (and label if necessary)
        
        factory.findURI = function (oldURI, label) {
        
        if(oldURI === "mockup/Firma.json") return "http://dbpedia.org/ontology/Company";
        
        if(oldURI === "mockup/heisst.json") return "http://dbpedia.org/property/name";

        if(oldURI === "mockup/beschaeftigtenZahl.json" && label === "Firma") return "http://dbpedia.org/ontology/numberOfEmployees";
        
        if(oldURI === "mockup/beschaeftigtenZahl.json" && label === "Uni") return "http://dbpedia.org/ontology/numberOfAcademicStaff";

        if(oldURI === "mockup/Land.json") return "http://dbpedia.org/ontology/Country";
        
        if(oldURI === "mockup/einwohnerZahl.json") return "http://dbpedia.org/ontology/populationTotal";	// GEHT NICHT FUER LAND
        
        if(oldURI === "mockup/flaeche.json") return "http://dbpedia.org/ontology/areaTotal";
        
        if(oldURI === "mockup/Person.json") return "http://dbpedia.org/ontology/Person";
        
        if(oldURI === "mockup/alter.json") return "http://dbpedia.org/ontology/birthDate";
        
        if(oldURI === "mockup/gehalt.json") return "http://dbpedia.org/ontology/salary";
        
        if(oldURI === "mockup/fachsemester.json") return "mockup/fachsemester.json";				// FEHLT							
        
        if(oldURI === "mockup/studiert_an.json") return "http://dbpedia.org/ontology/university";
        
        if(oldURI === "mockup/arbeitet_bei.json") return "http://dbpedia.org/ontology/employer";
        
        if(oldURI === "mockup/lebt_in.json") return "http://dbpedia.org/ontology/residence";
        
        if(oldURI === "mockup/vorname.json") return "http://dbpedia.org/ontology/GivenName";		// GEHT NICHT
        
        if(oldURI === "mockup/nachname.json") return "http://dbpedia.org/ontology/Surname";		// GEHT NICHT
        
        if(oldURI === "mockup/Stadt.json") return "http://dbpedia.org/ontology/Settlement";
        
        if(oldURI === "mockup/matrikelnummer.json") return "mockup/matrikelnummer.json";			// FEHLT
        
        if(oldURI === "mockup/studiert.json") return "mockup/studiert.json";						// FEHLT
        
        if(oldURI === "mockup/gruendungsjahr.json" && label === "Stadt") return "http://dbpedia.org/ontology/foundingYear";
        
        if(oldURI === "mockup/gruendungsjahr.json" && label === "Uni") return "http://dbpedia.org/ontology/formationYear";
        
        if(oldURI === "mockup/liegt_in.json" && label === "Stadt") return "http://dbpedia.org/ontology/nation";     // GEHT NICHT
        
        if(oldURI === "mockup/liegt_in.json" && label === "Uni") return "http://dbpedia.org/ontology/locationCity"; // GEHT NICHT
        
        if(oldURI === "mockup/Studiengang.json") return "mockup/Studiengang.json";				// FEHLT
        
        if(oldURI === "mockup/Universitaet.json") return "http://dbpedia.org/ontology/University";
        
        if(oldURI === "mockup/bietet_an.json") return "mockup/bietet_an.json";					// FEHLT
        
        return "";
        };
	      
	      
	      
        /*  ----------------- END MOCKUP ONLY ----------------- */		
	  
    return factory;

  }]);
