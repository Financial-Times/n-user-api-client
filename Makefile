node_modules/@financial-times/n-gage/index.mk:
	npm install --no-save --no-package-lock @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

build:
	tsc

watch:
	tsc -w

build-production: build

test:
	mocha -r ts-node/register --require ./test/setup.ts --recursive **/*.spec.ts **/**/*.spec.ts --exit
