Maven Repo Proxy
=============

A lambda function that translate GET and PUT requests to a Google Storage bucket to store artficats
compliant with the maven repository format. 

Background
----------

This will never replace an artifact repository like Nexus or Artifactory but I needed something simple for my own projects.
The advantage using the google functions is that you pay for
only for the time when you are using it (and for the storage for your artifacts, but artifacts will be small) and not paying for hours when the server is idle. This will be ideal
for sporadic use and then you want to avoid to store it locally.

How it works
------------
It will translate a HTTP request, GET or PUT, uses the relative path and access the specified Google Storage bucket. As security, it will use pre-defined username/password is configured to block unauthorized access

Configuration
------------

* SOURCE_PATH
* AUTH_USERNAME
* AUTH_PASSWORD
* GCP_BUCKET_PATH
* GCP_BUCKET_NAME

Building
------------
A make script provides the most important commands for the
life-cycle:

* Installing
* Testing
* Builidng (the zip file for deployment)
* Run server locally
* Versioning
* Info (about name and version)
* Help

Project requires ```yarn``` as package manager and ```m̀ake``` command.