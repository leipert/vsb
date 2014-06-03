'use strict';
/**
 * EndPointService
 * A Service, which gets the available SPARQL classes from the Server.
 *
 * @namespace data.results.bindings
 *
 */

angular.module('GSB.services.endPoint', ['GSB.config'])
  .factory('EndPointService', ['$http', '$q', '$log', 'globalConfig', function ($http, $q, $log, globalConfig) {
    var factory = {};

    /**
     * Writes available SPARQL-Classes into a given array.
     */
    factory.getAvailableClasses = function () {

      // Get Available Subject Classes from Server

      return $http.get(
        globalConfig.queryURL + encodeURIComponent(
          globalConfig.getClassesSPARQLQuery.replace(/%lang%/g,globalConfig.standardLang)
        )
      )
        .then(function (response) {

          if(typeof response.data === 'object') {
            $log.info(' Available Classes loaded from server');
            return createAvailableClassesObject(response.data.results.bindings);
          }else{
            return $q.reject(response);
          }


        }, function (response) {
          $log.error( 'Available Classes could not be loaded from server.');
          return $q.reject(response);
        });
    };

    factory.availableProperties = '';

    //Includes the available classes of an endpoint
    var createAvailableClassesObject = function(availClasses){
      var ret = [];
      for (var key in availClasses) {
        if (availClasses.hasOwnProperty(key)) {
          var tClass = availClasses[key], alias,
            comment = 'No description available.',
            uri = tClass.uri.value;
          
          if(tClass.hasOwnProperty("alias")){
            alias = tClass.alias.value;
          } else{
            alias = uri.substr(uri.lastIndexOf('/') + 1);
          }

          if(tClass.hasOwnProperty("comment")){
            comment = tClass.comment.value;
          }
          
          ret.push(
            {
              alias: alias ,
              uri: uri,
              comment: comment
        }
          );
        }

      }

      //Adding special class 'Thing' to the array of available classes
      ret.push(
        {
          alias: 'Thing',
          uri: 'test/Thing',
          comment: 'The class Thing is an anonymous class for searching without knowing the subjects class.'
        }
      );
      return ret;
    };

    //Includes available properties of a subject
    var createAvailablePropertyObject = function (data) {
      var ret = [],retMap = {};
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var property = data[key],
            propertyURI = property.uri.value,
            propertyRange = null,
            propertyType = "STANDARD_PROPERTY",
            propertyComment = "",
            propertyAlias = "";

          /* Check whether the propertyAlias is undefined and if so, fill it with last part of the URI.*/
          if (property.hasOwnProperty("alias")) {
            propertyAlias = property.alias.value;
          } else {
            propertyAlias = propertyURI.substr(propertyURI.lastIndexOf('/') + 1);
          }

          if (property.hasOwnProperty("comment")) {
            propertyComment = property.comment.value;
          }

          if (property.hasOwnProperty("range")) {
            propertyRange = property.range.value;
          }

          /* Check whether a propertyRange is given.*/
          if (property.inverse.value === "I") {
            propertyType = "INVERSE_PROPERTY";
            propertyAlias = "is " + propertyAlias + " of";
          } else {
            propertyType = getPropertyType(propertyRange);
          }


          /* If we already have a property with the same URI,
           then we just add the propertyRange to the corresponding URI. */
          if (!ret.hasOwnProperty(propertyURI)) {
            ret.push({
              alias: propertyAlias,
              comment: propertyComment,
              uri: propertyURI,
              type: propertyType,
              propertyRange: [],
              view: true,
              optional: false,
              operator: null,
              link: null,
              arithmetic: "x",
              compare: null
            });
            retMap[propertyURI] = ret.length - 1;
          }

          if (propertyRange != null) {
            ret[retMap[propertyURI]].propertyRange.push(propertyRange);
          }

        }
      }



      return ret;
    };


    //TODO: get it to woek again.
    var createAvailableURIs = function (data) {
      var ret = {};

      //Create array of all classesURI
      var allClassURIS = new Array();
      for (var key in data) {
        allClassURIS[key] = data[key].class.value;
      }


      //Add both types of special Properties
      ret['test/specialObjectProperty'] = {
        alias: 'unknownConnection',
        uri: 'test/specialObjectProperty',
        type: 'OBJECT_PROPERTY',
        propertyRange: allClassURIS,
        view: true,
        operator: "MUST", //Vorprojekt okay
        link: null, //Vorprojekt okay
        arithmetic: "x", //Vorprojekt leave empty
        compare: null //Vorprojekt leave empty
      };

      ret['test/specialDatatypeProperty'] = {
        alias: 'unknownProperty',
        uri: 'test/specialDatatypeProperty',
        type: 'DATATYPE_PROPERTY',
        propertyRange: [],
        view: true,
        operator: "MUST", //Vorprojekt okay
        link: null, //Vorprojekt okay
        arithmetic: "x", //Vorprojekt leave empty
        compare: null //Vorprojekt leave empty
      };


      return ret;
    };


    /**
     * Returns the type of a Property
     * @param propertyRange
     * @returns string
     */
    var getPropertyType = function (propertyRange) {
      if (propertyRange !== null) {
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
        .then(function (response) {

          if(typeof response.data === 'object') {
            $log.info(' Properties loaded from: ' + uri, response);
            return createAvailablePropertyObject(response.data.results.bindings);
          }else{
            return $q.reject(response);
          }
        }, function (response) {
          $log.error('Error loading properties from: ' + uri);
          return $q.reject(response);
        }
      );
    };


    /**
     * Function to build a SPARQL query to get all normal (not if-of) properties of a via URI specified class
     *
     * @param uri the URI of the class
     * @return query The SPARQL query as an encoded string
     */
    factory.buildAllPropertyQuery = function (uri) {
      var query = globalConfig.queryURL,

        param = globalConfig.getPropertiesSPARQLQuery
          .replace(/%uri%/g, uri)
          .replace(/%lang%/g, globalConfig.standardLang)
          .replace(/\s+/, ' ');

      query += encodeURIComponent(param);
      //TODO SPECIAL PROPERTIES!
      if (uri === 'test/Thing') {
        query = 'http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=select+distinct+%3FpropertyDomain+%3FpropertyURI+%3FpropertyRange+%3FpropertyAlias+where+{{%3FanonyClass+rdfs%3AsubClassOf%2B+%3Fclass.%0D%0A++++++++++++++++++++++++++++++++{%3FpropertyURI+rdfs%3Adomain+%3Fclass+.+%0D%0A%0D%0A+++++++++++++++++++++++++++++++++%3FpropertyURI+rdfs%3Adomain+%3FpropertyDomain+.%0D%0A+++++++++++++++++++++++++++++++++OPTIONAL+{+%3FpropertyURI+rdfs%3Arange+%3FpropertyRange+.+}+.%0D%0A+++++++++++++++++++++++++++++++++OPTIONAL+{%0D%0A++++++++++++++++++++++++++++++++++++++++++++%3FpropertyURI+rdfs%3Alabel+%3FpropertyAlias.%0D%0A++++++++++++++++++++++++++++++++++++++++++++FILTER%28LANGMATCHES%28LANG%28%3FpropertyAlias%29%2C+%22en%22%29%29%0D%0A++++++++++++++++++++++++++++++++++++++++++}+.+%0D%0A+++++++++++++++++++++++++++++++++OPTIONAL+{%0D%0A++++++++++++++++++++++++++++++++++++++++++++%3FpropertyURI+rdfs%3Acomment+%3FpropertyComment.%0D%0A++++++++++++++++++++++++++++++++++++++++++++FILTER%28LANGMATCHES%28LANG%28%3FpropertyComment%29%2C+%22en%22%29%29%0D%0A++++++++++++++++++++++++++++++++++++++++++}%0D%0A++++++++++++++++++++++++++++++++}%0D%0A+++++++++++++++++++++++}+%0D%0A%0D%0A++++++++++++++++++++++UNION+{%0D%0A+++++++++++++++++++++++%3FpropertyURI+rdfs%3Adomain+%3FanonyClass.+%3FpropertyURI+rdfs%3Adomain+%3FpropertyDomain+.%0D%0A+++++++++++++++++++++++OPTIONAL+{+%3FpropertyURI+rdfs%3Arange+%3FpropertyRange+.+}+.%0D%0A+++++++++++++++++++++++OPTIONAL+{+%3FpropertyURI+rdfs%3Alabel+%3FpropertyAlias.%0D%0A+++++++++++++++++++++++FILTER%28LANGMATCHES%28LANG%28%3FpropertyAlias%29%2C+%22en%22%29%29+}+.+%0D%0A+++++++++++++++++++++++OPTIONAL+{+%3FpropertyURI+rdfs%3Acomment+%3FpropertyComment.%0D%0A+++++++++++++++++++++++FILTER%28LANGMATCHES%28LANG%28%3FpropertyComment%29%2C+%22en%22%29%29+}+}}&format=json&timeout=30000&debug=on';
      }
      return query;
    };

    return factory;

  }]);
