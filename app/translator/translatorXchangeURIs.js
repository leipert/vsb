

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
  return changeURIs(JSON.parse(string));
}

/*
 * Function to exchange mockup-URIs with dbpedia counterparts
 */
function changeURIs(json) {

  for(var i = 0; i < json.SUBJECTS.length; i++) {
 
    json.SUBJECTS[i].uri = findURI(json.SUBJECTS[i].uri, json.SUBJECTS[i].label);
   
    for(var j = 0; j < json.SUBJECTS[i].properties.length; j++) {
   
      json.SUBJECTS[i].properties[j].uri = findURI(json.SUBJECTS[i].properties[j].uri, json.SUBJECTS[i].label);
    }
  }

  return translateAll(json);
}


/*
 * Helper function for changeURIs to find specific URIs for given mockup URI and label if necessary
 */
function findURI(oldURI, label) {
  
  if(oldURI === "mockup/Firma.json") return "http://dbpedia.org/ontology/Company";
  
  if(oldURI === "mockup/heisst.json") return "http://dbpedia.org/property/name";

  if(oldURI === "mockup/beschaeftigtenZahl.json" && label === "Firma") return "http://dbpedia.org/ontology/numberOfEmployees";
  
  if(oldURI === "mockup/beschaeftigtenZahl.json" && label === "Uni") return "http://dbpedia.org/ontology/numberOfAcademicStaff";

  if(oldURI === "mockup/Land.json") return "http://dbpedia.org/ontology/Country";
  
  if(oldURI === "mockup/einwohnerZahl.json") return "http://dbpedia.org/ontology/populationTotal";	// GEHT NICHT FUER LAND
  
  if(oldURI === "mockup/flaeche.json") return "http://dbpedia.org/ontology/areaTotal";
  
  if(oldURI === "mockup/Person.json") return "http://dbpedia.org/ontology/Person";
  
  if(oldURI === "mockup/alter.json") return "http://dbpedia.org/ontology/birthDate";
  
  if(oldURI === "mockup/gehalt.json") return "http://dbpedia.org/ontology/salary";
  
  if(oldURI === "mockup/fachsemester.json") return "mockup/fachsemester.json";				// FEHLT							
  
  if(oldURI === "mockup/studiert_an.json") return "http://dbpedia.org/ontology/university";
  
  if(oldURI === "mockup/arbeitet_bei.json") return "http://dbpedia.org/ontology/employer";
  
  if(oldURI === "mockup/lebt_in.json") return "http://dbpedia.org/ontology/residence";
  
  if(oldURI === "mockup/vorname.json") return "http://dbpedia.org/ontology/GivenName";		// GEHT NICHT
  
  if(oldURI === "mockup/nachname.json") return "http://dbpedia.org/ontology/Surname";		// GEHT NICHT
  
  if(oldURI === "mockup/Stadt.json") return "http://dbpedia.org/ontology/Settlement";
 
  if(oldURI === "mockup/matrikelnummer.json") return "mockup/matrikelnummer.json";			// FEHLT
  
  if(oldURI === "mockup/studiert.json") return "mockup/studiert.json";						// FEHLT
  
  if(oldURI === "mockup/gruendungsjahr.json" && label === "Stadt") return "http://dbpedia.org/ontology/foundingYear";
  
  if(oldURI === "mockup/gruendungsjahr.json" && label === "Uni") return "http://dbpedia.org/ontology/formationYear";
  
  if(oldURI === "mockup/liegt_in.json" && label === "Stadt") return "http://dbpedia.org/ontology/nation";     // GEHT NICHT
  
  if(oldURI === "mockup/liegt_in.json" && label === "Uni") return "http://dbpedia.org/ontology/locationCity"; // GEHT NICHT
  
  if(oldURI === "mockup/Studiengang.json") return "mockup/Studiengang.json";				// FEHLT
  
  if(oldURI === "mockup/Universitaet.json") return "http://dbpedia.org/ontology/University";
  
  if(oldURI === "mockup/bietet_an.json") return "mockup/bietet_an.json";					// FEHLT
  
  
  return "";
}






/*
 *  main function, takes a JSON-object, looks for the main class and starts translation there, and in the end adds shown values and SPARQL-'header' (e.g. SELECT DISTINCT..)
 */
function translateAll (json) {

  var shownValues = [];
  var translated = [];
  var SPARQL = "";

  json = replaceAliasSpaces(json);

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
 * little helper function to replace spaces in aliases with an underscore
 */
function replaceAliasSpaces(json) {

  var patt = new RegExp("[^A-Za-z0-9_]","g");


  for(var i = 0; i < json.SUBJECTS.length; i++) {
 
    json.SUBJECTS[i].alias = json.SUBJECTS[i].alias.replace(patt, "_");
   
    for(var j = 0; j < json.SUBJECTS[i].properties.length; j++) {
   
      json.SUBJECTS[i].properties[j].alias = json.SUBJECTS[i].properties[j].alias.replace(patt, "_");
    }
  }
  
  return json;
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