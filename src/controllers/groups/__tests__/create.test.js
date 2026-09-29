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

import groupsModel from "../../../database/models/Groups";
import TestResponse from "../../../testUtils";
import { createGroup } from "../create";
import { INVALID_CODE } from "../../constants";

describe("Groups - CREATE", () => {
  it("should return created group", async () => {
    groupsModel.create = jest.fn((payload) => {
      return { error: null, ...payload };
    });
    groupsModel.findOne = jest.fn(() => {
      return null;
    });
    const mockRequest = {
      body: { label: "test", description: "test group" },
    };
    const mockResponse = new TestResponse();
    await createGroup(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(201);
    expect(data).toStrictEqual({
      created: true,
      uuid: `urn:ndtp:groups:test`,
    });
  });

  it("should return error - invalid", async () => {
    const mockRequest = {
      body: { description: "test group" },
    };
    const mockResponse = new TestResponse();
    await createGroup(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(INVALID_CODE);
    expect(data).toStrictEqual({
      code: INVALID_CODE,
      detail: undefined,
      message: "Invalid request",
    });
  });

  it("should return error - REPLICATION", async () => {
    groupsModel.findOne = jest.fn((payload) => {
      return payload;
    });
    groupsModel.create = jest.fn(() => {
      throw new DuplicateError();
    });
    const mockRequest = {
      body: { label: "test", description: "test group" },
    };
    const mockResponse = new TestResponse();
    await createGroup(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(409);
    expect(data).toStrictEqual({
      code: 409,
      message: "Group already exists",
    });
  });

  it("should return error - database error", async () => {
    groupsModel.findOne = jest.fn(() => {
      return null;
    });
    groupsModel.create = jest.fn(() => {
      return { error: new BasicDatabaseError() };
    });
    const mockRequest = {
      body: { label: "test", description: "test group" },
    };
    const mockResponse = new TestResponse();
    await createGroup(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(422);
    expect(data).toStrictEqual({
      code: 422,
      detail: undefined,
      message: "database error",
    });
  });

  it("should throw error - database error", async () => {
    groupsModel.findOne = jest.fn(() => {
      return null;
    });
    groupsModel.create = jest.fn(() => {
      throw new BasicDatabaseError();
    });
    const mockRequest = {
      body: { label: "test", description: "test group" },
    };
    const mockResponse = new TestResponse();
    await createGroup(mockRequest, mockResponse);

    const { statusCode, data } = mockResponse;
    expect(statusCode).toBe(422);
    expect(data).toStrictEqual({
      code: 422,
      detail: undefined,
      message: "database error",
    });
  });
});

class DuplicateError extends Error {
  constructor() {
    super("Duplicate");
    this.code = 11000;
    this.keyPattern = { group_id: 0 };
  }
}

class BasicDatabaseError extends Error {
  constructor() {
    super("database error");
    this.code = 422;
  }
}
