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

import { updateUser } from "../update";
import usersModel from "../../../database/models/Users";
import TestResponse from "../../../testUtils";

const mockingoose = require("mockingoose");

const mockUser = {
  _id: "64dd02xxxxxxxxxxxcecbe13c",
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
      value: "Integration Architecture",
      toString: "deployed_organisation='Integration Architecture'",
      toDataLabelString: "permitted_organisations='Integration Architecture'",
      _id: "64dd1bbbbbbbbbbbbbbbe9d1",
    },
  ],
  active: true,
  groups: [],
  userGroups: ["urn:ndtp:groups:developers"],
  schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
};

describe("Users - UPDATE", () => {

  beforeEach(() => {
    mockingoose.resetAll();

  });


  it("should update a user successfully", async () => {
    mockingoose(usersModel)
      .toReturn(mockUser, "findOne")
      .toReturn({ modifiedCount: 1, matchedCount: 1 }, "updateOne");
    const mockRequest = {
      params: {
        id: "64dd02xxxxxxxxxxxcecbe13c",
      },
      body: {
        email: "headofeng@ndtp.co.uk",
      },
    };
    const mockResponse = new TestResponse();
    await updateUser(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;

    expect(statusCode).toBe(200);
    expect(data).toEqual({
      id: "64dd02xxxxxxxxxxxcecbe13c",
      updated: true,
    });
  });

  it("should handle error when passing invalid request", async () => {
    const mockRequest = {
      params: {
        id: "uuid",
      },
      body: {},
    };
    const mockResponse = new TestResponse();
    await updateUser(mockRequest, mockResponse);

    const {
      statusCode,
      data: { message },
    } = mockResponse;
    expect(statusCode).toBe(400);
    expect(message).toBe("Invalid request");
  });

  it("should handle database errors when attempting to update user", async () => {
    mockingoose(usersModel)
      .toReturn(mockUser, "findOne")
      .toReturn({ modifiedCount: 0, matchedCount: 1 }, "updateOne");
    const mockRequest = {
      params: {
        id: "64dd02xxxxxxxxxxxcecbe13c",
      },
      body: {
        email: "headofeng@ndtp.co.uk",
      },
    };
    const mockResponse = new TestResponse();
    await updateUser(mockRequest, mockResponse);

    const {
      statusCode,
      data: { updated },
    } = mockResponse;
    expect(statusCode).toBe(200);
    expect(updated).toBe(false);
  });

  it("should handle attempting to update user", async () => {
    mockingoose(usersModel)
      .toReturn(mockUser, "findOne")
      .toReturn({ modifiedCount: 0, matchedCount: 1 }, "updateOne");
    const mockRequest = {
      params: {
        id: "64dd02xxxxxxxxxxxcecbe13c",
      },
      body: {
        nationality: "FRA",
        active: false,
        test_label: "abc-123"
      },
    };
    const mockResponse = new TestResponse();
    await updateUser(mockRequest, mockResponse);

    const {
      statusCode,
      data: { updated },
    } = mockResponse;
    expect(statusCode).toBe(200);
    expect(updated).toBe(false);
  });
  it("updating users - user not found", async () => {
    usersModel.findOne = jest.fn().mockImplementationOnce(() => {
      return null;
    });
    const mockRequest = {
      params: {
        id: "64dd02xxxxxxxxxxxcecbe13c",
      },
      body: {
        email: "headofeng@ndtp.co.uk",
      },
    };
    const mockResponse = new TestResponse();
    await updateUser(mockRequest, mockResponse);

    const {
      statusCode,
      data: { message },
    } = mockResponse;
    expect(usersModel.findOne).toBeCalledWith(
      {
        id: "64dd02xxxxxxxxxxxcecbe13c",
      },
      "-_id -__v"
    );
    expect(statusCode).toBe(404);
    expect(message).toBe("User not found");
  });

  it("should handle unexpected errors when attempting to update user", async () => {
    usersModel.findOne = jest.fn().mockImplementationOnce(() => {
      return mockUser;
    });
    usersModel.updateOne = jest.fn().mockImplementationOnce(() => {
      throw new Error("uhoh");
    });
    const mockRequest = {
      params: {
        id: "64dd02xxxxxxxxxxxcecbe13c",
      },
      body: {
        email: "headofeng@ndtp.co.uk",
      },
    };
    const mockResponse = new TestResponse();
    await updateUser(mockRequest, mockResponse);

    const {
      statusCode,
      data: { message },
    } = mockResponse;
    expect(statusCode).toBe(422);
    expect(message).toBe("uhoh");
  });

  it("should handle empty update object when attempting to update user", async () => {
    mockingoose(usersModel).toReturn(mockUser, "findOne");
    const mockRequest = {
      params: {
        id: "64dd02xxxxxxxxxxxcecbe13c",
      },
      body: {},
    };
    const mockResponse = new TestResponse();
    await updateUser(mockRequest, mockResponse);

    const {
      statusCode,
      data: { message },
    } = mockResponse;
    expect(statusCode).toBe(400);
    expect(message).toBe("Invalid request");
  });



});
