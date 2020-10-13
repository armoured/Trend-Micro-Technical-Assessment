# Users Service

## Setup

Install packages

`npm install`

## Deployment

To deploy the Users service run:

`SLS_DEBUG=1 AWS_SDK_LOAD_CONFIG=true sls deploy --aws-profile=default --region=ap-southeast-2`

Note: make sure the dynamodb service is already deployed.

## Undeployment

To remove the Users service run:

`SLS_DEBUG=1 AWS_SDK_LOAD_CONFIG=true sls remove --aws-profile=default --region=ap-southeast-2`

## Test

To run the unit tests run

`npm run test`

## Test Coverage

To generate a test coverage report run

`npm run coverage`

Code coverage for the lambda functions is currently 100.