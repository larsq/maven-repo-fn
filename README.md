User-database
=============

A simple user database exposed as a express database.
More specifically the database is intended to be used
as a Google Cloud Function but could also be run as a
stand-alone process.

Running
=======

```node startserver.js```

Configuration
=============

PORT            provides the port that the express server starts at. Default is 8000
EXPENSES_USERS  a gzipped json payloads set the users. See ```users.json```for a sample database
                if not provided or the content could not be parsed, all request will raise a 503 as respons

Endpoints
=========

```sh
$ curl -X POST -H 'Content-Type:application/json' -d '{"email":"user1@example.com", "password": "secret"}' http://localhost:8000
{"email":"user1@example.com","scopes":["scope1","scope2"]}
```

