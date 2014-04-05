/** @namespace data.results.bindings */

'use strict';

angular.module('GSB.services.availableClasses', [])
  .factory('availableClassesService', ['$http', '$log', 'globalConfig', function ($http, $log, globalConfig) {
    var factory = {};

    /**
     * Writes available SPARQL-Classes into a given array.
     *
     * @param asc the array into which the availableClasses will be written
     */
    var get = function (asc) {

      // Get Available Subject Classes from Server

      $http.get(globalConfig.baseURL + 'mockup/classes.json')
        .success(function (data) {

          $log.info('Available Classes loaded from server.')

          var availClasses = data.results.bindings;

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
        })
        .error(function () {
          $log.error('Available Classes could not be loaded from server.')
        });
    };

    return factory;

  }]);
