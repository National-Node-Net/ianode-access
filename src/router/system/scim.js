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

import config from "../../config";
import { createUser } from "../../controllers/scim/create";
import { deactivateUser, patchUser } from "../../controllers/scim/deactivate";
import { getAll, getUserAttributes } from "../../controllers/scim/read";
import { createListResponse } from "../../controllers/scim/utils";


const router = express.Router();
const { accessUrl, isScimEnabled } = config;

/**
 * @openapi
 * components:
 *   schemas:
 *     SCIMUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           example: 6540c57326bc7a0bd6658493
 *         externalId:
 *           description: Identifier for the User from the IdP
 *           type: string
 *           example: 31127653-a234-48bc-b940-34c866bfe837
 *         userName:
 *           type: string
 *           example: User
 *         schemas:
 *           type: array
 *           example: ["urn:ietf:params:scim:schemas:core:2.0:User"]
 *         groups:
 *           type: array
 *           example: ["urn:ndtp:groups:developers", "urn:ndtp:groups:group2"]
 *     StoredSCIMUser:
 *       allOf:
 *         - $ref: '#/components/schemas/SCIMUser'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Access identifier for user
 *               example: 64dd02xxxxxxxxxxxcecbe13c
 *     SCIMUsersListResponse:
 *       type: object
 *       properties:
 *         schemas:
 *           type: array
 *           items: string
 *           example: ["urn:ietf:params:scim:schemas:core:2.0:User"]
 *         totalResults:
 *           type: number
 *         startIndex:
 *           type: number
 *         itemsPerPage:
 *           type: number
 *         Resources:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StoredSCIMUser'
 *     CreateSCIMUser:
 *       type: object
 *       required:
 *         - externalId
 *       properties:
 *         externalId:
 *           type: string
 *           example: 31127653-a234-48bc-b940-34c866bfe837
 *         userName:
 *           type: string
 *           example: User
 *         emails:
 *           type: array
 *           example: [{ value: user@ndtp.co.uk }]
 *         schemas:
 *           type: array
 *           example: ["urn:ietf:params:scim:schemas:core:2.0:User"]
 *         groups:
 *           type: array
 *           example: ["urn:ndtp:groups:developers", "urn:ndtp:groups:group2"]
 *     DeleteSCIMUserSuccess:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             ok:
 *               type: boolean
 *               example: true
 *     SCIMUserNotFound:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 404
 *         message:
 *           type: string
 *           example: SCIM user not found
 *     SCIMNotEnabled:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 405
 *         message:
 *           type: string
 *           example: SCIM is not enabled on this server
 *     SCIMUserExists:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 409
 *         message:
 *           type: string
 *           example: SCIM user already exists
 *     SCIMInvalid:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 422
 *         message:
 *           type: string
 *           example: Operation failed / SCIM user object invalid / Operator not supported
 *     SCIMUnableToPatch:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           example: 501
 *         message:
 *           type: string
 *           example: Operation in patch not supported, only user deactivation is supported from the SCIM Service provider
 *     ResourceType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: User
 *         name:
 *           type: string
 *           example: User
 *         endpoint:
 *           type: string
 *           example: /Users
 *         schemas:
 *           type: array
 *           example: ["urn:ietf:params:scim:schemas:core:2.0:User"]
 *         schema:
 *           type: string
 *           example: "urn:ietf:params:scim:schemas:core:2.0:User"
 *         meta:
 *           type: object
 *           properties:
 *             location:
 *               type: string
 *               example: localhost:8091/scim/v2/ResourceTypes/User
 *             resourceType:
 *               type: string
 *               example: ResourceType
 *     ResourceTypes:
 *       type: object
 *       properties:
 *         totalResults:
 *           type: number
 *           example: 1
 *         itemsPerPage:
 *           type: number
 *           example: 10
 *         startIndex:
 *           type: number
 *           example: 1
 *         schemas:
 *           type: array
 *           example: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"]
 *         Resources:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ResourceType'
 *     SchemaAttributeProperties:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: userName
 *         type:
 *           type: string
 *           example: string
 *         multiValued:
 *           type: boolean
 *           example: false
 *         required:
 *           type: boolean
 *           example: true
 *         caseExact:
 *           type: boolean
 *           example: false
 *         mutability:
 *           type: string
 *           example: readWrite
 *         returned:
 *           type: string
 *           example: default
 *         uniqueness:
 *           type: string
 *           example: server
 *         description:
 *           type: string
 *           example: Unique identifier for the User, typically used by the user to directly authenticate to the service provider. Each User MUST include a non-empty userName value. This identifier MUST be unique across the service provider's entire set of Users.
 *     SchemaAttributes:
 *       allOf:
 *         - $ref: '#/components/schemas/SchemaAttributeProperties'
 *         - type: object
 *           properties:
 *             subAttributes:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SchemaAttributeProperties'
 *     Schema:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: urn:ietf:params:scim:schemas:core:2.0:User
 *         name:
 *           type: string
 *           example: User
 *         schemas:
 *           type: string
 *           example: [urn:ietf:params:scim:schemas:core:2.0:User]
 *         description:
 *           type: string
 *           example: User Schema
 *         attributes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SchemaAttributes'
 *         meta:
 *           type: object
 *           properties:
 *             resourceType:
 *               type: string
 *               example: Schema
 *             location:
 *               type: string
 *               example: localhost:8091/scim/v2/Schemas/urn:ietf:params:scim:schemas:core:2.0:User
 *     Schemas:
 *       type: object
 *       properties:
 *         totalResults:
 *           type: number
 *           example: 1
 *         itemsPerPage:
 *           type: number
 *           example: 10
 *         startIndex:
 *           type: number
 *           example: 1
 *         schemas:
 *           type: array
 *           example: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"]
 *         Resources:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Schema'
 *     ServiceProviderConfig:
 *       type: object
 *       properties:
 *         documentationUri:
 *           type: string
 *           example: /api-docs/swagger
 *         patch:
 *           type: object
 *           properties:
 *             supported:
 *               type: boolean
 *               example: false
 *         bulk:
 *           type: object
 *           properties:
 *             supported:
 *               type: boolean
 *               example: false
 *             maxOperations:
 *               type: number
 *               example: 1000
 *             maxPayloadSize:
 *               type: number
 *               example: 1048576
 *         filter:
 *           type: object
 *           properties:
 *             supported:
 *               type: boolean
 *               example: true
 *             maxResults:
 *               type: number
 *               example: 200
 *         changePassword:
 *           type: object
 *           properties:
 *             supported:
 *               type: boolean
 *               example: false
 *         sort:
 *           type: object
 *           properties:
 *             supported:
 *               type: boolean
 *               example: false
 *         schemas:
 *           type: array
 *           example: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"]
 *         etag:
 *           type: object
 *           properties:
 *             supported:
 *               type: boolean
 *               example: false
 *         authenticationSchemes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: HTTP Basic
 *               description:
 *                 type: string
 *                 example: Authentication scheme using the HTTP Basic Standard
 *               specUri:
 *                 type: string
 *                 example: http://www.rfc-editor.org/info/rfc2617
 *               type:
 *                 type: string
 *                 example: httpbasic
 */

