
// WIRD NOCH KOMMENTIERT & WEITERBEARBEITET!  NOCH KEINE APPANBINDUNG

function test (){

  var erg = translateAll();
  alert(erg);
  return erg;
}

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
				SPARQL +=  translateSubjekt(json[i], shownValues, translated, json);
				}
			}
	}
 
  
  return translateStartpunkt(json, shownValues) + "\nwhere {\n" + SPARQL + "\n}";
  
}


function translateStartpunkt (json, shownValues) {

  var SPARQLStart = "";

  if(json.START.type === "LIST_ALL")   {
    SPARQLStart = "SELECT DISTINCT "; 
  }
  else { SPARQLStart = "SELECT "; }
  
  
  for(var i = 0; i < shownValues.length; i++) {
	SPARQLStart += "?" + shownValues[i]+ " ";
  }
  
  return SPARQLStart
}



function translateSubjekt (oneSubject, shownValues, translated, json) {

  var SPARQL = "";
  

  if(!presentInArray(translated, oneSubject.alias)) 
	{  
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



function translateEigenschaft (itsSubject, eigenschaft, shownValues, translated, json) {


  var SPARQL = "";

  
  
  
    if(eigenschaft.typ === "OBJECT_PROPERTY") {
  
  
      if(eigenschaft.operator === "MUST" || eigenschaft.operator === "CAN") 
	  { 
	    if(eigenschaft.operator === "CAN") { SPARQL += "OPTIONAL { ";}
        SPARQL += "?" + itsSubject.alias + " " + eigenschaft.property + " ?";
       
	    if(typeof eigenschaft.link.linkPartner != "undefined") {
	
	   
	      SPARQL += eigenschaft.link.linkPartner + " .\n";
		  if(eigenschaft.operator === "CAN") { SPARQL += "}\n";}
		    for(i in json) 
	        {
		      if(i!=='START')
			    {
			
			    if(json[i].alias === eigenschaft.link.linkPartner)
				    { 
				    SPARQL +=  translateSubjekt(json[i], shownValues, translated, json); }
				
		   	  }
	      }
	  }
	  else { 
	  alert("else - nach typeofprobe");
	    SPARQL += eigenschaft.alias  + " .\n"; ;
		  if(eigenschaft.operator === "CAN") { SPARQL += "}\n";}
	    shownValues[shownValues.length] = eigenschaft.alias;
	  }  
	  
     

      }
  
  
      if(eigenschaft.operator === "IS_OF") {
	   SPARQL += itsSubject.alias + " ^" + eigenschaft.property +  " " + itsSubject.link.linkPartner + " .";
     
	  translateSubjekt(itsSubject.link.linkPartner, shownValues, translated, json);
	
	  }
  
      

    }
    else if(eigenschaft.typ === "DATATYP_PROPERTY") {
     
	 SPARQL += "?" + itsSubject.alias + " " + eigenschaft.property + " ?" + eigenschaft.alias + " .\n";
	 shownValues[shownValues.length] = eigenschaft.alias;
    }  
  
  
 
  return SPARQL;
}


function translateMUST(itsSubject, eigenschaft, shownValues, translated, json) {




}




function presentInArray(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return true;
    }
	return false;
}