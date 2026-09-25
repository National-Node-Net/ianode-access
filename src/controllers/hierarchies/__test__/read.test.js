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

import TestResponse from "../../../testUtils";
import {
  getAllHierarchies,
  getAll,
  getHierarchy,
  getHierarchyLookup,
} from "../read";
import attributesModel from "../../../database/models/Attributes";
const MOCK_ATTRIBUTES = [
  {
    _id: "64d25a470a97a540165757da",
    user_attribute_name: "clearance",
    data_attribute_name: "classification",
    value: { type: "hierarchy", values: ["O", "OS", "S", "TS"] },
    is_icihm: true,
    readonly: true,
  },
  {
    _id: "64d25a470a97a540165757dc",
    user_attribute_name: "deployed_organisation",
    data_attribute_name: "permitted_organisations",
    value: { type: "string", values: null },
    is_icihm: true,
    readonly: true,
  },
  {
    _id: "64d25a470a97a540165757dd",
    user_attribute_name: "personnel_type",
    data_attribute_name: null,
    value: { type: "enum", values: ["GOV", "NON-GOV"] },
    is_icihm: true,
    readonly: true,
  },
];

const GET_ALL_HIERARCHIES_RETURN = {
  data: [
    {
      uuid: "64d25a470a97a540165757da",
      name: "classification",
      tiers: ["O", "OS", "S", "TS"],
      readonly: true,
    },
  ],
};

  it("test get all hierarchies", async () => {
    attributesModel.find = jest.fn((query) => {
      return MOCK_ATTRIBUTES.filter(
        (attribute) => attribute.value.type === query["value.type"]
      );
    });
    const data = await getAllHierarchies();
    expect(data).toStrictEqual(GET_ALL_HIERARCHIES_RETURN);
  });

  it("test get all hierarchies", async () => {
    attributesModel.find = jest.fn((query) => {
      return MOCK_ATTRIBUTES.filter(
        (attribute) => attribute.value.type === query["value.type"]
      );
    });
    const req = {};
    const res = new TestResponse();
    await getAll(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data).toStrictEqual(GET_ALL_HIERARCHIES_RETURN.data);
  });

  it("test errors getting all hierarchies", async () => {
    attributesModel.find = jest.fn((query) => {
      const err = new Error("dun goofed");
      err.code = 422;
      throw err;
    });
    const req = {};
    const res = new TestResponse();
    await getAll(req, res);
    expect(res.statusCode).toBe(422);
    expect(res.data).toStrictEqual({
      code: 422,
      detail: undefined,
      message: "dun goofed",
    });
  });

  it("test errors getting all hierarchies", async () => {
    attributesModel.find = jest.fn((query) => {
      throw null;
    });
    const req = {};
    const res = new TestResponse();
    await getAll(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.data).toStrictEqual({
      code: 404,
      detail: undefined,
      message: "Hierarchy/ies not found",
    });
  });

  it("test get specific hierarchy", async () => {
    attributesModel.findOne = jest.fn((query) => {
      const keys = Object.keys(query);
      return MOCK_ATTRIBUTES.find((attribute) => {
        return keys.every((key) => attribute[key] === query[key]);
      });
    });
    const req = {
      params: {
        hierarchyId: "64d25a470a97a540165757da",
      },
    };

    const res = new TestResponse();
    await getHierarchy(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data).toStrictEqual(GET_ALL_HIERARCHIES_RETURN.data[0]);
  });

  it("test errors specific hierarchy not found", async () => {
    attributesModel.findOne = jest.fn((query) => {
      const keys = Object.keys(query);
      return MOCK_ATTRIBUTES.find((attribute) => {
        return keys.every((key) => attribute[key] === query[key]);
      });
    });
    const req = {
      params: {
        hierarchyId: "64d25a470a97a5401xxxxxxx",
      },
    };

    const res = new TestResponse();
    await getHierarchy(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.data).toStrictEqual({
      code: 404,
      detail: undefined,
      message: "Hierarchy/ies not found",
    });
  });

  it("test errors getting specific hierarchy", async () => {
    attributesModel.findOne = jest.fn((query) => {
      const err = new Error("dun goofed");
      err.code = 422;
      throw err;
    });
    const req = {
      params: {
        hierarchyId: "64d25a470a97a5401xxxxxxx",
      },
    };

    const res = new TestResponse();
    await getHierarchy(req, res);
    expect(res.statusCode).toBe(422);
    expect(res.data).toStrictEqual({
      code: 422,
      detail: undefined,
      message: "dun goofed",
    });
  });

  it("test get hierarchies with attribute clearance", async () => {
    attributesModel.findOne = jest.fn((query) => {
      const keys = Object.keys(query).filter((key) => key !== "value.type");
      return MOCK_ATTRIBUTES.find((attribute) => {
        return keys.every((key) => attribute[key] === query[key]);
      });
    });
    const req = {
      query: {
        isUserAttribute: "true",
      },
      params: {
        name: "clearance",
      },
    };

    const res = new TestResponse();
    await getHierarchyLookup(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data).toStrictEqual(GET_ALL_HIERARCHIES_RETURN.data[0]);
  });

  it("test get hierarchies with attribute classification", async () => {
    attributesModel.findOne = jest.fn((query) => {
      const keys = Object.keys(query).filter((key) => key !== "value.type");
      return MOCK_ATTRIBUTES.find((attribute) => {
        return keys.every((key) => attribute[key] === query[key]);
      });
    });
    const req = {
      query: {
        isUserAttribute: "false",
      },
      params: {
        name: "classification",
      },
    };

    const res = new TestResponse();
    await getHierarchyLookup(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data).toStrictEqual(GET_ALL_HIERARCHIES_RETURN.data[0]);
  });
  it("test get hierarchies with attribute classification empty query", async () => {
    attributesModel.findOne = jest.fn((query) => {
      const keys = Object.keys(query).filter((key) => key !== "value.type");
      return MOCK_ATTRIBUTES.find((attribute) => {
        return keys.every((key) => attribute[key] === query[key]);
      });
    });
    const req = {
      query: {},
      params: {
        name: "classification",
      },
    };

    const res = new TestResponse();
    await getHierarchyLookup(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data).toStrictEqual(GET_ALL_HIERARCHIES_RETURN.data[0]);
  });

  it("test errors getting hierarchies with invalid attribute not found", async () => {
    attributesModel.findOne = jest.fn((query) => {
      const keys = Object.keys(query).filter((key) => key !== "value.type");
      return MOCK_ATTRIBUTES.find((attribute) => {
        return keys.every((key) => attribute[key] === query[key]);
      });
    });
    const req = {
      query: {},
      params: {
        name: "wrong-un",
      },
    };

    const res = new TestResponse();
    await getHierarchyLookup(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.data).toStrictEqual({
      code: 404,
      detail: undefined,
      message: "Hierarchy/ies not found",
    });
  });

  it("test errors getting hierarchies with invalid attribute", async () => {
    attributesModel.findOne = jest.fn((query) => {
      const err = new Error("dun goofed");
      err.code = 422;
      throw err;
    });
    const req = {
      query: {},
      params: {
        name: "wrong-un",
      },
    };

    const res = new TestResponse();
    await getHierarchyLookup(req, res);
    expect(res.statusCode).toBe(422);
    expect(res.data).toStrictEqual({
      code: 422,
      detail: undefined,
      message: "dun goofed",
    });
  });