/**
 * @openapi
 * /scim/v2/Users:
 *   get:
 *     summary: Get all SCIM users
 *     tags:
 *       - SCIM
 *     description: Returns all SCIM users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved array of SCIM users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMUsersListResponse'
 *       405:
 *         description: SCIM is not enabled, method not allowed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMNotEnabled'
 *       422:
 *         description: Operation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMInvalid'
 */
router.get("/v2/Users", getAll(isScimEnabled));

/**
 * @openapi
 * /scim/v2/Users/{userId}:
 *   get:
 *     summary: Get specific SCIM user by UUID
 *     tags:
 *       - SCIM
 *     description: Returns specific SCIM user based on specified UUID
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user id to retrieve attributes for
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved SCIM user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoredSCIMUser'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMUserNotFound'
 *       405:
 *         description: SCIM is not enabled, method not allowed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMNotEnabled'
 *       422:
 *         description: Operation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMInvalid'
 */
router.get("/v2/Users/:userId", getUserAttributes(isScimEnabled));

/**
 * @openapi
 * /scim/v2/Users:
 *   post:
 *     summary: Create a new SCIM user
 *     tags:
 *       - SCIM
 *     description: Create a new SCIM user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSCIMUser'
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Successfully created SCIM user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoredSCIMUser'
 *       405:
 *         description: SCIM is not enabled, method not allowed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMNotEnabled'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMUserExists'
 *       422:
 *         description: User object invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMInvalid'
 *             example:
 *               code: 422
 *               message: User object invalid
 */
