# Trend-Micro-Technical-Assessment

Hi, this is my submission for the Trend Micro Technical Assessment.

I have chosen to do assessment C which is DynamoDB + Lambda. Please see 'Technical Explanation' Below which will explain how I have completed each step of the assessment.

## Installation

First clone the repository.

Then install NodeJS 12.x along with npm (Node Package Manager). https://nodejs.org/en/download/

Next make sure to setup an AWS Account and configure your `~/.aws/credentials` and `~/.aws/config` files correctly. https://docs.aws.amazon.com/sdk-for-php/v3/developer-guide/guide_credentials_profiles.html

Next install serverless on your machine globally. 

`npm install -g serverless`

Now follow the instructions in `services/dynamodb/README.md` to setup the dynamodb service.
Once completed, follow the instructions in `services/users/README.md` to setup the users service.

You must follow this order as deploying the users service depends on the dynamodb service being already deployed.

## Technical Explanation

1. **Create a Serverless application.**

This was completed by following the documentation for serverless. https://www.serverless.com/framework/docs/

For scalability purposes, I have suffixed resources with the stage name which will allow us to deploy this code for other environments.

2. **Create a DynamoDB table in your AWS account to house "User" data.**

I utilise the serverless framework to create infrastructure as code. I can easily
specify all the config needed to automatically deploy the users table. I have selected
the id of the user to be the partition key, which will have the value of a uuid. This takes
advantage of DynamoDB partitions, ensuring that keys are spread out over partitions so that we don't end up with hotspots when querying the users table. A hotspot occurs when many requests go to a single partition, leaving the other partitions under-utilised which is inefficient.

Another design implementation I chose was to utilise a Global Secondary Index where the
users email is the partition key. This allows me to easily check if a user already exists
during creation because I can query that email against existing emails.

For security, if the cloudformation stack that deploys the table is deleted I have specified to retain the table to save the data.

3. **Create Lambdas to create and list items from this DynamoDB table.**

I also use serverless here to write infrastructure as code to automatically deploy
lambda functions. For security, I utilise various IAM policies that is attached to
the execution environment of the lambda to limit permissions that can be run. This is
important for security in the event an attacker gains access to the lambda, they are limited to the damage they can cause.

I also attached these lambda functions to an api gateway endpoint through serverless.
This is often useful for sending requests from outside of aws through the endpoint and also
gives us the ability to later use a custom domain name.

For the application code, I implemented the object oriented dispatcher pattern. This allowed me to cleanly separate business logic from the lambda handler code. Based on the
http method for the route, I can 'dispatch' the lambda event object to the relevant function whether it be create_user or get_users.

There is a substatial performance increase that can be done on the get_users lambda function. When scanning for all users in the database, it would be slow if there are millions of entries as it scans from the first partition to the last partition with one thread. To speed this up we can create multiple threads and specify a partition starting point for each thread to scan from. Once done the results can be easily merged together. This would save a huge amount of time.

Unfortunately, my code has lots of try/catch statements when calling AWS services. This is due to my limited experience with using the NodeJS async/await promise features as I come from a Python background. However, I have learnt rather quickly and show that I can transfer knowledge from one background to another easily. Given more time, I would be able to find a better way around this whether it be from reading up about best practices on the internet or learning from senior developers.

4. **Keep credentials attribute as a write-only attribute.**

This was achieved through IAM policies in serverless. I attach these policies on the Lambda execution environment. Following best practices, I took an allow-list approach where
I specify all the attributes I want to allow to be read. This path was chosen instead of denying read access to credentials explicity because users can determine the names of denied attributes through the principle of least privilege. https://en.wikipedia.org/wiki/Principle_of_least_privilege

5. **Upon save take the plain password and encrypt it using KMS with a user-defined CMK.**

In the lambda function for creating a user, I create a CMK and use it to encrypt the 
credentials attribute supplied by the user. For security purposes, each user gets their own
CMK rather than using a single CMK for all users.

6. **Make the Lambda function available via an AWS API Gateway endpoint.**

This was done in point 3

7. **Write unit tests for your code by mocking AWS EC2 API.**

I used Jest as the testing framework and mocked aws resources through the
aws-sdk-mock package. 

8. **Produce a code coverage report for your test suite.**

I used Jest to produce a code coverage report which currently has 100% code coverage.

9. **Make response JSON:API 1.0 (https://jsonapi.org/format/1.0/) compatible.**

I wrapped responses in a 'data' object. If they are errors then I wrap them in an 'errors' array.
