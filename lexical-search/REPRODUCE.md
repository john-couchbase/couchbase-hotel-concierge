# Reproduce in an isolated environment

Create bucket vector-learning, scope lexical_lab_20261103, collections texts and synonyms. Load documents.json into texts using its object keys as document IDs. Load {"synonyms":["car","automobile"]} as ID vehicles in synonyms. Import the two *-definition.json files with a Search-index-management credential. Do not change an existing shared index.

Install Python and dependencies as needed; the HTTP runner uses curl. Set YOUR_SEARCH_NODE in lexical_http.py to your Search node. Save the public cluster CA at work/cluster-ca.pem and a private {"username":"...","password":"...","scope":"lexical_lab_20261103"} credential in work/lexical-credential.json. Do not commit it. The baseline portion additionally expects the original hotel collection, index, and private hotel reader credential; omit that block if reproducing only the controlled corpus.

Place evidence data in outputs/lexical and scripts under work, run run_lexical.py, lexical_followup.py, and lexical_extras.py. followup.json retains both the initial incorrect _type request and the later corrected type request. The distributed runner uses the corrected type field directly. The saved query vector and document embeddings avoid model-service calls. Each index should return 17 documents when match-all is restricted to collections:["texts"].

The tests are exploratory and assume this isolated dataset. Native index creation requires more access than a data reader/writer. Keep query credentials scoped, remove temporary index-management access after setup, and pause test compute when done. Storage continues to incur charges.
