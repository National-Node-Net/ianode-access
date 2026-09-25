// SPDX-License-Identifier: Apache-2.0
// Originally developed by Telicent Ltd.; subsequently adapted, enhanced, and maintained by the National Digital Twin Programme.
/*
 *  Copyright (c) Telicent Ltd.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/*
 *  Modifications made by the National Digital Twin Programme (NDTP)
 *  © Crown Copyright 2026. This work has been developed by the National Digital Twin Programme
 *  and is legally attributed to the UK's Department for Business, Innovation, Science and Trade (BIST) as the governing entity.
 */

import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import config from "../config";
import log from "../lib/logger";
import { version } from "../../package.json";

const router = express.Router();
const { accessUrl, port } = config;

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "IANode ACCESS API",
      version,
      description: "Integration Architecture Node ACCESS",
      contact: {
        name: "ianode",
        url: "https://ndtp.co.uk/",
        email: "NDTP@businessandtrade.gov.uk",
      },
    },
    servers: [{ url: accessUrl }],
  },
  apis: [
    "./src/database/models/*.js",
    "./src/router/*/*.js",
  ],
};

const specs = swaggerJsdoc(options);

router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(specs, { explorer: true }));

router.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});

log.info(`Docs available at http://localhost:${port}/api-docs`);
log.info(
  `Swagger config available at http://localhost:${port}/api-docs/swagger.json`
);

module.exports = router;
