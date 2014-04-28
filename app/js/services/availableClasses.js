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

      return $http.get(globalConfig.baseURL + 'mockup/classes.json')
        .then(function (response) {

          $log.info('Available Classes loaded from server.');

          var availClasses = response.data.results.bindings;

          for (var key in availClasses) {
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

        }, function (error) {
          $log.error(error, 'Available Classes could not be loaded from server.');
        });
    };

    return factory;

  }])
  .factory('AvailablePropertiesService', ['$http', '$log', 'globalConfig', function ($http, $log, globalConfig) {
    var factory = {};

    var createAvailablePropertyObject = function (data) {
      var ret = {};
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var property = data[key];
          var propertyURI = property.propertyURI.value,
            propertyRange = property.propertyRange.value,
            propertyType = getPropertyType(propertyRange);
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
      return $http.get(globalConfig.baseURL + uri)
        .then(function (response) {
          var availableProperties = createAvailablePropertyObject(response.data.results.bindings);
          $log.info(' Properties loaded from: ' + uri, response);

          return availableProperties;

        }, function (response) {
          $log.error('Error loading properties from: ' + uri)
        });

    };

    return factory;

  }]);
