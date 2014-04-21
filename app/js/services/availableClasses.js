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

      $http.get(globalConfig.baseURL + 'mockup/classes.json')
        .success(function (data) {

          $log.info('Available Classes loaded from server.');

          var availClasses = data.results.bindings;

          for(var key in availClasses) {
            if (availClasses.hasOwnProperty(key)) {
              asc.push(
                {
                  alias: availClasses[key].alias.value,
                  uri: availClasses[key].class.value,
                  comment: availClasses[key].comment ? availClasses[key].comment.value : 'No description available.'
                }
              );
            }
          }
        })
        .error(function () {
          $log.error('Available Classes could not be loaded from server.');
        });
    };


    /**
     * Returns properties of a SPARQL-Class given by the classes uri.
     * In other words: the properties have the given class as their 'propertyDomain'.
     * 
     * @param uri the uri identifiying the SPARQL-Class.
     */
    var availableProperties = {};
    
    factory.getProperties = function (uri) {
      $log.info('Lade die Properties von ' + uri);

      //Retrieve Properties from Server and add them to availableProperties
      $http.get(globalConfig.baseURL + uri).success(function (data){
        $log.info(' Properties loaded from: ' + uri, data);
        var returnedProperties = data.results.bindings;
        for(var key in returnedProperties){
          if(returnedProperties.hasOwnProperty(key)){
            factory.addToAvailableProperties(returnedProperties[key]);
          }
        }
      }).error(function(){
        $log.error('Error loading properties from: ' + uri)
      });
      return availableProperties;
    };

    /**
     * Returns properties that have a SPARQL-Class, given by its uri, as their respective 'propertyRange'.
     *
     * @param uri the uri of the SPARQL-Class.
     */
    factory.getInverseProperties = function (uri) {
      return {};
    };

    /**
     * Returns whether an property is an objectProperty
     * @param propertyRange
     * @returns {boolean}
     */
    factory.isObjectProperty = function (propertyRange) {
      var dataTypeURIs = globalConfig['dataTypeURIs'];
      for(var key in dataTypeURIs){
        if(dataTypeURIs.hasOwnProperty(key) && propertyRange.startsWith(dataTypeURIs[key])){
          return false;
        }
      }
      return true;
    };

    /**
     * Adds a given property to the availableProperties of a subjectInst
     * @param property
     * @namespace property.propertyURI
     */
    factory.addToAvailableProperties = function (property) {
      var propertyURI = property.propertyURI.value,
        propertyRange = property.propertyRange.value,
        isObjectProperty = (factory.isObjectProperty(propertyRange));
      if(availableProperties.hasOwnProperty(propertyURI)){
        availableProperties[propertyURI].propertyRange.push(propertyRange);
      } else {
        availableProperties[propertyURI] = {
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

    return factory;

  }]);
