'use strict';

// Loads all our components
angular.module('GSB', [
  'GSB.config',
  'GSB.filters',
  'GSB.controllers.main',
  'GSB.controllers.subjectCollection',
  'GSB.controllers.subjectInstance',
  'GSB.controllers.propertyCollection',
  'GSB.controllers.propertyInstance',
  'GSB.controllers.propertyType.object',
  'GSB.controllers.propertyType.number',
  'GSB.directives.subject',
  'GSB.directives.property',
  'GSB.directives.startPoint',
  'GSB.directives.propertyType.object',
  'GSB.directives.propertyType.number',
  'GSB.services.availableClasses',
  'GSB.services.translatorManager',
  'GSB.services.translatorToJSON',
  'GSB.services.translatorToSPARQL'
]);

//Global functions

//Define "str1".startsWith("str2") if undefined.
if (typeof String.prototype.startsWith != 'function') {
  /**
   * Returns whether the String starts with the given str
   * @param str
   * @returns {boolean}
   */
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}
