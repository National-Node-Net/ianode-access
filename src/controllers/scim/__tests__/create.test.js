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

import { v4 as uuidv4 } from "uuid";

import TestResponse from "../../../testUtils";
import usersModel from "../../../database/models/Users";
import { createUser } from "../create";

const mockingoose = require("mockingoose");

describe("SCIM User - Create", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it("should return the created user", async () => {
    const uuid = uuidv4();
    const mockResponse = new TestResponse();

    mockingoose(usersModel).toReturn({}, "save");

    await createUser(true)(
      {
        body: {
          externalId: uuid,
          userName: "name",
          displayName: "FirstName MiddleName LastName",
          emails: [
            {
              value: "email1",
            },
            {
              value: "email2",
              primary: true,
            },
          ],
          groups: [
            "urn:ndtp:groups:developers",
            "urn:ndtp:groups:group2",
          ],
        },
      },
      mockResponse
    );

    const {
      data,
      data: { id },
    } = mockResponse;
    expect(data).toStrictEqual({
      id,
      externalId: uuid,
      userName: "name",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      groups: ["urn:ndtp:groups:developers", "urn:ndtp:groups:group2"],
    });
  });

  it("should handle the error if it fails to create the user", async () => {
    const uuid = uuidv4();
    const mockResponse = new TestResponse();

    mockingoose(usersModel).toReturn({}, "save");

    await createUser(true)(
      {
        body: {
          externalId: uuid,
          emails: [
            {
              value: "email1",
            },
            {
              value: "email2",
              primary: true,
            },
          ],
          groups: [
            "urn:ndtp:groups:developers",
            "urn:ndtp:groups:group2",
          ],
        },
      },
      mockResponse
    );

    const {
      data: { status, detail },
    } = mockResponse;
    expect(status).toBe(422);
    expect(detail).toBe(
      "Users validation failed: name: Path `name` is required."
    );
  });
});

describe("SCIM User - Update", () => {});
