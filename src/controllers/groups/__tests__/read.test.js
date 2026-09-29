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

import mongoose from "mongoose";
import groupsModel from "../../../database/models/Groups";
import TestResponse from "../../../testUtils";
import { getAll, getGroup } from "../read";

const MOCK_GROUPS = [
  {
    _id: mongoose.Types.ObjectId.createFromHexString(
      "64d27846c248737ae094c4ea"
    ),
    label: "manager",
    group_id: "urn:ndtp:groups:manager",
    description: "Group for all managers",
    active: false,
    userCount: 0,
    users: [],
    __v: 0,
  },
  {
    _id: mongoose.Types.ObjectId.createFromHexString(
      "64d27aae0e121de092c20621"
    ),
    label: "developers",
    group_id: "urn:ndtp:groups:developers",
    description: "Group for all developers",
    active: true,
    userCount: 1,
    users: [
      {
        _id: "652975d718b769cf733c6154",
        id: "652975d718b769cf733c6154",
        name: "headofeng@ndtp.co.uk",
        active: true,
      },
    ],
    __v: 0,
  },
];

const expectedGroups = MOCK_GROUPS.map((group) => {
  delete group.__v;
  delete group.users;
  return group;
});

function getGrp (query, isInclusive, group) {
  const grp = isInclusive ? {} : group;
  Object.entries(query[3]["$project"]).forEach(([k, v]) => {
    if (isInclusive) {
      if (v) {
        grp[k] = group[k];
      }
    } else {
      if (!v) {
        delete grp[k];
      }
    }
  });
  return grp;
}

it("should GET all groups", async () => {
    groupsModel.aggregate = jest.fn((query) => {
      const groups = MOCK_GROUPS.map((group) => {
        const isInclusive = Object.values(query[3]["$project"]).some(
          (val) => val === 1
        );

        return getGrp(query, isInclusive, group);
      });

      return groups;
    });
    const mockRequest = { query: {} };
    const mockResponse = new TestResponse();
    await getAll(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(200);
    expect(data).toStrictEqual(expectedGroups);
  });

  it("should GET all groups - empty", async () => {
    groupsModel.aggregate = jest.fn(() => {
      return [];
    });
    const mockRequest = { query: {} };
    const mockResponse = new TestResponse();
    await getAll(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(200);
    expect(data).toStrictEqual([]);
  });

  it("should GET all groups - not found", async () => {
    groupsModel.aggregate = jest.fn(() => {
      return null;
    });
    const mockRequest = { query: {} };
    const mockResponse = new TestResponse();
    await getAll(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(404);
    expect(data).toStrictEqual({
      code: 404,
      detail: undefined,
      message: "Group(s) not found",
    });
  });

  it("should GET all groups - database error", async () => {
    groupsModel.aggregate = jest.fn(() => {
      throw new DatabaseError();
    });
    const mockRequest = { query: {} };
    const mockResponse = new TestResponse();
    await getAll(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(422);
    expect(data).toStrictEqual({
      code: 422,
      detail: undefined,
      message: "database error",
    });
  });

  //----------Group----------//

  it("should GET group", async () => {
    groupsModel.aggregate = jest.fn((query) => {
      return MOCK_GROUPS.filter(
        (group) => group._id.toString() === query[0]["$match"]._id.toString()
      ).map((group) => ({ ...group, userCount: 0 }));
    });
    const testId = "64d27846c248737ae094c4ea";
    const mockRequest = {
      params: {
        group: testId,
      },
    };
    const mockResponse = new TestResponse();
    await getGroup(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(200);
    expect(data).toStrictEqual(
      expectedGroups.find((group) => group._id.toString() === testId)
    );
  });

  it("should GET group - not found", async () => {
    groupsModel.aggregate = jest.fn(() => {
      return null;
    });
    const testId = "64f749485fce985092884376";
    const mockRequest = {
      params: {
        group: testId,
      },
    };
    const mockResponse = new TestResponse();
    await getGroup(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(404);
    expect(data).toStrictEqual({
      code: 404,
      detail: undefined,
      message: "Group(s) not found",
    });
  });

  it("should GET group - database error", async () => {
    groupsModel.aggregate = jest.fn(() => {
      throw new DatabaseError();
    });
    const testId = "64f749485fce985092884376";
    const mockRequest = {
      params: {
        group: testId,
      },
    };
    const mockResponse = new TestResponse();
    await getGroup(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(422);
    expect(data).toStrictEqual({
      code: 422,
      detail: undefined,
      message: "database error",
    });
  });

class DatabaseError extends Error {
  constructor() {
    super("database error");
    this.code = 422;
  }
}
