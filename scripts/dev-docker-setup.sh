#!/usr/bin/env sh
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

set -e

# File paths
API_SBOM_FILE="./access.sbom.json"

# Check if API_SBOM file exists
if [ -e "$API_SBOM_FILE" ]; then
	echo "File $API_SBOM_FILE already exists. Skipping creation."
else
	# Create the file
	echo "File $API_SBOM_FILE does not exist. Creating file."
	touch "$API_SBOM_FILE"

	# Add content to file
	echo "echo '{}' > $API_SBOM_FILE"
	echo "File $API_SBOM_FILE created."
fi

# Build the Docker image using Docker Compose
docker compose build

# Run the Docker Compose services
docker compose -p ianode-access up -d
