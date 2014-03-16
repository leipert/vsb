
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

  var obj = '{  "START": {"type": "LIST_ALL","link": {"direction" :"TO", "linkPartner" : "Universitaet"}},"CLASS1": {"view": true,"alias": "Universitaet","URI": "ex:Unviversitaet","xCord": 120,"yCord": 100,"properties": [{"type": "OBJECT_PROPERTY","view": true,"alias": "Standort","operator": "MUST_NOT","URI": "ex: StandortOf","link": {"direction": "TO","linkPartner": "Stadt"}}]  },    "CLASS2": {        "view": true,        "alias": "Stadt",        "URI": "ex:Stadt",        "xCord": 220,        "yCord": 400,        "properties": [            {                "type": "DATATYP_PROPERTY", "view": true, "alias": "Population", "operator": "MUST", "property": "ex: PopoulationOf", "arithmetic": {"operator" : "+" , "amount" : 250}, "compare": {"operator" : "<" , "amount" : 1000}           }       ]   }}';
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
    SPARQL += "?" + oneSubject.alias + " a " + oneSubject.URI + " .\n";
  
    if(oneSubject.view) {
      shownValues[shownValues.length] = oneSubject.alias;
	}
  
	translated[translated.length] = oneSubject.alias;
	
	
	for(i in oneSubject.properties) {
	
	  if(oneSubject.properties[i].type === "OBJECT_PROPERTY") {
	    SPARQL += translateObjectProperty(oneSubject, oneSubject.properties[i], shownValues, translated, json) + '\n';
	  }
	  else if(oneSubject.properties[i].type === "DATATYP_PROPERTY") { 
	    SPARQL += translateDatatypeProperty(oneSubject, oneSubject.properties[i], shownValues, translated, json) + '\n';
	  }	  
	}
  }
  
  return SPARQL;
}


/*
 * function to translate Object properties. Checks for operator of property, calls translateSubject when necessary
 */
function translateObjectProperty (itsSubject, eigenschaft, shownValues, translated, json) {

  var SPARQL = "";

  if(eigenschaft.operator === "MUST" || eigenschaft.operator === "CAN") { 
	    
	if(eigenschaft.operator === "CAN") { 
	  SPARQL += "OPTIONAL { \n";
	}
	  
    SPARQL += "?" + itsSubject.alias + " " + eigenschaft.URI + " ?";
       
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
  
  if(eigenschaft.operator === "MUST_NOT") {  
  
    if(typeof eigenschaft.link.linkPartner != "undefined") {
	  
      for(i in json) {
		if(i!=='START') {
		  if(json[i].alias === eigenschaft.link.linkPartner) { 
			SPARQL +=  translateSubject(json[i], shownValues, translated, json); 
		  }		
		}
	  }
    }
    
    SPARQL += "FILTER NOT EXIST { ?" + itsSubject.alias + " " + eigenschaft.URI + " ?" + eigenschaft.link.linkPartner + " } .\n";
    	
  }
  
  
  if(eigenschaft.operator === "IS_OF") {
  
	SPARQL += itsSubject.alias + " ^" + eigenschaft.URI +  " " + eigenschaft.link.linkPartner + " .\n"; 
	
	for(i in json) {
	  if(i!=='START') {
		if(json[i].alias === eigenschaft.link.linkPartner) { 
		  SPARQL +=  translateSubject(json[i], shownValues, translated, json); 
		}		
	  }
	}
	
  }
  
  
  if(eigenschaft.operator === "IS_NOT_OF") {
	
    for(i in json) {
	  if(i!=='START') {
		if(json[i].alias === eigenschaft.link.linkPartner) { 
		  SPARQL +=  translateSubject(json[i], shownValues, translated, json); 
		}		
	  }
	} 
	
	SPARQL += "FILTER NOT EXIST { " + itsSubject.alias + " ^" + eigenschaft.URI +  " " + eigenschaft.link.linkPartner + " } .\n";
  }

  return SPARQL;
}
  
  
/*
 * function to translate Datatype properties. Checks for operator of property
 */  
function translateDatatypeProperty (itsSubject, eigenschaft, shownValues, translated, json) {

  var SPARQL = "";

  if(eigenschaft.operator === "MUST" || eigenschaft.operator === "CAN") { 
	    
    if(eigenschaft.operator === "CAN") { 
	  SPARQL += "OPTIONAL { \n";
	}
	  
	  
    if(typeof eigenschaft.arithmetic.operator != "undefined") { 
	
	  SPARQL += "?" + itsSubject.alias + " " + eigenschaft.URI + " ?" + eigenschaft.alias + "_temp .\n";
	  SPARQL += "BIND (( ?" + eigenschaft.alias + "_temp " + eigenschaft.arithmetic.operator + " " + eigenschaft.arithmetic.amount + " ) as ?" + eigenschaft.alias + ") .\n";  
	}	
    else {	
      SPARQL += "?" + itsSubject.alias + " " + eigenschaft.URI + " ?" + eigenschaft.alias + " .\n";
    }   
	
	
	if(typeof eigenschaft.compare.operator != "undefined") {
		   
	  SPARQL += "FILTER ( ?" + eigenschaft.alias + " " + eigenschaft.compare.operator + " " + eigenschaft.compare.amount + " ) .\n";
	}	  
	
    if(eigenschaft.operator === "CAN") { 
      SPARQL += "}\n";
    }
  }
  
  
  if(eigenschaft.operator === "MUST_NOT") { 
    SPARQL += "FILTER NOT EXIST { ?" + itsSubject.alias + " " + eigenschaft.URI + " ?" + eigenschaft.alias + " } .\n";
  }
  
  
  if(eigenschaft.view === true) {
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