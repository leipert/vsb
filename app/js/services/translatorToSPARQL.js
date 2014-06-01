'use strict';
/**
 * JSON Translator Factory
 * A factory to handle translation of JSON -> SPARQL
 *
 */

angular.module('GSB.services.translatorToSPARQL', ['GSB.config'])
  .factory('TranslatorToSPARQL', ['globalConfig', '$log', function (globalConfig, $log) {

    var factory = {};


    // Array of aggregate Objects which need to be applied to header in the end
    var aggregateValues = [];


    /**
     * Function to start translation process, with call to changeURIs for the mockup data
     * and replaceAliasSpaces to replace spaces with underscores
     * @param json
     */
    factory.translateJSONToSPARQL = function (json) {

	  $log.info('Translate JSON to SPARQL');	
	
      //json = factory.changeURIs(json);

      json = replaceAliasSpaces(json);
	  json = replaceDuplicatePropertyAliases(json);

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
      aggregateValues = [];


      for (var i = 0; i < json.SUBJECTS.length; i++) {
        if (json.SUBJECTS[i].alias === json['START'].link.linkPartner) {
          SPARQL += factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
        }
      }

      return factory.translateStartpoint(json, shownValues) + "\nwhere {\n" + SPARQL + "\n} LIMIT 200";
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
    factory.translateStartpoint = function (json, shownValues) {

      var SPARQLStart = "";

      if (json.START.type === "LIST_ALL") {
        SPARQLStart = "SELECT DISTINCT ";
      } else {
        SPARQLStart = "SELECT ";
      }

      // remove all aggregated alias from shown values
      for (var i = 0; i < aggregateValues.length; i++) {
        for (var k = 0; k < shownValues.length; k++) {
          if (aggregateValues[i].aliasToDelete = shownValues[k]) {
            shownValues.splice(k, k);
          }
        }
      }

      for (var j = 0; j < shownValues.length; j++) {
        SPARQLStart += "?" + shownValues[j] + " ";
      }


      for (var l = 0; l < aggregateValues.length; l++) {
        SPARQLStart += aggregateValues[l].aggregateString;
      }


      var spePro = false;
      //Search for specialProperty in the JSON
      for (i = 0; i < json.SUBJECTS.length; i++) {

        for (var j = 0; j < json.SUBJECTS[i].properties.length; j++) {
          if (json.SUBJECTS[i].properties[j].uri == 'test/specialObjectProperty' || json.SUBJECTS[i].properties[j].uri == 'test/specialDatatypeProperty') {
            spePro = true;
          }
        }
      }
      //If specialProperty is part of the properties it's added to the shown values
      if (spePro) {
        SPARQLStart += '?unknownConnection ';
      }

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
	  
      if (!factory.presentInArray(translated, oneSubject.alias)) {
        if (oneSubject.uri != 'test/Thing')SPARQL += "?" + oneSubject.alias + " a <" + oneSubject.uri + "> .\n";

        if (oneSubject.view) {
          shownValues[shownValues.length] = oneSubject.alias;
        }

        translated[translated.length] = oneSubject.alias;


        for (var i in oneSubject.properties) {

          if (oneSubject.properties[i].type === "OBJECT_PROPERTY" ) {
            SPARQL += factory.translateObjectProperty(oneSubject, oneSubject.properties[i], shownValues, translated, json) + '\n';
          }  else        if (oneSubject.properties[i].type === "INVERSE_PROPERTY") {
            SPARQL += factory.translateInverseProperty(oneSubject, oneSubject.properties[i], shownValues, translated, json) + '\n';
          }
          else if (oneSubject.properties[i].type === "AGGREGATE_PROPERTY") {

            var mainProp;
            for (var j in oneSubject.properties) {
              if (replaceAliasSpacesInString(oneSubject.properties[j].alias) === replaceAliasSpacesInString(oneSubject.properties[i].link.linkPartner)) {
                mainProp = oneSubject.properties[j];
              }
            }
            factory.translateAggregateProperty(oneSubject, oneSubject.properties[i], shownValues, translated, json, mainProp);
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
    factory.translateInverseProperty = function (itsSubject, eigenschaft, shownValues, translated, json) {

      var SPARQL = "";

      if (eigenschaft.optional) {
        $log.info("OPTIONAL PROP  - " + eigenschaft.alias);
        SPARQL += "OPTIONAL { \n";
      }

      if (eigenschaft.operator === globalConfig.inversePropertyOperators[0].value) {
	  
	    SPARQL += "?" + itsSubject.alias + " ^<" + eigenschaft.uri + "> ?";
	  
	    if (typeof eigenschaft.link.linkPartner != "undefined") {
	  
          SPARQL += eigenschaft.link.linkPartner + " .\n";
          for (i = 0; i < json.SUBJECTS.length; i++) {
            if (json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
              SPARQL += factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
            }
          }
		}
		else {
          SPARQL += eigenschaft.alias + " .\n";
		  if (eigenschaft.view) {
		    shownValues[shownValues.length] = eigenschaft.alias;
		  }
		}
      }

      if (eigenschaft.operator === globalConfig.inversePropertyOperators[1].value) {
	  
	    if (typeof eigenschaft.link.linkPartner != "undefined") {
	  
          for (var i = 0; i < json.SUBJECTS.length; i++) {
            if (json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
			  json.SUBJECTS[i].view = false;
              SPARQL += factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
            }
          }
          SPARQL += "FILTER NOT EXISTS { ?" + itsSubject.alias + " ^<" + eigenschaft.uri + "> ?" + eigenschaft.link.linkPartner + " } .\n";
		  
		}
		else {
		  SPARQL += "FILTER NOT EXISTS { ?" + itsSubject.alias + " ^<" + eigenschaft.uri + "> ?" + eigenschaft.alias + " } .\n";
		}
      }

      if (eigenschaft.optional) {
        SPARQL += "}\n";
      }

      return SPARQL;
    };

    factory.translateObjectProperty = function (itsSubject, eigenschaft, shownValues, translated, json) {

      var SPARQL = "";

      if (eigenschaft.optional) {
        SPARQL += "OPTIONAL { \n";
      }


      if (eigenschaft.operator === globalConfig.propertyOperators[0].value) {
        //Special-property has to be translated with ?alias instead of it's URI
        var tailoredURI = eigenschaft.uri;
        if (eigenschaft.uri == 'test/specialObjectProperty') {
          tailoredURI = '?' + 'unknownConnection';
        } else {
          tailoredURI = '<' + tailoredURI + '>';
        }
        SPARQL += "?" + itsSubject.alias + " " + tailoredURI + " ?";

        if (typeof eigenschaft.link.linkPartner != "undefined") {
          SPARQL += eigenschaft.link.linkPartner + " .\n";

          for (var i = 0; i < json.SUBJECTS.length; i++) {
            if (json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
              SPARQL += factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
            }
          }
        } else {
          SPARQL += eigenschaft.alias + " .\n";
          
		  if (eigenschaft.view) {
            shownValues[shownValues.length] = eigenschaft.alias;
		  }
        }
      }

      if (eigenschaft.operator === globalConfig.propertyOperators[1].value) {
        if (typeof eigenschaft.link.linkPartner != "undefined") {
          for (var i = 0; i < json.SUBJECTS.length; i++) {
            if (json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
			  json.SUBJECTS[i].view = false;
              SPARQL += factory.translateSubject(json.SUBJECTS[i], shownValues, translated, json);
            }
          }

          SPARQL += "FILTER NOT EXISTS { ?" + itsSubject.alias + " <" + eigenschaft.uri + "> ?" + eigenschaft.link.linkPartner + " } .\n";
        } else {
          SPARQL += "FILTER NOT EXISTS { ?" + itsSubject.alias + " <" + eigenschaft.uri + "> ?" + eigenschaft.alias + " } .\n";
        }
      }


      if (eigenschaft.optional) {
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
      var x, y;
      x = "?" + itsSubject.alias + "_" + eigenschaft.alias;
      y = x;
		

      if (eigenschaft.optional) {
        SPARQL += "OPTIONAL { \n";
      }

      if (eigenschaft.operator === globalConfig.propertyOperators[0].value) {


        if (eigenschaft.arithmetic !== null && eigenschaft.arithmetic != "%before_arithmetic%") {
          x = y + "_temp";
          SPARQL += "?" + itsSubject.alias + " <" + eigenschaft.uri + "> " + x + ".\n";
          SPARQL += "BIND ((" + eigenschaft.arithmetic.replace(/%before_arithmetic%/g, x) + ") as " + y + ") .\n";
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

        if ((eigenschaft.compare !== '%after_arithmetic%') && (eigenschaft.compare !== null)) {

          SPARQL += "FILTER ( "
          + eigenschaft.compare
            .replace(/%before_arithmetic%/g, x)
            .replace(/%after_arithmetic%/g, y)
          + " ) .\n";


        }
      }


      if (eigenschaft.operator === globalConfig.propertyOperators[1].value) {
        SPARQL += "FILTER NOT EXISTS { ?" + itsSubject.alias + " <" + eigenschaft.uri + "> " + y + " } .\n";
      }


      if ((eigenschaft.view === true) && (eigenschaft.operator !== globalConfig.propertyOperators[1].value)) {
        shownValues[shownValues.length] = itsSubject.alias + "_" + eigenschaft.alias;
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
    factory.translateAggregateProperty = function (itsSubject, eigenschaft, shownValues, translated, json, mainProp) {

      if (eigenschaft.link.linkPartner != 'null' && mainProp != "undefined"  && mainProp.operator != globalConfig.propertyOperators[1].value) {

        var aggAlias;

        if (mainProp.type === "OBJECT_PROPERTY") {
		  if(mainProp.link.linkPartner != undefined) {
            aggAlias = "?" + replaceAliasSpacesInString(mainProp.link.linkPartner);
		  }
		  else {
		    aggAlias = "?" + replaceAliasSpacesInString(eigenschaft.link.linkPartner);
		  }
        }
        else {
          aggAlias = "?" + itsSubject.alias + "_" + replaceAliasSpacesInString(eigenschaft.link.linkPartner);
        }

        aggregateValues.push({
          aggregateString: "(" + eigenschaft.operator.replace('%alias%', aggAlias)
          + " AS " + aggAlias + "_" + eigenschaft.alias + ")", aliasToDelete: eigenschaft.operator.substr(eigenschaft.operator.indexOf('%') + 1, eigenschaft.operator.lastIndexOf('%'))
        });
      }

      return;
    }

	
	
	/**
     * Helper function to replace duplicate property aliases with alternatives
     * @param json
     */
    function replaceDuplicatePropertyAliases(json) {
	
	  var counter = 1;
	  
	  for (var i = 0; i < json.SUBJECTS.length; i++) {
        for (var j = 0; j < json.SUBJECTS[i].properties.length; j++) {
		
		 for (var k = 0; k < json.SUBJECTS.length; k++) {
		
		   for (var l = 0; l < json.SUBJECTS[k].properties.length; l++) {

		     if (json.SUBJECTS[i].properties[j].alias == json.SUBJECTS[k].properties[l].alias && !((i == k) && (j == l))) {
			   json.SUBJECTS[k].properties[l].alias = json.SUBJECTS[k].properties[l].alias + "_" + counter;
			   counter++;				
             }
		    }
		  }
        }
      }
	
	  return json;
	}
	
	

    /**
     * little helper function to replace spaces in aliases with an underscore
     * @param json
     */
    function replaceAliasSpaces(json) {

      for (var i = 0; i < json.SUBJECTS.length; i++) {

        json.SUBJECTS[i].alias = replaceAliasSpacesInString(json.SUBJECTS[i].alias);		

        for (var j = 0; j < json.SUBJECTS[i].properties.length; j++) {
		
          json.SUBJECTS[i].properties[j].alias = replaceAliasSpacesInString(json.SUBJECTS[i].properties[j].alias);
		  
		  if (typeof json.SUBJECTS[i].properties[j].link.linkPartner != "undefined") {
		    json.SUBJECTS[i].properties[j].link.linkPartner = replaceAliasSpacesInString(json.SUBJECTS[i].properties[j].link.linkPartner);
		  }
        }
      }
	  
	  json.START.link.linkPartner = replaceAliasSpacesInString(json.START.link.linkPartner);
	  
      return json;
    };

    /**
     * little helper function to replace spaces in aliases with an underscore
     * @param json
     */
    function replaceAliasSpacesInString(string) {

      var pattern = new RegExp("[^A-Za-z0-9_?]", "g");

      return string.replace(pattern, '_').replace(/_+/g, '_').replace(/^_|_$/, '');
    };


    /**
     * little helper function to check, if an object obj is present in an array arr
     * @param arr
     * @param obj
     */
    factory.presentInArray = function (arr, obj) {

      for (var i = 0; i < arr.length; i++) {
        if (arr[i] == obj) return true;
      }
      return false;
    };

    return factory;

  }]);
