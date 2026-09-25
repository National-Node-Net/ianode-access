# SPDX-License-Identifier: Apache-2.0
# Originally developed by Telicent Ltd.; subsequently adapted, enhanced, and maintained by the National Digital Twin Programme.
  #
  #  Copyright (c) Telicent Ltd.
  #
  #  Licensed under the Apache License, Version 2.0 (the "License");
  #  you may not use this file except in compliance with the License.
  #  You may obtain a copy of the License at
  #
  #      http://www.apache.org/licenses/LICENSE-2.0
  #
  #  Unless required by applicable law or agreed to in writing, software
  #  distributed under the License is distributed on an "AS IS" BASIS,
  #  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  #  See the License for the specific language governing permissions and
  #  limitations under the License.
  #
  #
  #  Modifications made by the National Digital Twin Programme (NDTP)
  #  © Crown Copyright 2026. This work has been developed by the National Digital Twin Programme
  #  and is legally attributed to the UK's Department for Business, Innovation, Science and Trade (BIST) as the governing entity.
#!/bin/bash

# SPDX-License-Identifier: Apache-2.0
# Dynamic Cognito setup script that works across different machines

ENDPOINT="http://0.0.0.0:9229"

echo " Setting up Cognito local..."
echo " set COGNITO_ADMIN_PASSWORD before use!"
PASSWORD=${COGNITO_ADMIN_PASSWORD:-admin} 


# Create a new user pool
echo "Creating user pool..."
USER_POOL_RESPONSE=$(aws --endpoint $ENDPOINT cognito-idp create-user-pool --pool-name "NDTPPool" --cli-read-timeout 0)
USER_POOL_ID=$(echo $USER_POOL_RESPONSE | grep -o '"Id": "[^"]*"' | sed 's/"Id": "//;s/"//')

echo "Created user pool with ID: $USER_POOL_ID"

# Create user pool client (app client)
echo "Creating user pool client..."
CLIENT_RESPONSE=$(aws --endpoint-url $ENDPOINT cognito-idp create-user-pool-client --user-pool-id $USER_POOL_ID --client-name "ianode-access-client" --explicit-auth-flows USER_PASSWORD_AUTH --cli-read-timeout 0)
CLIENT_ID=$(echo $CLIENT_RESPONSE | grep -o '"ClientId": "[^"]*"' | sed 's/"ClientId": "//;s/"//')
echo "Created user pool client with ID: $CLIENT_ID"

# Create users
echo "Creating users..."
aws --endpoint $ENDPOINT cognito-idp admin-create-user --user-pool-id $USER_POOL_ID --username test+admin@ndtp.co.uk --cli-read-timeout 0 --message-action SUPPRESS --user-attributes Name=email,Value=test+admin@ndtp.co.uk 1> /dev/null
aws --endpoint $ENDPOINT cognito-idp admin-create-user --user-pool-id $USER_POOL_ID --username test+user@ndtp.co.uk --cli-read-timeout 0 --message-action SUPPRESS --user-attributes Name=email,Value=test+user@ndtp.co.uk 1> /dev/null
aws --endpoint $ENDPOINT cognito-idp admin-create-user --user-pool-id $USER_POOL_ID --username test+user+admin@ndtp.co.uk --cli-read-timeout 0 --message-action SUPPRESS --user-attributes Name=email,Value=test+user+admin@ndtp.co.uk 1> /dev/null
aws --endpoint $ENDPOINT cognito-idp admin-create-user --user-pool-id $USER_POOL_ID --username test@ndtp.co.uk --cli-read-timeout 0 --message-action SUPPRESS --user-attributes Name=email,Value=test@ndtp.co.uk 1> /dev/null

echo "4 users created"

# Set passwords
echo "Setting user passwords..."
aws --endpoint $ENDPOINT cognito-idp admin-set-user-password --user-pool-id $USER_POOL_ID --username test+admin@ndtp.co.uk --password $PASSWORD --permanent 1> /dev/null
aws --endpoint $ENDPOINT cognito-idp admin-set-user-password --user-pool-id $USER_POOL_ID --username test+user+admin@ndtp.co.uk --password $PASSWORD --permanent  1> /dev/null
aws --endpoint $ENDPOINT cognito-idp admin-set-user-password --user-pool-id $USER_POOL_ID --username test+user@ndtp.co.uk --password $PASSWORD --permanent 1> /dev/null
aws --endpoint $ENDPOINT cognito-idp admin-set-user-password --user-pool-id $USER_POOL_ID --username test@ndtp.co.uk --password $PASSWORD --permanent 1> /dev/null

echo "All users passwords set to '$PASSWORD'"

# Create groups
echo "Creating groups..."
aws --endpoint $ENDPOINT cognito-idp create-group --user-pool-id $USER_POOL_ID  --group-name ianode_admin 1> /dev/null
aws --endpoint $ENDPOINT cognito-idp create-group --user-pool-id $USER_POOL_ID  --group-name ianode_read 1> /dev/null

echo "IANode_admin and IANode_read groups created"

# Add users to groups
echo "Adding users to groups..."
aws --endpoint $ENDPOINT cognito-idp admin-add-user-to-group --user-pool-id $USER_POOL_ID --username test+admin@ndtp.co.uk --group-name ianode_admin 1> /dev/null
aws --endpoint $ENDPOINT cognito-idp admin-add-user-to-group --user-pool-id $USER_POOL_ID --username test+user@ndtp.co.uk --group-name ianode_read 1> /dev/null
aws --endpoint $ENDPOINT cognito-idp admin-add-user-to-group --user-pool-id $USER_POOL_ID --username test+user+admin@ndtp.co.uk --group-name ianode_admin 1> /dev/null
aws --endpoint $ENDPOINT cognito-idp admin-add-user-to-group --user-pool-id $USER_POOL_ID --username test+user+admin@ndtp.co.uk --group-name ianode_read 1> /dev/null

echo "Added users to groups"

# Save the user pool ID and client ID for reference
echo $USER_POOL_ID > .user_pool_id
echo $CLIENT_ID > .client_id

# Export for use in subsequent commands
export USER_POOL_ID
export CLIENT_ID

echo "✅ Setup complete!"
echo "   User Pool ID: $USER_POOL_ID (saved to .user_pool_id)"
echo "   Client ID: $CLIENT_ID (saved to .client_id)"
echo ""
echo "You can now authenticate using:"
echo "aws --endpoint-url $ENDPOINT cognito-idp initiate-auth --client-id $CLIENT_ID --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=test+admin@ndtp.co.uk,PASSWORD=$PASSWORD"

