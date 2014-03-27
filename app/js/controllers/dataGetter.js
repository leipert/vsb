'use strict';


angular.module('GSB.factories.dataGetter', []).
  factory('classes', function($http, globalConfig) {
    var factory = {};
    factory.get = function(asc) {
      //  Get Availabe Subject Classes from Server
      $http.get(globalConfig.baseURL + 'mockup/classes.json').success(function(data) {
        var availClasses = data.results.bindings;
        for (var key in availClasses) {
          if(availClasses.hasOwnProperty(key)){
            asc.push(
              {
                alias: availClasses[key].alias.value,
                uri: availClasses[key].class.value,
                comment: availClasses[key].comment ? availClasses[key].comment.value : 'No description available.'
              }
            );
          }
          // console.log(availClasses[key].alias.value);
        }
      }); 
    }
    return factory;
  });
