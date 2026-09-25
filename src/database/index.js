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

import { connect, connection } from "mongoose";

import { createDefaultAttributes } from "./defaults";
import models from "./models";
import config from "../config";
import { getAllAttributes } from "../controllers/attributes/read";
import logger from "../lib/logger";

export const init = async () => {
  let health = { ok: true, message: "starting up" };

  const connectDb = async () => {
    try {
      const {
        mongoCollection,
        mongoPwd,
        mongoRetryRewrites,
        mongoUrl,
        mongoUser,
        MONGO_PROTOCOL,
        MONGO_CONNECTION_STRING_OPTIONS,
        MONGO_SSL_CERT
      } = config;

      if (health.message !== "connection") {
        health = { ...health, message: "reconnecting" };
      }
      logger.info("Connecting to database...");
      logger.info(`Protocol: ${MONGO_PROTOCOL}`);
      logger.info(`Mongo: ${mongoUrl}`);
      logger.info(`Mongo connection string options: ${MONGO_CONNECTION_STRING_OPTIONS}`);
      if(MONGO_SSL_CERT){
        logger.info(`Mongo SSL cert location: ${MONGO_SSL_CERT}`);
      }
      logger.info(`Database: ${mongoCollection}`);
      logger.info(`User: ${mongoUser}`);

      const encodedPwd = encodeURIComponent(mongoPwd);
      const maybeConnectionStringOptions = MONGO_CONNECTION_STRING_OPTIONS ? `?${MONGO_CONNECTION_STRING_OPTIONS}` : '';

      const mongoOptions = MONGO_SSL_CERT ? { 
        authSource: 'admin',
        authMechanism: 'SCRAM-SHA-1',
        tls: true,
        retryWrites: mongoRetryRewrites,
        tlsCAFile: MONGO_SSL_CERT
      } : { retryWrites: mongoRetryRewrites }; 

      await connect(
        `${MONGO_PROTOCOL}://${mongoUser}:${encodedPwd}@${mongoUrl}/${mongoCollection}${maybeConnectionStringOptions}`, mongoOptions );
    } catch (err) {
      health = { ok: false, message: "errored" };
      logger.error(`Failed to connect to Mongo: ${err.message}`);
      return;
    }

    logger.info("*** DB connected successfully ***\n");
    logger.info("Loading models...");
    loadModels();
    logger.info("Models loaded");

    // Check to make sure a default hierarchy exists.
    logger.info("Checking attributes collection");
    const { data, error } = await getAllAttributes();
    if (error) {
      logger.error(error);
      health = {
        ok: false,
        message: "error thrown trying to access attributes",
      };
    }
    // If attributes collection is empty, add default hierarchy.
    if (data.length === 0) {
      logger.info("Labels status: FAILED");
      const { error: err } = await createDefaultAttributes();

      if (err) {
        health = { ok: false, message: "failed to create default attributes" };
        return;
      }
    }
    logger.info("Labels status: PASSED");
    health = { ok: true, message: "connected" };
  };

  connection.on("error", async () => {
    health = { ok: false, message: "errored" };
    logger.error("Failed to connect to database");
    await sleep(2500);
    await connectDb();
  });

  connection.on("disconnect", async () => {
    health = { ok: false, message: "disconnected" };
    logger.info("disconnected");
    await sleep(2500);
    await connectDb();
  });

  health = { ok: true, message: "connecting" };
  await connectDb();
  return { health };
};

const loadModels = () => {
  models();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
