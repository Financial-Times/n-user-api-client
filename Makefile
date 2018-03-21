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
	mocha "test/**/*.spec.ts" -r ts-node/register --require ./test/setup.ts --exit

tslint:
	npx tslint -c tslint.json "src/**/*.ts" "test/**/*.ts"

verif%: verify tslint
