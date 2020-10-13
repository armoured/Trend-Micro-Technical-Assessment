# DynamoDB Service

## Deployment

To deploy the DynamoDB service run:

`SLS_DEBUG=1 AWS_SDK_LOAD_CONFIG=true sls deploy --aws-profile=default --region=ap-southeast-2`

## Undeployment

To remove the DynamoDB service run:

`SLS_DEBUG=1 AWS_SDK_LOAD_CONFIG=true sls remove --aws-profile=default --region=ap-southeast-2`

Note the users table will still exist due to the retain configuration. If you want to delete this
you must manually do it in the console.
