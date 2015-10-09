# overwrite.js

Without an `overwrite.js` file, the VSB is configured to take https://leipert.io/sparql as Endpoint.
Examples of `overwrite.js` files can be found in the [config folder](../config/).

## Basic structure

The `overwrite.js is a basic angular.js file, which gets executed before the app runs. The minimum structure would be:

```javascript
'use strict';

angular.module('VSB.config')
    .config(function (globalConfig) {
        globalConfig.name = 'FOO';
        //...
    });
```
The `globalConfig.name` property must be set. You can replace `//...` with other config properties you want to overwrite.

## List of properties
- `globalConfig.name`: **mandatory** This name is used for saving queries in the localStorage of the user.
- `globalConfig.baseURL`: URL for meta queries, where the VSB gets its classes and properties. Default: `https://leipert.io/sparql`
- `globalConfig.resultURL`: URL for result queries. (Default): `https://leipert.io/sparql?timeout=5000&debug=on`
- [`globalConfig.defaultGraphURIs`](#defaultGraphURIs)
- [`globalConfig.prefixes`](#prefixes)
- [`globalConfig.endPointQueries`](#endPointQueries)
- [`globalConfig.propertyTypeByRange`](#propertyTypeByRange)
- [`globalConfig.propertyTypeByType`](#propertyTypeByType)
- TODO: defaultProperties, resultFormats, allowedLanguages, fallBackLanguages


### defaultGraphURIs<a name="defaultGraphURIs"></a>
Default Graph URIS, used in meta and result queries. Defaults to:
```javascript
    globalConfig.defaultGraphURIs = ['http://xmlns.com/foaf/0.1/', 'http://vsb.leipert.io/ns/'];
```

### endPointQueries<a name="endPointQueries"></a>
Queries used to recieve metadata from server, defaults to
```javascript
    globalConfig.endPointQueries = {
        getDirectProperties: '<%uri%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?class .' +
            '?uri rdfs:domain ?class .' +
            'OPTIONAL { ?uri rdfs:range ?range }  .' +
            'OPTIONAL { ?uri rdf:type ?type }  .' +
            'OPTIONAL { ?uri rdfs:label ?label . BIND(LANG(?label) AS ?label_loc) } .' +
            'OPTIONAL { ?uri rdfs:comment ?comment . BIND(LANG(?comment) AS ?comment_loc) } .' +
            'FILTER ( !isBlank(?class) && !isBlank(?uri) && !isBlank(?range) ) ',
        getInverseProperties: '<%uri%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?class .' +
            '?uri rdfs:range ?class .' +
            'OPTIONAL { ?uri rdfs:domain ?range }  .' +
            'OPTIONAL { ?uri rdf:type ?type }  .' +
            'OPTIONAL { ?uri rdfs:label ?label . BIND(LANG(?label) AS ?label_loc) } .' +
            'OPTIONAL { ?uri rdfs:comment ?comment . BIND(LANG(?comment) AS ?comment_loc) } .' +
            'FILTER ( !isBlank(?class) && !isBlank(?uri) && !isBlank(?range) ) ',
        getSuperAndEqClasses: '<%uri%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?uri ' +
            'FILTER ( !isBlank(?uri) )',
        getSubAndEqClasses: '<%uri%> (^rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?uri ' +
            'FILTER ( !isBlank(?uri) )',
        getAvailableClasses: '{?uri a rdfs:Class .} UNION {?uri a owl:Class .} .' +
            'FILTER ( !isBlank(?uri) )' +
            'OPTIONAL { ?uri rdfs:label ?label . BIND(LANG(?label) AS ?label_loc) } .' +
            'OPTIONAL { ?uri rdfs:comment ?comment . BIND(LANG(?comment) AS ?comment_loc)} '
    }
});
```

If you just want to overwrite one of the queries you can do so:

```javascript
    globalConfig.endPointQueries.getDirectProperties = //...
```

The queries just contain the inner part of a SPARQL SELECT Query (so SELECT { **QUERY** }).
The used query parameters are mandatory, otherwise

Below are all used queries explained:

#### getAvailableClasses

Loads all available classes from the endpoint.
Contains the query parameters:

- `?uri` **mandatory**: the uri of the class
- `?label` & `?label_loc` _optional_: contain the label of the class and it's language
- `?comment` & `?comment_loc` _optional_: contain the comment for a class and it's language

Defaults to:

```SPARQL
{?uri a rdfs:Class .} UNION {?uri a owl:Class .} .
FILTER ( !isBlank(?uri) ) .
OPTIONAL { ?uri rdfs:label ?label . BIND(LANG(?label) AS ?label_loc) } .
OPTIONAL { ?uri rdfs:comment ?comment . BIND(LANG(?comment) AS ?comment_loc)}
```

#### getDirectProperties

Loads all direct properties of a class, once a class is added to the workspace.
For example Person : age : integer or Person: Employer : Company.
Contains the query parameters:

- `<%uri%>` **mandatory**: Will be replaced with the uri of the class we want properties for.
- `?uri` **mandatory**: the uri of the property
- `?range` _optional_: range of the property (e.g. Integer, Organization, ...)
- `?type` _optional_: type of the property (e.g. Integer, ObjectProperty, ...)
- `?label` & `?label_loc` _optional_: contain the label of the class and it's language
- `?comment` & `?comment_loc` _optional_: contain the comment for a class and it's language

Defaults to:

```SPARQL
<%uri%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?class .
?uri rdfs:domain ?class .
OPTIONAL { ?uri rdfs:range ?range }  .
OPTIONAL { ?uri rdf:type ?type }  .
OPTIONAL { ?uri rdfs:label ?label . BIND(LANG(?label) AS ?label_loc) } .
OPTIONAL { ?uri rdfs:comment ?comment . BIND(LANG(?comment) AS ?comment_loc) } .
FILTER ( !isBlank(?class) && !isBlank(?uri) && !isBlank(?range) )
```

#### getInverseProperties

Loads all inverse properties of a class, once a class is added to the workspace.
For example Company : Employee : Person.
Contains the query parameters:

- `<%uri%>` **mandatory**: Will be replaced with the uri of the class we want properties for.
- `?uri` **mandatory**: the uri of the property
- `?range` _optional_: range of the property (e.g. Integer, Organization, ...)
- `?type` _optional_: type of the property (e.g. Integer, ObjectProperty, ...)
- `?label` & `?label_loc` _optional_: contain the label of the class and it's language
- `?comment` & `?comment_loc` _optional_: contain the comment for a class and it's language

Defaults to:

```SPARQL
<%uri%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?class .
?uri rdfs:range ?class .
OPTIONAL { ?uri rdfs:range ?range }  .
OPTIONAL { ?uri rdf:type ?type }  .
OPTIONAL { ?uri rdfs:label ?label . BIND(LANG(?label) AS ?label_loc) } .
OPTIONAL { ?uri rdfs:comment ?comment . BIND(LANG(?comment) AS ?comment_loc) } .
FILTER ( !isBlank(?class) && !isBlank(?uri) && !isBlank(?range) )
```

#### getSuperAndEqClasses

Loads all super and equivalent classes of a class once this class is added to the workspace.
Contains the query parameters:

- `<%uri%>` **mandatory**: Will be replaced with the uri of the class.
- `?uri` **mandatory**: the uri of super & equivalent classes

Defaults to:

```SPARQL
<%uri%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?uri
FILTER ( !isBlank(?uri) )
```

#### getSubAndEqClasses

Loads all sub and equivalent classes of a range of a property, once this property is added to a subject.
Contains the query parameters:

- `<%uri%>` **mandatory**: Will be replaced with the uri of the property range.
- `?uri` **mandatory**: the uri of sub & equivalent classes

Defaults to:

```SPARQL
<%uri%> (^rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?uri
FILTER ( !isBlank(?uri) )
```

### prefixes<a name="prefixes"></a>
Prefixes used in meta and result queries. Defaults to:
```javascript
    globalConfig.prefixes = {
        'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
        'foaf': 'http://xmlns.com/foaf/0.1/',
        'owl': 'http://www.w3.org/2002/07/owl#',
        'vsb': 'http://vsb.leipert.io/ns/'
    }
```

If you don't want to overwrite the default prefixes, you simply can add some using lodash's merge:

```javascript
    globalConfig.prefixes = _.merge(globalConfig.prefixes,{
        bibrm: 'http://vocab.ub.uni-leipzig.de/bibrm/'
    });
```

### propertyTypeByRange<a name="propertyTypeByRange"></a>
Mapping from the range of a property to an internal property type. Defaults to
```javascript
    globalConfig.propertyTypeByRange = {
      'http://vsb.leipert.io/ns/': 'OBJECT_PROPERTY',
      'http://xmlns.com/foaf/0.1/': 'OBJECT_PROPERTY',
      'http://www.w3.org/2001/XMLSchema#(integer|float|double|decimal|positiveInteger|nonNegativeInteger)': 'NUMBER_PROPERTY',
      'http://www.w3.org/2001/XMLSchema#(string|literal)': 'STRING_PROPERTY',
      'http://www.w3.org/2001/XMLSchema#date': 'DATE_PROPERTY'
    }
```

### propertyTypeByType<a name="propertyTypeByType"></a>
Mapping from the property type to an internal property type. Defaults to
```javascript
    globalConfig.propertyTypeByType = {
      'http://www.w3.org/2002/07/owl#ObjectProperty': 'OBJECT_PROPERTY'
    }
```

