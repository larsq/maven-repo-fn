SHELL := /bin/bash

APPLICATION_NAME=$$(npm ls --json --depth 0 | jq '.name' | tr -d '"')
APPLICATION_VERSION=$$(npm ls --json --depth 0 | jq '.version' | tr -d '"')
GIT_HASH=$$(bin/githash)
LOCAL_USER=$$(echo "$$(id -u):$$(id -g)")
DOCKER_CMD=docker run -u "${LOCAL_USER}" --rm -v "$(CURDIR):/project"

.PHONY: clean test

help:					## Show this help.
	@sed -ne '/@sed/!s/##//p' $(MAKEFILE_LIST)

install-no-dev:	clean	## Install package (production files only)
	yarn install --production

install: clean  		## Install package
	yarn install

clean:	## Clean project
	rm -rf build

build: clean	 ## Pack function into zip file
	mkdir -p build
	npx npm-pack-zip --dst build
	mv build/${APPLICATION_NAME}.zip "build/${APPLICATION_NAME}-${APPLICATION_VERSION}+${GIT_HASH}.zip"

publish:
	;

test:	## Run tests
	npm test

local_run:  ## Run locally
	FSDRIVER_PATH=/tmp/repo BUNYAN_LOG_LEVEL=debug AUTH_USERNAME=user AUTH_PASSWORD=secret \
	node startserver.js

info:
	@echo "${APPLICATION_NAME}-${APPLICATION_VERSION}+${GIT_HASH}"

version-%:	## Set version
	npm version "$*"
