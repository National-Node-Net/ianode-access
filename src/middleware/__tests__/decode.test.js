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

import TestResponse from "../../testUtils";
import DecodeJWT from "../decode";
import axios from "axios";
describe("testing decode fn", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  it("test development with null url", () => {
    const url = null;
    const req = {
      headers: {},
    };
    try {
      const _ = new DecodeJWT(url, "authorization", "groups");
      expect(true).toBe(false);
    } catch (err) {
      expect(err.message).toBe("OpenID provider is undefined and is required.");
    }
  });
  it("test development", () => {
    const url = "development";
    const req = {
      headers: {},
      header: () => {
        return undefined;
      },
    };
    const decoder = new DecodeJWT(url, "authorization", "groups");

    const res = new TestResponse();
    const next = jest.fn();

    decoder.middleware(req, res, next);
    expect(req.isAdmin).toBe(true);
    expect(req.isUser).toBe(true);
    expect(res).toBe(res);
    const { email, username, sub } = req.token;
    expect(email).toBe("test+dev@ndtp.co.uk");
    expect(username).toBe("8edae5a0-1f5a-466f-b58e-64c611f31722");
    expect(sub).toBe("8edae5a0-1f5a-466f-b58e-64c611f31722");
    expect(next).toHaveBeenCalled();
  });

  it("handle malformed token header", () => {
    const url = null;
    const req = {
      headers: {
        authorization:
          // Mock jwt
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQHRlbGljZW50LmlvIiwidXNlcm5hbWUiOiI4ZWRhZTVhMC0xZjVhLTQ2NmYtYjU4ZS02NGM2MTFmMzE3MjMiLCJzdWIiOiI4ZWRhZTVhMC0xZjVhLTQ2NmYtYjU4ZS02NGM2MTFmMzE3MjMiLCJncm91cHMiOlsidGNfYWRtaW4iLCJ0Y19yZWFkIl19.pmj7NNvwgWXRXV13x9vXYhIfnqsE2ny52ADGL3l_934",
      },
    };
    try {
      const _ = new DecodeJWT(url, "authorization", "groups");
      expect(true).toBe(false);
    } catch (err) {
      expect(err.message).toBe("OpenID provider is undefined and is required.");
    }
  });

  it("test development with Auth", async () => {
    const url = "development";
    const headers = {
      authorization:
        "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQHRlbGljZW50LmlvIiwidXNlcm5hbWUiOiI4ZWRhZTVhMC0xZjVhLTQ2NmYtYjU4ZS02NGM2MTFmMzE3MjMiLCJzdWIiOiI4ZWRhZTVhMC0xZjVhLTQ2NmYtYjU4ZS02NGM2MTFmMzE3MjMiLCJncm91cHMiOlsidGNfYWRtaW4iLCJ0Y19yZWFkIl19.pmj7NNvwgWXRXV13x9vXYhIfnqsE2ny52ADGL3l_934",
    };
    const req = {
      headers,
      header: (name) => {
        if (name.toLowerCase() === "authorization") {
          return headers.authorization;
        }
      },
    };
    const decoder = new DecodeJWT(url, "authorization", "groups");
    await decoder.initialize();
    const res = new TestResponse();
    const next = jest.fn();

    decoder.middleware(req, res, next);
    expect(res).toBe(res);
    const { email, username, sub } = req.token;
    expect(username).toBe("8edae5a0-1f5a-466f-b58e-64c611f31723");
    expect(sub).toBe("8edae5a0-1f5a-466f-b58e-64c611f31723");
    expect(next).toHaveBeenCalled();
  });

  it("test development with user admin auth fully", async () => {
    const url = "http://localhost:8991";
    const testObj = {
      jwks_uri: "http://localhost:8991/.well-known/jwks.json",
    };
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQHRlbGljZW50LmlvIiwidXNlcm5hbWUiOiI4ZWRhZTVhMC0xZjVhLTQ2NmYtYjU4ZS02NGM2MTFmMzE3MjMiLCJzdWIiOiI4ZWRhZTVhMC0xZjVhLTQ2NmYtYjU4ZS02NGM2MTFmMzE3MjMiLCJncm91cHMiOlsidGNfYWRtaW4iLCJ0Y19yZWFkIl19.pmj7NNvwgWXRXV13x9vXYhIfnqsE2ny52ADGL3l_934";
    const headers = {
      authorization: `Bearer ${token}`,
    };
    const req = {
      headers,
      header: (name) => {
        if (name.toLowerCase() === "authorization") {
          return headers.authorization;
        }
      },
    };
    axios.get = jest.fn((url) => {
      if (url === `http://localhost:8991/.well-known/openid-configuration`) {
        return { data: testObj };
      }
    });
    const res = new TestResponse();
    const next = jest.fn();
    const decoder = new DecodeJWT(url, "authorization", "groups");
    await decoder.initialize();
    expect(decoder.development).toBe(false);
    expect(decoder.url).toBe(url);
    expect(decoder.openid_configuration).toBe(testObj);
    const payload = {
      groups: ["ianode_admin", "ianode_read"],
    };
    decoder.verifyToken = jest.fn(async (t) => {
      if (token === t) {
        return [payload, null];
      }
    });
    await decoder.middleware(req, res, next);

    expect(req.isAdmin).toBe(true);
    expect(req.isUser).toBe(true);
    expect(req.token).toBe(payload);
    expect(next).toHaveBeenCalled();
  });

  it("test development with admin auth fully", async () => {
    const url = "http://localhost:8991";
    const testObj = {
      jwks_uri: "http://localhost:8991/.well-known/jwks.json",
    };
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQHRlbGljZW50LmlvIiwidXNlcm5hbWUiOiI4ZWRhZTVhMC0xZjVhLTQ2NmYtYjU4ZS02NGM2MTFmMzE3MjMiLCJzdWIiOiI4ZWRhZTVhMC0xZjVhLTQ2NmYtYjU4ZS02NGM2MTFmMzE3MjMiLCJncm91cHMiOlsidGNfYWRtaW4iLCJ0Y19yZWFkIl19.pmj7NNvwgWXRXV13x9vXYhIfnqsE2ny52ADGL3l_934";
    const headers = {
      authorization: `bearer ${token}`,
    };
    const req = {
      headers,
      header: (name) => {
        if (name.toLowerCase() === "authorization") {
          return headers.authorization;
        }
      },
    };
    axios.get = jest.fn((url) => {
      if (url === `http://localhost:8991/.well-known/openid-configuration`) {
        return { data: testObj };
      }
    });
    const res = new TestResponse();
    const next = jest.fn();
    const decoder = new DecodeJWT(url, "authorization", "groups");
    await decoder.initialize();

    const payload = {
      groups: ["ianode_admin"],
    };
    decoder.verifyToken = jest.fn(async (t) => {
      if (token === t) {
        return [payload, null];
      }
    });
    await decoder.middleware(req, res, next);
    expect(req.isAdmin).toBe(true);
    expect(req.isUser).toBe(false);
    expect(req.token).toBe(payload);
    expect(next).toHaveBeenCalled();
  });
  it("test development with user auth fully", async () => {
    const url = "http://localhost:8991";
    const testObj = {
      jwks_uri: "http://localhost:8991/.well-known/jwks.json",
    };
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQHRlbGljZW50LmlvIiwidXNlcm5hbWUiOiI4ZWRhZTVhMC0xZjVhLTQ2NmYtYjU4ZS02NGM2MTFmMzE3MjMiLCJzdWIiOiI4ZWRhZTVhMC0xZjVhLTQ2NmYtYjU4ZS02NGM2MTFmMzE3MjMiLCJncm91cHMiOlsidGNfYWRtaW4iLCJ0Y19yZWFkIl19.pmj7NNvwgWXRXV13x9vXYhIfnqsE2ny52ADGL3l_934";
    const headers = {
      authorization: `bearer ${token}`,
    };
    const req = {
      headers,
      header: (name) => {
        if (name.toLowerCase() === "authorization") {
          return headers.authorization;
        }
      },
    };
    axios.get = jest.fn((url) => {
      if (url === `http://localhost:8991/.well-known/openid-configuration`) {
        return { data: testObj };
      }
    });
    const res = new TestResponse();
    const next = jest.fn();
    const decoder = new DecodeJWT(url, "authorization", "groups");
    await decoder.initialize();

    const payload = {
      groups: ["ianode_read"],
    };
    decoder.verifyToken = jest.fn(async (t) => {
      if (token === t) {
        return [payload, null];
      }
    });
    await decoder.middleware(req, res, next);
    expect(req.isAdmin).toBe(false);
    expect(req.isUser).toBe(true);
    expect(req.token).toBe(payload);
    expect(next).toHaveBeenCalled();
  });

  it("test Custom Error", async () => {
    const url = "http://localhost:9999";
    const headers = {
      authorization:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQHRlbGljZW50LmlvIiwidXNlcm5hbWUiOiI4ZWRhZTVhMC0xZjVhLTQ2NmYtYjU4ZS02NGM2MTFmMzE3MjMiLCJzdWIiOiI4ZWRhZTVhMC0xZjVhLTQ2NmYtYjU4ZS02NGM2MTFmMzE3MjMiLCJncm91cHMiOlsidGNfYWRtaW4iLCJ0Y19yZWFkIl19.pmj7NNvwgWXRXV13x9vXYhIfnqsE2ny52ADGL3l_934",
    };
    const req = {
      headers,
      header: (name) => {
        if (name.toLowerCase() === "authorization") {
          return headers.authorization;
        }
      },
    };
    try {
      const decoder = new DecodeJWT(url, "authorization", "groups");
      axios.get = jest.fn((u) => {
        if (u === `${url}/.well-known/openid-configuration`) {
          const err = new Error("Error");
          err.code = 404;
          throw err;
        }
      });
      await decoder.initialize();
      expect(true).toBe(false);
    } catch (err) {
      expect(err.code).toBe(404);
      expect(err.details).toBe("Error");
      expect(err.message).toBe("Unable to retrieve openid-configuration");
    }
  });
});
