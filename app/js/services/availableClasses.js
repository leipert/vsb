'use strict';
/**
 * AvailableClassesService
 * A Service, which gets the available SPARQL classes from the Server.
 *
 * @namespace data.results.bindings
 *
 */

angular.module('GSB.services.availableClasses', ['GSB.config'])
  .factory('AvailableClassesService', ['$http', '$log', 'globalConfig', function ($http, $log, globalConfig) {
    var factory = {};

    /**
     * Writes available SPARQL-Classes into a given array.
     *
     * @param asc the array into which the availableClasses will be written
     */
    factory.getAvailableClasses = function (asc) {

      // Get Available Subject Classes from Server

      return $http.get(globalConfig.testURLstart + escape('select ?class where {?class a owl:Class .}') + globalConfig.testURLend)
        .then(function (response) {

          $log.info('Available Classes loaded from server.');
          
          var availClasses = response.data.results.bindings;

          for(var key in availClasses) {
            if (availClasses.hasOwnProperty(key)) {
              asc.push(
                {
                  alias: availClasses[key].class.value.substr(availClasses[key].class.value.lastIndexOf('/')+1, availClasses[key].class.value.length - (availClasses[key].class.value.lastIndexOf('/')+1)),
                  uri: availClasses[key].class.value,
                  comment: availClasses[key].comment ? availClasses[key].comment.value : 'No description available.'
                }
              );
            }
          }
          
        }, function(error) {
          $log.error(error, 'Available Classes could not be loaded from server.');
        });
    };

    return factory;

  }])
  .factory('AvailablePropertiesService', ['$http', '$log', 'globalConfig', function ($http, $log, globalConfig) {
    var factory = {};

    var createAvailablePropertyObject = function(data) {
      var ret = {};
      for(var key in data) {
        if(data.hasOwnProperty(key)){
		
		  var property = data[key];
		  
		  var isObjectProperty = (isObjProp(property));
          var propertyURI = property.propertyURI.value;
		  if(property.hasOwnProperty("propertyRange"))
             {var propertyRange = property.propertyRange.value;}
		  else
		     {var propertyRange = null;}
          if(ret.hasOwnProperty(propertyURI)){
            ret[propertyURI].propertyRange.push(propertyRange);
          } else {
		  
		  ret[propertyURI] = {
              alias: property.propertyAlias.value,
              uri: propertyURI,
              type: isObjectProperty ? 'OBJECT_PROPERTY' : 'DATATYPE_PROPERTY',
              isObjectProperty: isObjectProperty,
              propertyRange: [propertyRange],
              view: true,
              operator: "MUST", //Vorprojekt okay
              link : {direction: "TO", linkPartner: null}, //Vorprojekt okay
              arithmetic : {} , //Vorprojekt leave empty
              compare : {} //Vorprojekt leave empty
            };
          }
        }
      }
      return ret;
    }

    /**
     * Returns whether an property is an objectProperty
     * @param propertyRange
     * @returns {boolean}
     */
    var isObjProp = function (property) {

      if(property.hasOwnProperty("propertyRange"))
	     {    
		  var propertyRange = property.propertyRange.value;
          var dataTypeURIs = globalConfig['dataTypeURIs'];
          for(var key in dataTypeURIs){
               if(dataTypeURIs.hasOwnProperty(key) && propertyRange.startsWith(dataTypeURIs[key]))
			       {return false;}
           }
         return true;
	     }
	  else  {return false;}
    };

    /**
     * Returns properties of a SPARQL-Class given by the classes uri.
     * In other words: the properties have the given class as their 'propertyDomain'.
     * 
     * @param uri the uri identifiying the SPARQL-Class.
     */    
    factory.getProperties = function (uri) {
      $log.info('Lade die Properties von ' + uri);
      
	  
      //Retrieve Properties from Server and add them to availableProperties
      return $http.get(factory.buildAllPropertyQuery(uri))
        .then(function(response) {
		
		
          var availableProperties = createAvailablePropertyObject(response.data.results.bindings);
          $log.info(' Properties loaded from: ' + uri, response);
          
          return availableProperties;

        }, function(response) {
          $log.error('Error loading properties from: ' + uri)
        });
      
    };

	factory.buildAllPropertyQuery = function (uri) {
	  var query = globalConfig.testURLstart;
	
	  query += escape('select distinct ?propertyDomain ?propertyURI ?propertyRange ?propertyAlias where {{<');
	  query += escape(uri);
	  query += escape(  '> rdfs:subClassOf+ ?class.{?propertyURI rdfs:domain ?class . '
                      + ' ?propertyURI rdfs:domain ?propertyDomain .'
                      + 'OPTIONAL { ?propertyURI rdfs:range ?propertyRange . } .'
                      + 'OPTIONAL {'
                      + '  ?propertyURI rdfs:label ?propertyAlias.'
                      + '   FILTER(LANGMATCHES(LANG(?propertyAlias), "en"))'
                      + ' } . '
                      + '   OPTIONAL {'
                      + '  ?propertyURI rdfs:comment ?propertyComment.'
                      + ' FILTER(LANGMATCHES(LANG(?propertyComment), "en"))'
                      + '  }'
                      + '  }'
                      + '  } UNION {'
                      + '  ?propertyURI rdfs:domain <');
	  query += escape(uri);
      query += escape(  '>. ?propertyURI rdfs:domain ?propertyDomain .'
                      + ' OPTIONAL { ?propertyURI rdfs:range ?propertyRange . } .'
                      + ' OPTIONAL { ?propertyURI rdfs:label ?propertyAlias.'
                      + ' FILTER(LANGMATCHES(LANG(?propertyAlias), "en")) } . '
                      + ' OPTIONAL { ?propertyURI rdfs:comment ?propertyComment.'
                      + ' FILTER(LANGMATCHES(LANG(?propertyComment), "en")) } }}'  );	  
	  query += globalConfig.testURLend;
	  return query;
	};
	
    return factory;

  }]);
