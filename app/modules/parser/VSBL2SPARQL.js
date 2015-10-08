(function () {
    'use strict';
    /**
     * JSON Translator Factory
     * A factory to handle translation of JSON -> SPARQL
     *
     */


    angular.module('VSB.parser.VSBL2SPARQL', [])
        .factory('ParserToSPARQL', VSBL2SPARQL);

    function VSBL2SPARQL() {

        var jassa = new Jassa(Promise, $.ajax);


        var sparql = jassa.sparql;
        var rdf = jassa.rdf;
        var vocab = jassa.vocab;

        /**
         * Variables that will be shown e.g. select distinct ?SHOWN ?VARIABLES from ...
         */
        var shownVariables;
        /**
         * List of variables that should not be shown
         */
        var blockList;
        /**
         * List of aggregates e.g select distinct (MAX(?VAR) AS ?MAX_VAR)
         */
        var aggregates;


        var objects = new sparql.VarExprList(), main = '';


        /**
         * Removes all non-word characters with underscores
         * Trims underscores from beginning and end
         *
         * Example: :aliäös12? -> ali_s12
         *
         * @param string
         * @returns string
         */
        function sanitizeAlias(string) {
            return string.replace(/\W/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
        }

        /**
         * Translates objectProperty
         * @param s
         * @param p
         * @param o
         * @param linkTo
         * @param view
         * @returns {{s: *, p: *, o: *, view: *}}
         */
        function translateObjectProperty(s, p, o, linkTo, view) {
            if (linkTo !== null) {
                o = rdf.NodeFactory.createVar(sanitizeAlias(linkTo));
                view = false;
            }
            return {s: s, p: p, o: o, view: view};
        }


        function translateAggregate(aggregate, subjectAlias, view) {
            var propertyAlias = sanitizeAlias(subjectAlias + ' ' + aggregate.linkTo);
            var alias = sanitizeAlias(propertyAlias + ' ' + aggregate.uri);
            var s = rdf.NodeFactory.createVar(alias);
            var p = rdf.NodeFactory.createVar(propertyAlias);
            aggregate.operator = aggregate.operator.replace(/%alias%/g, p);
            if (view && !shownVariables.contains(s)) {
                aggregates.add(s, aggregate.operator);
            }
            blockList.add(p);
            return [];
        }

        function translateProperty(property, subjectAlias, subjectView) {
            var alias = sanitizeAlias(subjectAlias + ' ' + property.alias),
                uri = property.uri,
                type = property.type,
                triples = new sparql.ElementTriplesBlock(),
                r;
            var s = rdf.NodeFactory.createVar(subjectAlias);
            var p = rdf.NodeFactory.createUri(uri);
            var o = rdf.NodeFactory.createVar(alias);
            var b = o;
            var view = subjectView && property.view;
            if (type === 'AGGREGATE_PROPERTY') {
                return translateAggregate(property, subjectAlias, view);
            }
            if (uri === '$$uri') {
                if (property.compare !== null) {
                    property.compare = property.compare.replace(/%before_arithmetic%/g, s).replace(/%after_arithmetic%/g, s);
                    triples.addTriples([new sparql.ElementFilter(property.compare)]);
                }
                return triples;
            }

            if (type === 'INVERSE_PROPERTY') {
                r = translateObjectProperty(s, p, o, property.linkTo, view);
                s = r.o;
                b = r.s;
                view = r.view;
                type = 'OBJECT_PROPERTY';
            } else if (type === 'OBJECT_PROPERTY') {
                r = translateObjectProperty(s, p, o, property.linkTo, view);
                b = r.o;
                view = r.view;
            }

            if (type === 'OBJECT_PROPERTY') {

                triples.addTriples([new rdf.Triple(s, p, b)]);

                if (property.filterExists) {

                    if (view && !shownVariables.contains(rdf.NodeFactory.createVar(alias))) {
                        shownVariables.add(rdf.NodeFactory.createVar(alias));
                        if (type === 'OBJECT_PROPERTY') {
                            objects.add(rdf.NodeFactory.createVar(alias));
                        }
                    }

                }

                if (!property.filterExists) {
                    triples = new sparql.ElementFilter('NOT EXISTS {' + (triples.toString() + '}'));
                }

            } else {

                if (property.filterExists) {
                    if (property.hasFilter) {
                        if (property.arithmetic !== null) {
                            b = rdf.NodeFactory.createVar(sanitizeAlias(alias + ' ' + 'temp'));
                        }
                    }

                    triples.addTriples([new rdf.Triple(s, p, b)]);

                    if (property.hasFilter) {
                        if (property.arithmetic !== null) {
                            property.arithmetic = property.arithmetic.replace(/%before_arithmetic%/g, b).replace(/%after_arithmetic%/g, o);
                            triples.addTriples([new sparql.ElementBind(o, property.arithmetic)]);
                        }
                        if (property.compare !== null) {
                            property.compare = property.compare.replace(/%before_arithmetic%/g, b).replace(/%after_arithmetic%/g, o);
                            triples.addTriples([new sparql.ElementFilter(property.compare)]);
                        }
                    }

                    if (view && !shownVariables.contains(rdf.NodeFactory.createVar(alias))) {
                        shownVariables.add(rdf.NodeFactory.createVar(alias));
                        if (type === 'OBJECT_PROPERTY') {
                            objects.add(rdf.NodeFactory.createVar(alias));
                        }
                    }
                } else {
                    triples.addTriples([new sparql.ElementFilter('NOT EXISTS {' + (new rdf.Triple(s, p, o).toString() + '}'))]);
                }

            }

            if (property.optional) {
                return new sparql.ElementOptional(triples);
            }

            return triples;
        }

        function translateSubject(subject) {
            var alias = sanitizeAlias(subject.alias),
                s = rdf.NodeFactory.createVar(sanitizeAlias(alias)),
                o = rdf.NodeFactory.createUri(subject.uri),
                ElementTriplesBlock = new sparql.ElementTriplesBlock();
            ElementTriplesBlock.addTriples([new rdf.Triple(s, vocab.rdf.type, o)]);

            if (subject.view && !shownVariables.contains(s, alias)) {
                shownVariables.add(s);
                objects.add(s);
                if (main === '') {
                    main = s;
                }
            }

            if (subject.hasOwnProperty('properties')) {
                subject.properties.forEach(function (property) {
                    ElementTriplesBlock.addTriples(translateProperty(property, alias, subject.view));
                });
            }

            return ElementTriplesBlock;
        }

        function getProjectVars(withAggregates) {
            var pVars = new sparql.VarExprList();
            shownVariables.entries().forEach(function (pv) {
                if (!blockList.contains(pv.v)) {
                    pVars.add(pv.v, pv.expr);
                }
            });
            if (withAggregates) {
                aggregates.entries().forEach(function (pv) {
                    if (!blockList.contains(pv.v)) {
                        pVars.add(pv.v, pv.expr);
                    }
                });
            }
            return pVars;
        }

        /**
         * Function to start translation process, with call to changeURIs for the mockup data
         * and replaceAliasSpaces to replace spaces with underscores
         * @param json
         */
        function translateJSONToSPARQL(json) {
            aggregates = new sparql.VarExprList();
            shownVariables = new sparql.VarExprList();
            blockList = new sparql.VarExprList();
            var query = new sparql.Query(),
                ElementTriplesBlock = new sparql.ElementTriplesBlock();
            if (json.hasOwnProperty('SUBJECTS')) {
                json.SUBJECTS.forEach(function (subject) {
                    ElementTriplesBlock.addTriples(translateSubject(subject));
                });
            }
            query.setQueryPattern(ElementTriplesBlock);
            query.setProjectVars(getProjectVars(true));
            query.setDistinct(true);
            if (aggregates.entries().length > 0) {
                query.groupBy = getProjectVars().vars;
            }

            return query;
        }

        return {
            translateJSONToSPARQL: translateJSONToSPARQL,
            translateJSONToSponateMap: translateJSONToSponateMap
        };

        function translateJSONToSponateMap(json) {
            aggregates = new sparql.VarExprList();
            objects = new sparql.VarExprList();
            main = '';

            shownVariables = new sparql.VarExprList();
            blockList = new sparql.VarExprList();
            var ElementTriplesBlock = new sparql.ElementTriplesBlock(), r;
            if (json.hasOwnProperty('SUBJECTS')) {
                json.SUBJECTS.forEach(function (subject) {
                    ElementTriplesBlock.addTriples(translateSubject(subject));
                });
            }

//ElementTriplesBlock.addTriples(aggregates);

            r = {
                name: new Date().toISOString(),
                template: [{
                    id: main.toString(),
                    rows: [{
                        id: '?rowId'
                    }]
                }],
                from: ElementTriplesBlock.toString()
            };

            getProjectVars().getVars().forEach(function (Var) {
                var key = Var.toString().replace(/^\?/, '');
                if (objects.contains(Var)) {
                    key = '$' + key;
                }
                r.template[0].rows[0][key] = Var.toString();
            });

            return r;
        }

    }

})();