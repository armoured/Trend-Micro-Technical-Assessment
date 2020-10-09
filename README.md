# Trend-Micro-Technical-Assessment


# Deploy

SLS_DEBUG=1 AWS_SDK_LOAD_CONFIG=true sls deploy --aws-profile=default --region=ap-southeast-2

# Run Locally

node -e 'require("./handler").create_user(null, null, ()=>{})'