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

import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { mapScimToUser, mapMongoToScim } from "../utils";

describe("SCIM Utils", () => {
  it("should return user", async () => {
    const uuid = uuidv4();

    const scim = {
      externalId: uuid,
      userName: "name",
      emails: [
        {
          value: "email1",
        },
        {
          value: "email2",
          primary: true,
        },
      ],
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      groups: ["urn:ndtp:groups:developers", "urn:ndtp:groups:group2"],
    };

    const user = mapScimToUser(scim);
    const id = user.id;
    const testUser = {
      _id: id,
      id,
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      externalId: uuid,
      name: "name",
      userName: "name",
      email: "email2",
      labels: [],
      groups: ["urn:ndtp:groups:developers", "urn:ndtp:groups:group2"],
    };

    expect(user).toStrictEqual(testUser);
  });

  it("should return scim user", async () => {
    const id = new Types.ObjectId();
    const uuid = uuidv4();

    const user = {
      _id: id,
      id,
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      externalId: uuid,
      name: "name",
      userName: "name",
      email: "email2",
      labels: [],
      groups: ["urn:ndtp:groups:developers", "urn:ndtp:groups:group2"],
    };

    const scim = {
      id,
      externalId: uuid,
      userName: "name",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      groups: ["urn:ndtp:groups:developers", "urn:ndtp:groups:group2"],
    };

    expect(mapMongoToScim(user)).toStrictEqual(scim);
  });

  it("should map scim user", () => {
    const body = {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      userName: "engineer@ndtp.co.uk",
      name: {
        givenName: "Molly",
        familyName: "P",
      },
      emails: [
        {
          primary: true,
          value: "engineer@ndtp.co.uk",
          type: "work",
        },
      ],
      displayName: "Molly P",
      locale: "en-US",
      externalId: "00uauxtud8O6Z5OJV5d7",
      groups: [],
      password: "password123",
      active: true,
    };
    const scimUser = mapScimToUser(body);
    delete scimUser.id;
    delete scimUser._id;
    expect(scimUser).toEqual({
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      externalId: scimUser.externalId,
      userName: scimUser.userName,
      labels: [],
      groups: [],
      email: "engineer@ndtp.co.uk",
      name: "Molly P",
    });
  });
});
