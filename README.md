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

* BUNYAN_LOG  log level for application, info if environment variable is missing
* SOURCE_PATH the expected source path that should be omitted, use '/' for no path
* TARGET_PATH the target source path that should the root path
* AUTH_USERNAME the username that should be used in the basic authorization for the proxy
* AUTH_PASSWORD the password that should be used in conjunction with the username as authorization
* RUN_MODE could be ```local``` or ```cloud```. Local will upload/download files from file system and cloud will use a GCP Storage Bucket
* FSDRIVER_PATH points to the local root that will be used for local run
* GCP_BUCKET refers to the bucket that is used by the cloud run

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

Installation
------------
The zip file that is created by ```m̀ake build``` should be uploaded to GCP and deployed as a google function. The function should be reached without authentication and will be kept secured given the defined username and password. The service account that is associated with the function should have
read and write privileges for the specified bucket.
