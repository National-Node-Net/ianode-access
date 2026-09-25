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

FROM node:20-alpine3.20 AS installation

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json yarn.lock ./
RUN LOCAL_MACHINE=false yarn install --frozen-lockfile && yarn cache clean

FROM installation AS build
COPY src src
COPY .babelrc .babelrc

RUN LOCAL_MACHINE=false yarn build

FROM node:20-alpine3.20
# Install curl
RUN apk --no-cache add curl
WORKDIR /app
RUN mkdir dist node_modules
COPY ./access.sbom.json /opt/ianode/sbom/sbom.json
COPY package.json yarn.lock wait-for.sh ./
RUN LOCAL_MACHINE=false yarn install --frozen-lockfile && yarn cache clean
COPY --from=build /app/dist ./dist
RUN chown -R 1000:1000 /app
USER 1000
ENV PORT ${PORT}
EXPOSE ${PORT}
CMD [ "node", "dist/index.js"]
