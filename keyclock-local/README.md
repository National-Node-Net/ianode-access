# KEYCLOAK
**Repository:** `ianode-access`  
**Description:** `This is a Keycloak setup file`
<!-- SPDX-License-Identifier: OGL-UK-3.0 -->

[IANode ACCESS](../README.md). 

## Prerequisites

## Using Keycloak

```
docker compose up
```

You can then configure users and groups in keycloak, by using the "configure-keycloak.sh"

```
sh configure-keycloak.sh
```

This will configure 4 users:

| user | password | ianode_read | ianode_admin | command to get token |
|-|-|-|-|-|
| test+admin@ndtp.co.uk | password | ❌ | ✅ | `curl --location 'http://localhost:9229/realms/ndtp-realm/protocol/openid-connect/token' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'grant_type=password' --data-urlencode 'client_id=ndtp-access' --data-urlencode 'username=test+admin@ndtp.co.uk' --data-urlencode 'password=password' --data-urlencode 'scope=openid'` |
| test+user@ndtp.co.uk | password | ✅ | ❌ | `curl --location 'http://localhost:9229/realms/ndtp-realm/protocol/openid-connect/token' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'grant_type=password' --data-urlencode 'client_id=ndtp-access' --data-urlencode 'username=test+user@ndtp.co.uk' --data-urlencode 'password=password' --data-urlencode 'scope=openid'` |
| test+user+admin@ndtp.co.uk | password | ✅ | ✅ | `curl --location 'http://localhost:9229/realms/ndtp-realm/protocol/openid-connect/token' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'grant_type=password' --data-urlencode 'client_id=ndtp-access' --data-urlencode 'username=test+user+admin@ndtp.co.uk' --data-urlencode 'password=password' --data-urlencode 'scope=openid'` |
| test@ndtp.co.uk | password | ❌ | ❌ | `curl --location 'http://localhost:9229/realms/ndtp-realm/protocol/openid-connect/token' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'grant_type=password' --data-urlencode 'client_id=ndtp-access' --data-urlencode 'username=test@ndtp.co.uk' --data-urlencode 'password=password' --data-urlencode 'scope=openid'` |

This command gets the token which can be used to log in; it will return an Access Token, Refresh Token and ID Token. 

Take the ID Token, and you can call the ACCESS API in the JWT header as a bearer token. By default the JWT header is "authorization".

© Crown Copyright 2026. This work has been developed by the National Digital Twin Programme and is legally attributed to the UK's Department for Business, Innovation, Science and Trade (BIST) as the
governing entity.  
Licensed under the Open Government Licence v3.0.
