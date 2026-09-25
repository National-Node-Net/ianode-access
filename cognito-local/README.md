# Local AWS Cognito Emulator
**Repository:** `ianode-access`  
**Description:** `Provides guidance on using Cognito with IA Node Access application`
<!-- SPDX-License-Identifier: OGL-UK-3.0 -->

This is a local AWS Cognito emulator to be used in conjunction with
[IA Node Access](../README.md). 

## Prerequisites

- AWS CLI 

## Setup Instructions

### First Time Setup (or after reset)

1. **Start the local Cognito instance:**
   ```bash
   docker compose up -d
   ```

2. **Run the dynamic setup script:**
   ```bash
   ./config_cognito.sh
   ```
   
   This script will:
   - Create a new user pool with a random ID (works on any machine)
   - Create all required users and groups
   - Save the user pool ID to `.user_pool_id` file

### Reset Cognito (Clean State)

To reset Cognito to a clean state:

```bash
sudo ./reset_cognito.sh
```

Then run the setup script again:

```bash
./config_cognito.sh
```

### Legacy Script (Machine-Specific)


This will configure 4 users:

| user | password | ianode_read | ianode_admin | command to get token |
|-|-|-|-|-|
| test+admin@ndtp.co.uk | password | ❌ | ✅ | `aws --endpoint http://0.0.0.0:9229 cognito-idp initiate-auth --client-id 6967e8jkb0oqcm9brjkrbcrhj --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=test+admin@ndtp.co.uk,PASSWORD=password` |
| test+user@ndtp.co.uk | password | ✅ | ❌ | `aws --endpoint http://0.0.0.0:9229 cognito-idp initiate-auth --client-id 6967e8jkb0oqcm9brjkrbcrhj --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=test+user@ndtp.co.uk,PASSWORD=password` |
| test+user+admin@ndtp.co.uk | password | ✅ | ✅ | `aws --endpoint http://0.0.0.0:9229 cognito-idp initiate-auth --client-id 6967e8jkb0oqcm9brjkrbcrhj --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=test+user+admin@ndtp.co.uk,PASSWORD=password` |
| test@ndtp.co.uk | password | ❌ | ❌ | `aws --endpoint http://0.0.0.0:9229 cognito-idp initiate-auth --client-id 6967e8jkb0oqcm9brjkrbcrhj --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=test@ndtp.co.uk,PASSWORD=password` |

This command gets the token which can be used to log in; it will return an Access Token, Refresh Token and ID Token. 

Take the ID Token, and you can call the Access API in the JWT header as a bearer token. By default the JWT header is "authorization".

© Crown Copyright 2026. This work has been developed by the National Digital Twin Programme and is legally attributed to the UK's Department for Business, Innovation, Science and Trade (BIST) as the
governing entity.  
Licensed under the Open Government Licence v3.0.
