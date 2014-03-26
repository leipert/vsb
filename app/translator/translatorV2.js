

/*
 *  test function, to run a translation (together with testHTML.html)
 *  For now, the JSON is stored and parsed locally in this function
 */
function test (){

  var obj = '{  "START": {    "type": "LIST_ALL",    "link": {      "direction": "TO",      "linkPartner": "Mensch"    }  },  "SUBJECTS": [    {      "alias": "Mensch",      "uri": "/app/mockup/Person.json",      "properties": [        {          "alias": "lebt in",          "uri": "/app/mockup/lebt_in.json",          "type": "OBJECT_PROPERTY",          "isObjectProperty": true,         "propertyType": [            "/app/mockup/Stadt.json",            "/app/mockup/Land.json"          ],          "view": true,          "operator": "MUST",          "link": {            "direction": "TO",            "linkPartner": "Stadt"          },          "arithmetic": {},          "compare": {}        }      ]    },    {      "alias": "Stadt",      "uri": "/app/mockup/Stadt.json",      "properties": [        {          "alias": "Einwohnerzahl",          "uri": "/app/mockup/einwohnerZahl.json",          "type": "DATATYPE_PROPERTY",          "isObjectProperty": false,          "propertyType": [            "http://www.w3.org/2001/XMLSchema#integer"          ],          "view": true,          "operator": "MUST",          "link": {           "direction": "TO",           "linkPartner": ""          },          "arithmetic": {},          "compare": {}        }      ]    }  ]}';
  var json = JSON.parse(obj);

  var erg = translateAll(json);
  alert(erg);
  return erg;
}


function translateAllFromString(string){
  return translateAll(JSON.parse(string));
}


/*
 *  main function, takes a JSON-object, looks for the main class and starts translation there, and in the end adds shown values and SPARQL-'header' (e.g. SELECT DISTINCT..)
 */
function translateAll (json) {

  var shownValues = [];
  var translated = [];
  var SPARQL = "";


  for(var i = 0; i < json.SUBJECTS.length; i++)
  {
    if(json.SUBJECTS[i].alias === json['START'].link.linkPartner)
    {
      SPARQL +=  translateSubject(json.SUBJECTS[i], shownValues, translated, json, "");
    }
  }


  return translateStartpoint(json, shownValues) + "\nwhere {\n" + SPARQL + "\n}";
}


/*
 * Function to translate the beginning of a SPARQL query, including the shown values
 */
function translateStartpoint (json, shownValues) {

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

  return SPARQLStart
}


/*
 * Function to translate a subject. Calls all translate-property functions for all the subjects properties
 */
function translateSubject (oneSubject, shownValues, translated, json, prefix) {

  var SPARQL = "";

  
  if(!presentInArray(translated, oneSubject.alias)) {
    SPARQL += "?" + prefix + oneSubject.alias + " a <" + oneSubject.uri + "> .\n";

    if(oneSubject.view) {
      shownValues[shownValues.length] = prefix + oneSubject.alias;
    }

    translated[translated.length] = oneSubject.alias;


    for(i in oneSubject.properties) {

      if(oneSubject.properties[i].type === "OBJECT_PROPERTY") {
        SPARQL += translateObjectProperty(oneSubject, oneSubject.properties[i], shownValues, translated, json, prefix) + '\n';
      }
      else if(oneSubject.properties[i].type === "DATATYPE_PROPERTY") {
        SPARQL += translateDatatypeProperty(oneSubject, oneSubject.properties[i], shownValues, translated, json, prefix) + '\n';
      }
    }
  }

  return SPARQL;
}


/*
 * function to translate Object properties. Checks for operator of property, calls translateSubject when necessary
 */
