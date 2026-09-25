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

import { model, Schema } from "mongoose";

/**
 * @openapi
 * components:
 *   schemas:
 *     Attributes:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 653f71ef35fe27f9f7ff1627
 *         user_attribute_name:
 *           type: string
 *           example: personnel_type
 *         data_attribute_name:
 *           type: string
 *           example: personnel_type
 *         value:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               example: enum
 *             values:
 *               type: array
 *               example: ["GOV", "NON-GOV"]
 *         ihm:
 *           type: boolean
 *           example: false
 *         readonly:
 *           type: boolean
 *           example: false
 *     AttributesToStrings:
 *       type: array
 *       example: [
 *         "permitted_nationalities='GBR'",
 *         "classification='OS'",
 *         "permitted_organisations='Org1'",
 *         "urn:ndtp:groups:G1:and",
 *         "urn:ndtp:groups:G2:and",
 *         "urn:ndtp:groups:G3:or",
 *         "urn:ndtp:groups:G4:or"
 *       ]
 *     AttributesNotFound:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 404
 *         message:
 *           type: string
 *           example: Attribute(s) not found
 *     Hierarchy:
 *       type: object
 *       properties:
 *         uuid:
 *           type: string
 *           example: 64d25a470a97a540165757da
 *         name:
 *           type: string
 *           example: classification
 *         tiers:
 *           type: array
 *           example: [O, OS, S, TS]
 *         readonly:
 *           type: boolean
 *     HierarchyNotFound:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 404
 *         message:
 *           type: string
 *           example: Hierarchy/ies not found
 */
const attributeSchema = new Schema({
  user_attribute_name: { type: String, required: true, unique: true },
  data_attribute_name: { type: String, unique: true },
  value: {
    type: {
      type: String,
      enum: ["enum", "hierarchy", "string", "numeric"],
      index: true,
    },
    values: { type: [String], default: null },
  },
  ihm: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
});

export default model("Attributes", attributeSchema);
