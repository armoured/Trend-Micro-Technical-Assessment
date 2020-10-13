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

## Send Requests Through The Api Gateway

When you deployed the users service, serverless would have listed the api gateway endpoints
that were deployed.

They will look something like

`POST - https://pm7uuzazic.execute-api.ap-southeast-2.amazonaws.com/dev/users`

`GET - https://pm7uuzazic.execute-api.ap-southeast-2.amazonaws.com/dev/users`


Using a tool like postman https://www.postman.com/downloads/ feel free to send GET and POST requests to the endpoints you got. 

Here is some sample data you can use for the POST request. Make sure to include this in the body in JSON format.

```
{
    "firstname": "Mitchell",
    "lastname": "Shelton",
    "email": "mitchellshelton97@gmail.com",
    "username": "mitty",
    "credentials": "password"
}
```