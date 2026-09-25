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

const {
  Types: { ObjectId },
} = Schema;
const InstantiatedLabels = {
  name: String,
  value: String,
  toString: String,
  toDataLabelString: String,
};

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       allOf:
 *         - $ref: '#/components/schemas/SCIMUser'
 *         - type: object
 *           properties:
 *             id:
 *               description: Identifier for the user in IANode ACCESS
 *               type: string
 *               example: 507f1f77bcf86cd799439011
 *             externalId:
 *               description: Auth identifier for the user in IANode ACCESS
 *               type: string
 *               example: 31127653-a234-48bc-b940-34c866bfe837
 *             name:
 *               type: string
 *               example: User
 *             userName:
 *               type: string
 *               example: User
 *             email:
 *               type: string
 *               example: newuser@ndtp.co.uk
 *             labels:
 *               type: array
 *               example: [
 *                 {
 *                   "name": "nationality",
 *                   "value": "GBR",
 *                   "toString": "nationality=\"GBR\"",
 *                   "toDataLabelString": "permitted_nationalities='GBR'",
 *                   "_id": "6540c57326bc7a0bd6658494"
 *                 },
 *                 {
 *                   "name": "clearance",
 *                   "value": "S",
 *                   "toString": "clearance=\"S\"",
 *                   "toDataLabelString": "classification='S'",
 *                   "_id": "6540c57326bc7a0bd6658495"
 *                 },
 *                 {
 *                   "name": "personnel_type",
 *                   "value": "GOV",
 *                   "toString": "personnel_type=\"GOV\"",
 *                   "toDataLabelString": null,
 *                   "_id": "6540c57326bc7a0bd6658496"
 *                 },
 *                 {
 *                   "name": "deployed_organisation",
 *                   "value": "Org1",
 *                   "toString": "deployed_organisation=\"Org1\"",
 *                   "toDataLabelString": "permitted_organisations='Org1'",
 *                   "_id": "6540c57326bc7a0bd6658497"
 *                 }
 *               ]
 *             active:
 *               type: boolean
 *               example: false
 *             userGroups:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["urn:ndtp:groups:developers", "urn:ndtp:groups:group2"]
 *             schemas:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["urn:ietf:params:scim:schemas:core:2.0:User"]
 *     CreateUserInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: User
 *         email:
 *           type: string
 *           example: newuser@ndtp.co.uk
 *         clearance:
 *           type: string
 *           enum: ["O", "OS", "S", "TS"]
 *         deployed_organisation:
 *           type: string
 *           example: Organisation name
 *         nationality:
 *           type: string
 *           example: GBR
 *         personnel_type:
 *           type: string
 *           enum: ["GOV", "NON-GOV"]
 *         active:
 *           type: boolean
 *           example: false
 *         userGroups:
 *           type: array
 *           items:
 *             type: string
 *           example: ["urn:ndtp:groups:developers", "urn:ndtp:groups:group2"]
 *     CreateUserSuccess:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *     UpdateUserSuccess:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         updated:
 *           type: boolean
 *           example: true
 *     DeleteUserSuccess:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *     UserInvalidRequest:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 400
 *         message:
 *           type: string
 *           example: Invalid request
 *     UserNotFound:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 404
 *         message:
 *           type: string
 *           example: User not found
 *     UnableToCreateUser:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 405
 *         message:
 *           type: string
 *           example: When SCIM is enabled, users cannot be created through ACCESS
 *     UserExists:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 409
 *         message:
 *           type: string
 *           example: User already exists in IdP
 *     UserInvalid:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 422
 *         message:
 *           type: string
 *           example: Operation failed / User object invalid / Operator not supported
 */
const userSchema = new Schema({
  _id: ObjectId,
  id: { type: String, required: true, unique: true },
  externalId: { type: String, unique: true },
  name: { type: String, required: true },
  userName: { type: String },
  email: { type: String, required: true, index: true },
  labels: { type: [InstantiatedLabels] },
  active: { type: Boolean, required: true, default: false },
  groups: { type: [String] },
  userGroups: { type: [String] },
  schemas: { type: [String] },
});

export default model("Users", userSchema);
