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

import {
  createUserIfNotExist,
  getAll,
  getAllUsers,
  getUserAttributes,
  getUserFromEmail,
  getUserFromExternalId,
} from "../read";
import usersModel from "../../../database/models/Users";
import TestResponse, { stringifyMongoId } from "../../../testUtils";


const mockingoose = require("mockingoose");

const mockUsers = [
  {
    id: "64dd02xxxxxxxxxxxcecbe13c",
    externalId: "8bb01245-261e-4609-a4a5-xxxxxxxxxxxx",
    name: "Thomas",
    userName: "headofeng@ndtp.co.uk",
    email: "headofeng@ndtp.co.uk",
    labels: [
      {
        name: "nationality",
        value: "GBR",
        toString: "nationality='GBR'",
        toDataLabelString: "permitted_nationalities='GBR'",
        _id: "66042eba7b888050ea0a1476",
      },
      {
        name: "clearance",
        value: "O",
        toString: "clearance='O'",
        toDataLabelString: "classification='O'",
        _id: "66042f2abd3f44e4107d22b9",
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
        value: "Integration Architecture",
        toString: "deployed_organisation='Integration Architecture'",
        toDataLabelString: "permitted_organisations='Integration Architecture'",
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
  {
    _id: "64ddcccccccccccccccbe13b",
    id: "64ddcccccccccccccccbe13b",
    externalId: "138c92a8-cbc8-4a4c-822c-zzzzzzzzzzzz",
    name: "coo@ndtp.co.uk",
    userName: "coo@ndtp.co.uk",
    email: "coo@ndtp.co.uk",
    labels: [],
    active: false,
    groups: [],
    userGroups: [],
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
    __v: 0,
  },
];

describe("Users - GET", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it("should get all users", async () => {
    mockingoose(usersModel).toReturn(mockUsers, "find");

    const { data } = await getAllUsers();
    const users = data.map(stringifyMongoId);
    expect(users).toMatchObject(mockUsers);
  });

  it("should get all users (api call)", async () => {
    mockingoose(usersModel).toReturn(mockUsers, "find");
    const mockResponse = new TestResponse();
    const mockRequest = {};
    await getAll(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(200);
    expect(data.map(stringifyMongoId)).toEqual(mockUsers);
  });

  it("should return error when there is an unexpected failure", async () => {
    mockingoose(usersModel).toReturn(new Error("uhoh"), "find");
    const mockResponse = new TestResponse();
    const mockRequest = {};

    await getAll(mockRequest, mockResponse);
    expect(mockResponse.statusCode).toBe(422);
  });

  it("should successfully get user", async () => {
    mockingoose(usersModel).toReturn(mockUsers[0], "findOne");
    const mockResponse = new TestResponse();
    const mockRequest = {
      params: {
        id: "64dd02xxxxxxxxxxxcecbe13c",
      },
    };
    await getUserAttributes(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(200);
    expect(stringifyMongoId(data)).toEqual(mockUsers[0]);
  });

  it("should successfully get user attributes by name", async () => {
    const expected = {
      attributes: [
        "permitted_nationalities='GBR'",
        "classification='O'",
        "permitted_organisations='Integration Architecture'",
        "urn:ndtp:groups:developers:and",
        "urn:ndtp:groups:csuite:and",
        "urn:ndtp:groups:developers:or",
        "urn:ndtp:groups:csuite:or",
      ],
      id: "64dd02xxxxxxxxxxxcecbe13c",
    };
    mockingoose(usersModel).toReturn(mockUsers[0], "findOne");
    const mockResponse = new TestResponse();
    const mockRequest = {
      params: {
        email: "headofeng@ndtp.co.uk",
      },
    };
    await getUserFromEmail(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(200);
    expect(stringifyMongoId(data)).toEqual(expected);
  });

  it("should successfully get user attributes by external ID", async () => {
    const expected = {
      attributes: [
        "permitted_nationalities='GBR'",
        "classification='O'",
        "permitted_organisations='Integration Architecture'",
        "urn:ndtp:groups:developers:and",
        "urn:ndtp:groups:csuite:and",
        "urn:ndtp:groups:developers:or",
        "urn:ndtp:groups:csuite:or",
      ],
      id: "64dd02xxxxxxxxxxxcecbe13c",
    };
    mockingoose(usersModel).toReturn(mockUsers[0], "findOne");
    const mockResponse = new TestResponse();
    const mockRequest = {
      params: {
        sub: "8bb01245-261e-4609-a4a5-xxxxxxxxxxxx",
      },
    };
    await getUserFromExternalId(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(200);
    expect(stringifyMongoId(data)).toEqual(expected);
  });

  it("should successfully get user attributes by external ID but not active", async () => {
    const expected = {
      attributes: [],
      id: "64ddcccccccccccccccbe13b",
    };
    mockingoose(usersModel).toReturn(mockUsers[1], "findOne");
    const mockResponse = new TestResponse();
    const mockRequest = {
      params: {
        sub: "138c92a8-cbc8-4a4c-822c-zzzzzzzzzzzz",
      },
    };
    await getUserFromExternalId(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(200);
    expect(stringifyMongoId(data)).toEqual(expected);
  });

  it("should fail to get user attributes by external ID", async () => {
    mockingoose(usersModel).toReturn(new Error("uhoh"), "findOne");
    const mockResponse = new TestResponse();
    const mockRequest = {
      params: {
        sub: "138c92a8-cbc8-4a4c-822c-zzzzzzzzzzzz",
      },
    };
    await getUserFromExternalId(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(422);
    expect(data).toEqual({"code":422, "message": "uhoh"});
  });

  it("should return error when there is a unexpected error on find", async () => {
    mockingoose(usersModel).toReturn(new Error("uhoh"), "findOne");
    const mockResponse = new TestResponse();
    const mockRequest = {
      params: {
        email: "headofeng@ndtp.co.uk",
      },
    };

    await getUserFromEmail(mockRequest, mockResponse);
    expect(mockResponse.statusCode).toBe(422);
  });

  it("should return user not found error if there are 0 matches", async () => {
    mockingoose(usersModel).toReturn(undefined, "findOne");
    const mockResponse = new TestResponse();
    const mockRequest = {
      params: {
        email: "doesntexist@fake.com",
      },
    };

    await getUserFromEmail(mockRequest, mockResponse);
    expect(mockResponse.statusCode).toBe(404);
  });

  it("should return error when there is a unexpected failure", async () => {
    mockingoose(usersModel).toReturn(new Error("uhoh"), "findOne");
    const mockResponse = new TestResponse();
    const mockRequest = {
      params: {
        id: "bbbb9783-c24c-494d-9543-f60fc9f2407f",
      },
    };

    await getUserAttributes(mockRequest, mockResponse);
    expect(mockResponse.statusCode).toBe(422);
  });

  it("should return user not found error if there are no matches", async () => {
    mockingoose(usersModel).toReturn(undefined, "findOne");
    const mockResponse = new TestResponse();
    const mockRequest = {
      params: {
        id: "doesntexist",
      },
    };

    await getUserAttributes(mockRequest, mockResponse);
    expect(mockResponse.statusCode).toBe(404);
  });

  it("should create user if not found", async () => {
    mockingoose(usersModel).toReturn(undefined, "findOne").toReturn({}, "save");

    const mockResponse = new TestResponse();
    const mockRequest = {
      token: {
        sub: "abc-123",
        email: "headofeng@ndtp.co.uk",
        name: "Tom"
      }
    };

    await createUserIfNotExist(mockRequest, mockResponse);
    expect(mockResponse.statusCode).toBe(200);
  })

  it("should throw malformed request - missing email", async () => {
    mockingoose(usersModel).toReturn(undefined, "findOne").toReturn({}, "save");

    const mockResponse = new TestResponse();
    const mockRequest = {
      token: {
        sub: "abc-123",
        name: "Tom"
      }
    };

    await createUserIfNotExist(mockRequest, mockResponse);
    expect(mockResponse.statusCode).toBe(422);
  })

  const testUser = {
    _id: "64ddcccccccccccccccbe13b",
    id: "64ddcccccccccccccccbe13b",
    externalId: "138c92a8-cbc8-4a4c-822c-zzzzzzzzzzzz",
    name: "coo@ndtp.co.uk",
    userName: "coo@ndtp.co.uk",
    email: "coo@ndtp.co.uk",
    labels: [],
    active: false,
    groups: [],
    userGroups: [],
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
    __v: 0,
  }

  const uiResult = {
    username: "coo@ndtp.co.uk",
    active: false,
    email: "coo@ndtp.co.uk",
    userId: "64ddcccccccccccccccbe13b",
    attributes: {},
    groups: []
  }
  it("should return user", async () => {
    mockingoose(usersModel).toReturn(testUser, "findOne");
    const exId = "138c92a8-cbc8-4a4c-822c-zzzzzzzzzzzz"
    const accessId = "64ddcccccccccccccccbe13b"
    const mockResponse = new TestResponse();
    const mockRequest = {
      token: {
        sub: exId,
      }
    };

    await createUserIfNotExist(mockRequest, mockResponse);
    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(200);
    expect(stringifyMongoId(data)).toEqual(uiResult);
    expect(data.userId).toEqual(accessId)
  })


});
