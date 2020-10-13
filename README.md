# Trend-Micro-Technical-Assessment


# Deploy

SLS_DEBUG=1 AWS_SDK_LOAD_CONFIG=true sls deploy --aws-profile=default --region=ap-southeast-2

# Test

npm run test

# coverage report

npm run coverage

# Run Locally

node -e 'require("./users/handler").handle_http({"body": {"firstname": "a", "lastname": "b", "email": "mitchellshelton97@gmail.com", "username": "d", "credentials": "password"}, "path": "/user", "httpMethod": "POST"}, null, (a, b)=>{console.log(b)})'

node -e 'require("./users/handler").handle_http({"path": "/users", "httpMethod": "GET"}, null, ()=>{})'

# Sample Input

{
    "firstname": "Mitchell",
    "lastname": "Shelton",
    "email": "mitchellshelton97@gmail.com",
    "username": "mitty",
    "credentials": "password"
}