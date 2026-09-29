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

import usersModel from "../../../database/models/Users";
import TestResponse, { stringifyMongoId } from "../../../testUtils";
import { getAll, getUserAttributes } from "../read";

const mockingoose = require("mockingoose");
const externalId = "8bb01245-261e-4609-a4a5-xxxxxxxxxxxx";

const mockUsers = [
  {
    _id: "64dd02xxxxxxxxxxxcecbe13c",
    id: "64dd02xxxxxxxxxxxcecbe13c",
    externalId,
    name: "Thomas",
    userName: "headofeng@ndtp.co.uk",
    email: "headofeng@ndtp.co.uk",
    labels: [
      {
        name: "nationality",
        value: "GBR",
        toString: "nationality='GBR'",
        toDataLabelString: "permitted_nationalities='GBR'",
        _id: "64dd1f2yyyyyyyyyyy90e9ce",
      },
      {
        name: "clearance",
        value: "O",
        toString: "clearance='O'",
        toDataLabelString: "classification='O'",
        _id: "64dd1zzzzzzzzzzzzzz0e9cf",
      },
      {
        name: "personnel_type",
        value: "NON-GOV",
        toString: "personnel_type='NON-GOV'",
        toDataLabelString: null,
        _id: "64dd1faaaaaaaaaaaaa0e9d0",
      },
      {
        name: "deployed_organisation",
        value: "IANode",
        toString: "deployed_organisation='NDTP'",
        toDataLabelString: "permitted_organisations='NDTP'",
        _id: "64dd1bbbbbbbbbbbbbbbe9d1",
      },
    ],
    active: true,
    groups: [],
    userGroups: [
      "urn:ndtp:groups:developers",
      "urn:ndtp:groups:csuite",
    ],
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
  },
];
const expectedResponse = {
  schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
  totalResults: 1,
  startIndex: 1,
  itemsPerPage: 1,
  Resources: [
    {
      id: "64dd02xxxxxxxxxxxcecbe13c",
      externalId: "8bb01245-261e-4609-a4a5-xxxxxxxxxxxx",
      userName: "headofeng@ndtp.co.uk",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      groups: [],
    },
  ],
};
describe("SCIM User - Get", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it("should get all users", async () => {
    const mockRequest = { query: {} };
    const mockResponse = new TestResponse();

    mockingoose(usersModel).toReturn(mockUsers, "find");
    await getAll(true)(mockRequest, mockResponse);

    let {
      statusCode,
      data,
      data: { Resources },
    } = mockResponse;
    expect(statusCode).toBe(200);
    data.Resources = Resources.map(stringifyMongoId);
    expect(data).toEqual(expectedResponse);
  });

  it("should return error when there is an unexpected failure", async () => {
    const mockResponse = new TestResponse();
    const mockRequest = { query: {} };

    mockingoose(usersModel).toReturn(new Error("Error"), "find");
    await getAll(true)(mockRequest, mockResponse);

    const {
      statusCode,
      data: { detail },
    } = mockResponse;
    expect(statusCode).toBe(422);
    expect(detail).toBe("Error");
  });

  it("should return user not found error if there are no matches", async () => {
    const mockResponse = new TestResponse();
    const mockRequest = { query: { filter: 'userName eq "nonexistent"' } };

    mockingoose(usersModel).toReturn([], "find");
    await getAll(true)(mockRequest, mockResponse);

    const {
      statusCode,
      data: { totalResults, Resources },
    } = mockResponse;
    expect(statusCode).toBe(200);
    expect(totalResults).toBe(0);
    expect(Resources.length).toBe(0);
  });

  it("should return specified user", async () => {
    const mockResponse = new TestResponse();
    const mockRequest = { query: { filter: 'userName eq "headofeng@ndtp.co.uk"' } };

    mockingoose(usersModel).toReturn([mockUsers[0]], "find");
    await getAll(true)(mockRequest, mockResponse);

    const {
      statusCode,
      data: { totalResults, Resources },
    } = mockResponse;
    expect(statusCode).toBe(200);
    expect(totalResults).toBe(1);
    expect(Resources[0].userName).toBe("headofeng@ndtp.co.uk");
  });

  it("should successfully get user attributes", async () => {
    mockingoose(usersModel).toReturn(mockUsers[0], "findOne");
    const mockResponse = new TestResponse();
    const mockRequest = { params: { userId: externalId } };

    await getUserAttributes(true)(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(200);
    expect(stringifyMongoId(data)).toEqual(expectedResponse.Resources[0]);
  });

  it("should return error when there is a unexpected failure getting attributes", async () => {
    const mockResponse = new TestResponse();
    const mockRequest = { params: { userId: externalId } };

    mockingoose(usersModel).toReturn(new Error("Error"), "findOne");
    await getUserAttributes(true)(mockRequest, mockResponse);

    const {
      statusCode,
      data: { detail },
    } = mockResponse;
    expect(statusCode).toBe(422);
    expect(detail).toBe("Error");
  });

  it("should return user not found error if there are no matches getting attributes", async () => {
    const mockResponse = new TestResponse();
    const mockRequest = { params: { userId: "nonexistent" } };

    mockingoose(usersModel).toReturn(undefined, "findOne");
    await getUserAttributes(true)(mockRequest, mockResponse);

    const {
      statusCode,
      data: { detail },
    } = mockResponse;
    expect(statusCode).toBe(404);
    expect(detail).toBe("User not found");
  });
});