router.post("/v2/Users", createUser(isScimEnabled));

/**
 * @openapi
 * /scim/v2/Users/{userId}:
 *   delete:
 *     summary: Delete an existing SCIM user
 *     tags:
 *       - SCIM
 *     description: Deletes an existing SCIM user based on specified user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user identifier for user to be deleted
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully deleted existing SCIM user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteSCIMUserSuccess'
 *       405:
 *         description: SCIM is not enabled, method not allowed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMNotEnabled'
 *       422:
 *         description: User deactivation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMInvalid'
 *             example:
 *               code: 422
 *               message: User deactivation failed
 */
router.delete("/v2/Users/:userId", deactivateUser(isScimEnabled));

/**
 * @openapi
 * /scim/v2/Users/{userId}:
 *   patch:
 *     summary: Patch an existing SCIM user
 *     tags:
 *       - SCIM
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user identifier for user to be patched
 *     requestBody:
 *       description: Changes to user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Operations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     op:
 *                       type: string
 *                       example: replace
 *                     value:
 *                       type: boolean
 *                       example: true
 *     description: Patch an existing SCIM user
 *     produces:
 *       - application/json
 *     responses:
 *       501:
 *         description: Operation in patch not supported
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMUnableToPatch'
 */
router.patch("/v2/Users/:id", patchUser(isScimEnabled));

/**
 * @openapi
 * /scim/v2/Users/{userId}:
 *   put:
 *     summary: Patch an existing SCIM user via PUT
 *     tags:
 *       - SCIM
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user identifier for user to be patched
 *     requestBody:
 *       description: Changes to user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Operations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     op:
 *                       type: string
 *                       example: replace
 *                     value:
 *                       type: boolean
 *                       example: true
 *     description: Patch an existing SCIM user
 *     produces:
 *       - application/json
 *     responses:
 *       501:
 *         description: Operation in patch not supported
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SCIMUnableToPatch'
 */
router.put("/v2/Users/:id", patchUser(isScimEnabled));

/**
 * @openapi
 * /scim/v2/ServiceProviderConfig:
 *   get:
 *     summary: Get service provider configuration
 *     tags:
 *       - SCIM
 *     description: Returns service provider configuration
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returned service provider configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceProviderConfig'
 */
router.get("/v2/ServiceProviderConfig", (req, res) =>
  res.send({
    documentationUri: `/api-docs/swagger`,
    patch: {
      supported: false,
    },
    bulk: {
      supported: false,
      maxOperations: 1000,
      maxPayloadSize: 1048576,
    },
    filter: {
      supported: true,
      maxResults: 200,
    },
    changePassword: {
      supported: false,
    },
    sort: {
      supported: false,
    },
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
    etag: {
      supported: false,
    },
    authenticationSchemes: [
      {
        name: "HTTP Basic",
        description: "Authentication scheme using the HTTP Basic Standard",
        specUri: "http://www.rfc-editor.org/info/rfc2617",
        type: "httpbasic",
      },
    ],
  })
);

const types = [
  {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:ResourceType"],
    id: "User",
    name: "User",
    endpoint: "/Users",
    schema: "urn:ietf:params:scim:schemas:core:2.0:User",
    meta: {
      location: `${accessUrl}/scim/v2/ResourceTypes/User`,
      resourceType: "ResourceType",
    },
  },
];
/**
 * @openapi
 * /scim/v2/ResourceTypes:
 *   get:
 *     summary: Get resource types
 *     tags:
 *       - SCIM
 *     description: Returns resource types
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returned resource types
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceTypes'
 */
router.get("/v2/ResourceTypes", (req, res) =>
  res.send(createListResponse(types.length, 10, 1, types))
);

/**
 * @openapi
 * /scim/v2/ResourceTypes/{name}:
 *   get:
 *     summary: Get resource type by name
 *     tags:
 *       - SCIM
 *     description: Returns resource type based on specified name
 *     parameters:
 *       - in: path
 *         name: name
 *         description: name of the resource type to be looked up
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returned resource type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceType'
 */
router.get("/v2/ResourceTypes/:name", ({ params: { name } }, res) =>
  res.send(types.find((type) => type.name.toLowerCase() == name.toLowerCase()))
);

