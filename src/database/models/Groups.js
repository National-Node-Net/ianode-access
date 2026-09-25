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
 *     Group:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6540c84426bc7a0bd66584aa
 *         group_id:
 *           type: string
 *           example: urn:ndtp:groups:example
 *         label:
 *           type: string
 *           example: Example group name
 *         description:
 *           type: string
 *           example: A group defined as an example
 *         active:
 *           type: boolean
 *           default: false
 *         userCount:
 *           type: number
 *           required: false
 *           example: 1
 *     CreateGroup:
 *       type: object
 *       required:
 *         - label
 *         - description
 *         - active
 *       properties:
 *         label:
 *           type: string
 *           example: example
 *         description:
 *           type: string
 *           example: A group defined as an example
 *         active:
 *           type: boolean
 *           example: false
 *     CreateGroupSuccess:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             created:
 *               type: boolean
 *               example: true
 *             uuid:
 *               type: string
 *               example: urn:ndtp:groups:example
 *     DeleteGroupSuccess:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             deleted:
 *               type: boolean
 *               example: true
 *     ToggleActiveGroup:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             active:
 *               type: boolean
 *               example: true
 *     GroupBadRequest:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 400
 *         message:
 *           type: string
 *           example: Invalid request / Fields missing
 *     GroupsNotFound:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 404
 *         message:
 *           type: string
 *           example: Group(s) not found
 *     GroupAlreadyExists:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 409
 *         message:
 *           type: string
 *           example: Group already exists
 */
const groupSchema = new Schema({
  group_id: {
    type: String,
    required: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default model("Groups", groupSchema);
