#!/bin/bash
# SPDX-License-Identifier: Apache-2.0
# © Crown Copyright 2026. This work has been developed by the National Digital Twin Programme
# and is legally attributed to the UK's Department for Business, Innovation, Science and Trade (BIST) as the governing entity.
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

export KEYCLOAK_ADMIN=admin
export KEYCLOAK_ADMIN_PASSWORD=admin
export KEYCLOAK_PORT="9229:9229"
export KEYCLOAK_IMAGE="quay.io/keycloak/keycloak:latest"
export KEYCLOAK_MODE="start-dev"
export SOURCE_VOLUME=/opt/keycloak/data/import
export DESTINATION_VOLUME=tmp
export KEYCLOAK_URL=http://localhost:9229

# **************** Global variables

# **********************************************************************************
# Functions definition
# **********************************************************************************

function configureKeycloak() {
    echo "************************************"
    echo " Configure Keycloak realm"
    echo " set KEYCLOAK_ADMIN_PASSWORD before use!"
    echo "************************************"

    # Set the needed parameter
    USER=admin
    PASSWORD=${KEYCLOAK_ADMIN_PASSWORD:-admin} 
    GRANT_TYPE=password
    CLIENT_ID=admin-cli
    EXAMPLE_REALM=keycloak/config.json

    access_token=$( curl -d "client_id=$CLIENT_ID" -d "username=$USER" -d "password=$PASSWORD" -d "grant_type=$GRANT_TYPE" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" | sed -n 's|.*"access_token":"\([^"]*\)".*|\1|p')

    echo "Access token : $access_token"

    if [ "$access_token" = "" ]; then
        echo "------------------------------------------------------------------------"
        echo "Error:"
        echo "======"
        echo ""
        echo "It seems there is a problem to get the Keycloak access token: ($access_token)"
        echo "The script exits here!"
        echo ""
        echo "------------------------------------------------------------------------"
        exit 1
    fi

    # Create the realm in Keycloak
    echo "------------------------------------------------------------------------"
    echo "Create the realm in Keycloak"
    echo "------------------------------------------------------------------------"
    echo ""

    result=$(curl -d @"$EXAMPLE_REALM" -H "Content-Type: application/json" -H "Authorization: bearer $access_token" "$KEYCLOAK_URL/admin/realms")

    if [ "$result" = "" ]; then
        echo "------------------------------------------------------------------------"
        echo "The realm is created. "
        echo "Open following link in your browser:"
        echo "$KEYCLOAK_URL/admin/master/console/#/example-realm"
        echo "------------------------------------------------------------------------"
    else
        echo "------------------------------------------------------------------------"
        echo "Error:"
        echo "======"
        echo "It seems there is a problem with the realm creation: $result"
        echo "The script exits here!"
        echo ""
        exit 1
    fi
}

#**********************************************************************************
# Execution
# **********************************************************************************

configureKeycloak