const schemas = [
  {
    id: "urn:ietf:params:scim:schemas:core:2.0:User",
    name: "User",
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:Schema"],
    description: "User Schema",
    attributes: [
      {
        name: "userName",
        type: "string",
        multiValued: false,
        required: true,
        caseExact: false,
        mutability: "readWrite",
        returned: "default",
        uniqueness: "server",
        description:
          "Unique identifier for the User, typically used by the user to directly authenticate to the service provider. Each User MUST include a non-empty userName value. This identifier MUST be unique across the service provider's entire set of Users.",
      },
      {
        name: "displayName",
        type: "string",
        multiValued: false,
        required: true,
        caseExact: false,
        mutability: "readWrite",
        returned: "default",
        uniqueness: "none",
        description:
          "The name of the User, suitable for display to end-users.  The name SHOULD be the full name of the User being described, if known.",
      },
      {
        name: "externalId",
        type: "string",
        multiValued: false,
        required: true,
        caseExact: false,
        mutability: "readWrite",
        returned: "default",
        uniqueness: "server",
        description:
          "Stored identifier for the User in the IdP. Stored in the service provider to maintain consistency and avoid duplicates",
      },
      {
        name: "groups",
        type: "complex",
        multiValued: true,
        required: false,
        caseExact: false,
        mutability: "readOnly",
        returned: "default",
        uniqueness: "none",
        description:
          "A list of groups to which the user belongs, either through direct membership, through nested groups, or dynamically calculated.",
        subAttributes: [
          {
            name: "value",
            type: "string",
            multiValued: false,
            required: false,
            caseExact: false,
            mutability: "readOnly",
            returned: "default",
            uniqueness: "none",
            description: "The identifier of the User's group.",
          },
        ],
      },
      {
        name: "emails",
        type: "complex",
        multiValued: true,
        required: true,
        caseExact: false,
        mutability: "readWrite",
        returned: "default",
        uniqueness: "none",
        description:
          "Email addresses for the user. The value SHOULD be canonicalized by the service provider, e.g., 'bjensen@example.com' instead of 'bjensen@EXAMPLE.COM'.",
        subAttributes: [
          {
            name: "value",
            type: "string",
            multiValued: false,
            required: false,
            caseExact: false,
            mutability: "readWrite",
            returned: "default",
            uniqueness: "none",
            description:
              "Email addresses for the user. The value SHOULD be canonicalized by the service provider, e.g., 'bjensen@example.com' instead of 'bjensen@EXAMPLE.COM'.",
          },
          {
            name: "display",
            type: "string",
            multiValued: false,
            required: false,
            caseExact: false,
            mutability: "readWrite",
            returned: "default",
            uniqueness: "none",
            description:
              "A human-readable name, primarily used for display purposes.",
          },
          {
            name: "type",
            type: "string",
            multiValued: false,
            required: false,
            caseExact: false,
            mutability: "readWrite",
            returned: "default",
            uniqueness: "none",
            canonicalValues: ["work", "home", "other"],
            description:
              "A label indicating the attribute's function, e.g., 'work' or 'home'.",
          },
          {
            name: "primary",
            type: "boolean",
            multiValued: false,
            required: false,
            caseExact: true,
            mutability: "readWrite",
            returned: "default",
            uniqueness: "none",
            description:
              "A Boolean value indicating the 'primary' or preferred attribute value for this attribute, e.g., the preferred mailing address or primary email address.  The primary attribute value 'true' MUST appear no more than once.",
          },
        ],
      },
    ],
    meta: {
      resourceType: "Schema",
      location: `${accessUrl}/scim/v2/Schemas/urn:ietf:params:scim:schemas:core:2.0:User`,
    },
  },
];

/**
 * @openapi
 * /scim/v2/Schemas:
 *   get:
 *     summary: Get all schemas
 *     tags:
 *       - SCIM
 *     description: Return all schemas
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returned all schemas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schemas'
 */
router.get("/v2/Schemas", (req, res) =>
  res.send(createListResponse(1, 10, 1, schemas))
);

/**
 * @openapi
 * /scim/v2/Schemas/{id}:
 *   get:
 *     summary: Get schema
 *     tags:
 *       - SCIM
 *     description: Returns schema by specified ID
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the schema to be looked up
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returned schema by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schema'
 */
router.get("/v2/Schemas/:id", ({ params: { id } }, res) =>
  res.send(
    schemas.find((schema) => schema.id.toLowerCase() == id.toLowerCase())
  )
);

module.exports = router;
