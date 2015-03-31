-- Empty Graph
DELETE FROM DB.DBA.RDF_QUAD ;

-- Load test ontology
sparql create silent graph <http://vsb.leipert.io/ns/> ;
DB.DBA.TTLP_MT (file_to_string_output('./virtuoso/var/lib/virtuoso/db/ttl/vsb.ttl'),'http://vsb.leipert.io/ns/');
