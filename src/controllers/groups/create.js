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

import groupsModel from "../../database/models/Groups";
import { isGroupNameValid, isValidPayload } from "./utils";
import {
  isBodyEmpty,
  sendErrorResponse,
  sendInvalidRequest,
  setupSuccessResponseCode,
} from "../utils";
import { CREATE_CODE } from "../constants";

const sendSuccessCreated = setupSuccessResponseCode(CREATE_CODE)("created");
const organisation = "ndtp";

export const createGroup = async (req, res) => {
  const { body } = req;

  if (isBodyEmpty(body) || !isValidPayload(body))
    return sendInvalidRequest(res);

  const { label, description } = body;

  if (!label || !description) {
    return sendErrorResponse(res, {
      code: 400,
      message: `Fields missing: ${!label ? "Name, " : ""}${!description ? "Description" : ""
        }`.replace(/,\s*$/, ""),
    });
  }

  const id = `urn:${organisation}:groups:${label}`;
  if (!isGroupNameValid(label)) {
    return sendErrorResponse(res, {
      code: 400,
      message: "The group name contains invalid characters.",
      detail: "https://github.com/National-Node-Net/rdf-abac/blob/main/docs/abac-specification.md#syntax-of-words",
    });
  }
  const payload = {
    group_id: id,
    label,
    description,
    active: true,
  };

  try {
    const groups = await groupsModel.findOne({ group_id: id }, { __v: 0 });

    if (groups) {
      return res.status(409).send({
        code: 409,
        message: "Group already exists",
      });
    }

    const { error, group_id } = await groupsModel.create(payload);

    if (error) return sendErrorResponse(res, error);
    sendSuccessCreated(res, group_id);
  } catch (error) {
    const { code } = error;
    if (code === 11000) {
      error.code = 409;
      error.message = `Group with ${Object.keys(error.keyPattern)[0]
        }, ${label}, already exists`;
    }
    sendErrorResponse(res, error);
  }
};