function translateObjectProperty (itsSubject, eigenschaft, shownValues, translated, json, prefix) {

  var SPARQL = "";

  if(eigenschaft.operator === "MUST" || eigenschaft.operator === "CAN") {

    if(eigenschaft.operator === "CAN") {
      SPARQL += "OPTIONAL { \n";
    }

    SPARQL += "?" + prefix + itsSubject.alias + " <" + eigenschaft.uri + "> ?";

    if(typeof eigenschaft.link.linkPartner != "undefined") {

      SPARQL += itsSubject.alias + "_" + eigenschaft.link.linkPartner + " .\n";

      if(eigenschaft.operator === "CAN") {
        SPARQL += "}\n";
      }

      for(var i = 0; i < json.SUBJECTS.length; i++) {

        if(json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
          SPARQL +=  translateSubject(json.SUBJECTS[i], shownValues, translated, json, itsSubject.alias + "_");
        }
      }
    }

    else {
      SPARQL += itsSubject.alias + "_" + eigenschaft.alias  + " .\n"; ;
      if(eigenschaft.operator === "CAN") {
        SPARQL += "}\n";
      }
      shownValues[shownValues.length] = itsSubject.alias + "_" + eigenschaft.alias;
    }



  }

  if(eigenschaft.operator === "MUST_NOT") {

    if(typeof eigenschaft.link.linkPartner != "undefined") {

      for(var i = 0; i < json.SUBJECTS.length; i++) {
        if(json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
          SPARQL +=  translateSubject(json.SUBJECTS[i], shownValues, translated, json, itsSubject.alias + "_");
        }
      }

      SPARQL += "FILTER NOT EXIST { ?" + prefix + itsSubject.alias + " <" + eigenschaft.uri + "> ?" + itsSubject.alias + "_" + eigenschaft.link.linkPartner + " } .\n";
    }

    else {
      SPARQL += "FILTER NOT EXIST { ?" + prefix + itsSubject.alias + " <" + eigenschaft.uri + "> ?" + itsSubject.alias + "_" + eigenschaft.alias + " } .\n";
    }
  }


  if(eigenschaft.operator === "IS_OF") {

    SPARQL += prefix + itsSubject.alias + " ^<" + eigenschaft.uri +  "> " + itsSubject.alias + "_" + eigenschaft.link.linkPartner + " .\n";

    for(var i = 0; i < json.SUBJECTS.length; i++) {
      if(json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
        SPARQL +=  translateSubject(json.SUBJECTS[i], shownValues, translated, json, itsSubject.alias + "_");
      }
    }

  }


  if(eigenschaft.operator === "IS_NOT_OF") {

    for(var i = 0; i < json.SUBJECTS.length; i++) {
      if(json.SUBJECTS[i].alias === eigenschaft.link.linkPartner) {
        SPARQL +=  translateSubject(json.SUBJECTS[i], shownValues, translated, json, itsSubject.alias + "_");
      }
    }

    SPARQL += "FILTER NOT EXIST { " + prefix + itsSubject.alias + " ^<" + eigenschaft.uri +  "> " + itsSubject.alias + "_" + eigenschaft.link.linkPartner + " } .\n";
  }

  return SPARQL;
}


/*
 * function to translate Datatype properties. Checks for operator of property
 */
function translateDatatypeProperty (itsSubject, eigenschaft, shownValues, translated, json, prefix) {

  var SPARQL = "";

  if(eigenschaft.operator === "MUST" || eigenschaft.operator === "CAN") {

    if(eigenschaft.operator === "CAN") {
      SPARQL += "OPTIONAL { \n";
    }


    if(typeof eigenschaft.arithmetic.operator != "undefined") {

      SPARQL += "?" + prefix + itsSubject.alias + " <" + eigenschaft.uri + "> ?" + prefix + itsSubject.alias + "_" + eigenschaft.alias + "_temp .\n";
      SPARQL += "BIND (( ?" + prefix + itsSubject.alias + "_" + eigenschaft.alias + "_temp " + eigenschaft.arithmetic.operator + " " + eigenschaft.arithmetic.amount + " ) as ?" + prefix + itsSubject.alias + "_" + eigenschaft.alias + ") .\n";
    }
    else {
      SPARQL += "?" + prefix + itsSubject.alias + " <" + eigenschaft.uri + "> ?" + prefix + itsSubject.alias + "_" + eigenschaft.alias + " .\n";
    }


    if(typeof eigenschaft.compare.operator != "undefined") {

      SPARQL += "FILTER ( ?" + prefix + itsSubject.alias + "_" + eigenschaft.alias + " " + eigenschaft.compare.operator + " " + eigenschaft.compare.amount + " ) .\n";
    }

    if(eigenschaft.operator === "CAN") {
      SPARQL += "}\n";
    }
  }


  if(eigenschaft.operator === "MUST_NOT") {
    SPARQL += "FILTER NOT EXIST { ?" + prefix + itsSubject.alias + " <" + eigenschaft.uri + "> ?" + prefix + itsSubject.alias + "_" + eigenschaft.alias + " } .\n";
  }


  if(eigenschaft.view === true) {
    shownValues[shownValues.length] = prefix + itsSubject.alias + "_" + eigenschaft.alias;
  }

  return SPARQL;
}


/*
 * little helper function to check, if an object obj is present in an array arr
 */
function presentInArray(arr, obj) {

  for(var i=0; i<arr.length; i++) {
    if (arr[i] == obj) return true;
  }

  return false;
}