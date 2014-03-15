
// WIRD NOCH KOMMENTIERT & WEITERBEARBEITET!  NOCH KEINE APPANBINDUNG

/*
 *  test function, to run a translation (together with testHTML.html)
 */
function test (){

  var erg = translateAll();
  alert(erg);
  return erg;
}


/*
 *  main function, looks for the main class and starts translation there, and in the end adds shown values and SPARQL-'header' (e.g. SELECT DISTINCT..)
 *  For now, the JSON is stored and parsed locally in this function
 */
function translateAll () {

  var obj = '{  "START": {"type": "LIST_ALL","link": {"direction" :"TO", "linkPartner" : "Universitaet"}},"CLASS1": {"view": true,"alias": "Universitaet","uri": "ex:Unviversitaet","xCord": 120,"yCord": 100,"properties": [{"typ": "OBJECT_PROPERTY","view": true,"alias": "Standort","operator": "CAN","property": "ex: StandortOf","link": {"direction": "TO","linkPartner": "Stadt"}}]  },    "CLASS2": {        "view": true,        "alias": "Stadt",        "uri": "ex:Stadt",        "xCord": 220,        "yCord": 400,        "properties": [            {                "typ": "DATATYP_PROPERTY",                "view": true,                "alias": "Population",                "operator": "CAN",                "property": "ex: PopoulationOf",                "arithmetic": {},               "compare": {}           }       ]   }}';
  var json = JSON.parse(obj);
  
  var shownValues = [];
  var translated = [];
  var SPARQL = "";

  
  for(i in json) 
	{
		if(i!=='START')
			{
			if(json[i].alias === json['START'].link.linkPartner)
				{ 
				SPARQL +=  translateSubject(json[i], shownValues, translated, json);
				}
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
	SPARQLStart += "?" + shownValues[i]+ " ";
  }
  
  return SPARQLStart
}


/*
 * Function to translate a subject. Calls all translate-property functions for all the subjects properties
 */
function translateSubject (oneSubject, shownValues, translated, json) {

  var SPARQL = "";
  

  if(!presentInArray(translated, oneSubject.alias)) {  
    SPARQL += "?" + oneSubject.alias + " a " + oneSubject.uri + " .\n";
  
    if(oneSubject.view) {
      shownValues[shownValues.length] = oneSubject.alias;
	}
  
	translated[translated.length] = oneSubject.alias;
	
	
	for(i in oneSubject.properties) {
	  SPARQL += translateEigenschaft(oneSubject, oneSubject.properties[i], shownValues, translated, json) + '\n';
	}
  }
  
  return SPARQL;
}


/*
 * function to translate properties. Checks for type and operator of property, calls translateSubject when necessary
 */
function translateEigenschaft (itsSubject, eigenschaft, shownValues, translated, json) {

  var SPARQL = "";

  
  if(eigenschaft.typ === "OBJECT_PROPERTY") {
  
    if(eigenschaft.operator === "MUST" || eigenschaft.operator === "CAN") { 
	    
	  if(eigenschaft.operator === "CAN") { 
	    SPARQL += "OPTIONAL { ";
	  }
	  
      SPARQL += "?" + itsSubject.alias + " " + eigenschaft.property + " ?";
       
	  if(typeof eigenschaft.link.linkPartner != "undefined") {
		   
	    SPARQL += eigenschaft.link.linkPartner + " .\n";
		  
		if(eigenschaft.operator === "CAN") { 
		  SPARQL += "}\n";
		}
		  
        for(i in json) {
		  if(i!=='START') {
		    if(json[i].alias === eigenschaft.link.linkPartner) { 
			  SPARQL +=  translateSubject(json[i], shownValues, translated, json); 
			}		
		  }
	    }
	  }
	  
	  else { 
	    SPARQL += eigenschaft.alias  + " .\n"; ;
		if(eigenschaft.operator === "CAN") { 
		  SPARQL += "}\n";
		}
	    shownValues[shownValues.length] = eigenschaft.alias;
	  }  
	  
     

    }
  
  
    if(eigenschaft.operator === "IS_OF") {
	
	  SPARQL += itsSubject.alias + " ^" + eigenschaft.property +  " " + itsSubject.link.linkPartner + " .\n";    
	  SPARQL += translateSubject(itsSubject.link.linkPartner, shownValues, translated, json);
	}
  
  
    if(eigenschaft.operator === "IS_NOT_OF") {
	
	  SPARQL += translateSubject(itsSubject.link.linkPartner, shownValues, translated, json);	  
	  SPARQL += "FILTER NOT EXIST { " + itsSubject.alias + " ^" + eigenschaft.property +  " " + itsSubject.link.linkPartner + " } .\n";
	}

	  
  }
  
  else if(eigenschaft.typ === "DATATYP_PROPERTY") {
  
    SPARQL += "?" + itsSubject.alias + " " + eigenschaft.property + " ?" + eigenschaft.alias + " .\n";
	shownValues[shownValues.length] = eigenschaft.alias;
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