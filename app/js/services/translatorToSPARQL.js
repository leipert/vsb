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

	  // Array of aggregate Objects which need to be applied to header in the end
	  var aggregateValues = [];
	  
      for(var i = 0; i < json.SUBJECTS.length; i++)
      {
        if(json.SUBJECTS[i].alias === json['START'].link.linkPartner)
        {
          SPARQL +=  factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
        }
      }

	 SPARQL += factory.translateInverseSubjects(shownValues, translated, json);
	  
    return factory.translateStartpoint(json, shownValues, aggregateValues) + "\nwhere {\n" + SPARQL + "\n} LIMIT 200";
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
   *
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
  */

	

    /**
     * Function to translate the header of a SPARQL query, including the shown values
     * @param json
     * @param shownValues
     */
    factory.translateStartpoint = function (json, shownValues, aggregateValues) {

      var SPARQLStart = "";

      if(json.START.type === "LIST_ALL")   {
        SPARQLStart = "SELECT DISTINCT ";
      } else {
        SPARQLStart = "SELECT ";
      }

	  // remove all aggregated alias from shown values
	  for(var i = 0; i < aggregateValues.length; i++) {
	    for(var k = 0; k < shownValues.length; k++) {
          if(aggregateValues[i].aliasToDelete = shownValues[k]) {
		      shownValues.splice(k, k);
		  }
        }
      }
	  
	  
      for(var j = 0; j < shownValues.length; j++) {
        SPARQLStart += "?" + shownValues[j] + " ";
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
		  else if(oneSubject.properties[i].type === "AGGREGATE_PROPERTY") {
		    aggregateValues = factory.translateAggregateProperty(oneSubject, oneSubject.properties[i], shownValues, translated, json, aggregateValues);
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
	    $log.info("OPTIONAL PROP  - " + eigenschaft.alias); 
        SPARQL += "OPTIONAL { \n";
      }

      if(eigenschaft.operator === globalConfig.propertyOperators[0].value) {
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

      if(eigenschaft.operator === globalConfig.propertyOperators[1].value) {
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

      if(eigenschaft.operator === globalConfig.inversePropertyOperators[0].value) {
        SPARQL +=  "?" + itsSubject.alias + " ^<" + eigenschaft.uri +  "> ?"  + eigenschaft.link.linkPartner + " .\n";
        for(i = 0; i < json.SUBJECTS.length; i++) {
          if(json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
            SPARQL +=  factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
          }
        }
      }

      if(eigenschaft.operator === globalConfig.inversePropertyOperators[1].value) {
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
	  
	  
	  if (eigenschaft.optional) {
          SPARQL += "OPTIONAL { \n";
        }
	  
      if(eigenschaft.operator === globalConfig.propertyOperators[0].value) {


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
      }


      if(eigenschaft.operator === globalConfig.propertyOperators[1].value) {
        SPARQL += "FILTER NOT EXISTS { ?" +  itsSubject.alias + " <" + eigenschaft.uri + "> ?" +  y + " } .\n";
      }


      if(eigenschaft.view === true) {
        shownValues[shownValues.length] =  itsSubject.alias + "_" + eigenschaft.alias;
      }

	  
	  if (eigenschaft.optional) {
          SPARQL += "}\n";
        }
	
      return SPARQL;
    };
	  
	  
	/**
     * function to translate Aggregate properties. Checks for operator of property
     * @param itsSubject
     * @param eigenschaft
     * @param shownValues
     * @param translated
     * @param json
     */  
    factory.translateAggregateProperty = function (itsSubject, eigenschaft, shownValues, translated, json, aggregateValues) {

	  var index = aggregateValue.length;
	  aggregateValue[index] = {aggregateString : '', aliasToDelete : ''};
	
      
	  if(eigenschaft.operator === globalConfig.aggregateOperators[0].value) {
	  
	  }
	  else if(eigenschaft.operator === globalConfig.aggregateOperators[1].value) {
	  
	  }
	  else if(eigenschaft.operator === globalConfig.aggregateOperators[2].value) {
	  
	  }
	  
	  aggregateValue[index].aliasToDelete = eigenschaft.operator.substr(eigenschaft.operator.indexOf('%') + 1, eigenschaft.operator.lastIndexOf('%') );
	
	  return aggregateValues;
	}

	
	
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
	  
    return factory;

  }]);
