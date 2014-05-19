
describe('translatorToSPARQL tests', function (){
  var translatorService;
  
  var mockJSON = {
  "START": {
    "type": "LIST_ALL",
    "link": {
      "direction": "TO",
      "linkPartner": "Person"
    }
  },
  "SUBJECTS": [
    {
      "alias": "Person",
      "label": "Person",
      "uri": "http://dbpedia.org/ontology/Person",
      "comment": "Ein Individuum der Spezies Mensch.",
      "view": true,
      "showAdditionalFields": true,
      "showInfos": false,
      "properties": [
        {
          "alias": "birth place",
          "comment": "where the person was born",
          "uri": "http://dbpedia.org/ontology/birthPlace",
          "type": "OBJECT_PROPERTY",
          "propertyRange": [
            "http://dbpedia.org/ontology/Place"
          ],
          "view": true,
          "optional": false,
          "operator": "MUST",
          "link": {},
          "arithmetic": "x",
          "compare": null
        }
      ]
    }
  ]
};

  beforeEach(function (){

  module('myGSB');
  
  inject(function(TranslatorToSPARQL) {
    translatorService = TranslatorToSPARQL;
    });
  });

  it('should have an translateJSONToSPARQL function', function () {
    expect(angular.isFunction(translatorService.translateJSONToSPARQL)).toBe(true);
  });

  it('should translate the mockup JSON', function (){
    var result = translatorService.translateJSONToSPARQL(mockJSON);
    expect(result).not.toBeNull();
  });


});