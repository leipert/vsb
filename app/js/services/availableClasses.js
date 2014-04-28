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

          for (var key in availClasses) {
            if (availClasses.hasOwnProperty(key)) {
              asc.push(
                {
                  alias: availClasses[key].class.value.substr(availClasses[key].class.value.lastIndexOf('/') + 1, availClasses[key].class.value.length - (availClasses[key].class.value.lastIndexOf('/') + 1)),
                  uri: availClasses[key].class.value,
                  comment: availClasses[key].comment ? availClasses[key].comment.value : 'No description available.'
                }
              );
            }
          }

        }, function (error) {
          $log.error(error, 'Available Classes could not be loaded from server.');
        });
    };

    return factory;

  }])
  .factory('AvailablePropertiesService', ['$http', '$log', 'globalConfig', function ($http, $log, globalConfig) {
    var factory = {};


	
	factory.availableProperties = '';
	
	
    var createAvailablePropertyObject = function(data) {

      var ret = {};
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var property = data[key],
              propertyURI = property.propertyURI.value,
              propertyRange = null;

          /* Check whether a propertyRange is given.*/
          if (property.hasOwnProperty("propertyRange")) {
            propertyRange = property.propertyRange.value;

          }
          var propertyType = getPropertyType(propertyRange);

		   /* Check whether the propertyAlias is undefined and if so, fill it with last part of the URI.*/
		  if (!property.hasOwnProperty("propertyAlias")) {
		  
            property['propertyAlias'] = {'value' : {}};
			property.propertyAlias.value = propertyURI.substr(propertyURI.lastIndexOf('/') + 1, propertyURI.length - (propertyURI.lastIndexOf('/') + 1));
          }

		  
          /* If we already have a property with the same URI,
           then we just add the propertyRange to the corresponding URI. */
          if (ret.hasOwnProperty(propertyURI)) {
            ret[propertyURI].propertyRange.push(propertyRange);
          } else {
            ret[propertyURI] = {
              alias: property.propertyAlias.value,
              uri: propertyURI,
              type: propertyType,
              propertyRange: [propertyRange],
              view: true,
              operator: "MUST", //Vorprojekt okay
              link: {direction: "TO", linkPartner: null}, //Vorprojekt okay
              arithmetic: "x", //Vorprojekt leave empty
              compare: null //Vorprojekt leave empty
            };
          }
        }
      }
      return ret;
    };

    /**
     * Returns the type of a Property
     * @param propertyRange
     * @returns string
     */
    var getPropertyType = function (propertyRange) {
      if(propertyRange !== null) {
        var conf = globalConfig['propertyTypeURIs'];
        for (var key in conf) {
          if (conf.hasOwnProperty(key)) {
            for (var i = 0, j = conf[key].length; i < j; i++) {
              if (propertyRange.search(conf[key][i]) > -1) {
                return key;
              }
            }
          }
        }
      }
      return 'STANDARD_PROPERTY';
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
          factory.availableProperties = factory.mergeTwoObjects(createAvailablePropertyObject(response.data.results.bindings), factory.availableProperties);

          $log.info(' Properties loaded from: ' + uri, response);
          
		  return factory.getParentClassProperties(uri)
		         .then( function() {
         
		             return factory.availableProperties; 
				   })
				  
				 .then (function(availableProperties) {
                   return availableProperties;
                  });
 
        }, function(response) { $log.error('Error loading properties from: ' + uri) }
		)};
	
	
	factory.getParentClassProperties = function (uri) {
	
	  return $http
	         .get(globalConfig.testURLstart + escape('select ?parent where { <' + uri + '> rdfs:subClassOf ?parent . }') + globalConfig.testURLend)
             .then(function(response) {
	
	            if((typeof response.data.results.bindings[0] != 'undefined')) {
				
			        var parentClassURI = response.data.results.bindings[0].parent.value;
			
			        return factory.getProperties(parentClassURI);
			    }
	          });
	};
	
	
	
	/**
     * Function to build a SPARQL query to get all normal (not if-of) properties of a via URI specified class 
     * 
     * @param uri the URI of the class
	 * @return query The SPARQL query as an encoded string
     */ 
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
	
	/**
     * Helper function to merge two objects
     * 
     * @param obj1 the merged Object
     */ 
	factory.mergeTwoObjects = function (obj1, obj2) {
	   
	   for (var key in obj2) {
         obj1[key] = obj2[key];
       }
	
	  return obj1;
	};

    /**
     * Returns inverse properties of a SPARQL-Class given by the classes uri.
     * 
     * @param uri the uri identifiying the SPARQL-Class.
     */    
    factory.getInverseProperties = function (uri) {
      $log.info('Lade die Properties von ' + uri);
      
	    
      //Retrieve Properties from Server and add them to availableProperties
      return $http.get(factory.buildAllInversePropertyQuery(uri))
        .then(function(response) {
		      
		      
          var availableProperties = createAvailablePropertyObject(response.data.results.bindings);
          $log.info(' Properties loaded from: ' + uri, response);
          
          return availableProperties;

        }, function(response) {
          $log.error('Error loading properties from: ' + uri)
        });
      
    };

	  factory.buildAllInversePropertyQuery = function (uri) {
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
