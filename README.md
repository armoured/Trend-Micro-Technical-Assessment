# Trend-Micro-Technical-Assessment


# Deploy

SLS_DEBUG=1 AWS_SDK_LOAD_CONFIG=true sls deploy --aws-profile=default --region=ap-southeast-2

# Run Locally

node -e 'require("./users/handler").create_user({"body": {"firstname": "a", "lastname": "b", "email": "mitchellshelton97@gmail.com", "username": "d"}}, null, ()=>{})'

# Sample Input

{
    "firstname": "Mitchell",
    "lastname": "Shelton",
    "email": "mitchellshelton97@gmail.com",
    "username": "mitty"
}