# README

**Repository:** `ianode-access`   
**Description:** `This repository provides an application that allows the testing and demonstration of Attribute Based Access Control (ABAC) capability with IA Node.`

<!-- SPDX-License-Identifier: Apache-2.0 AND OGL-UK-3.0 -->

❗️ **The IA Access application is for testing and demonstration only and must not be used in a production environment**.

## Introduction
Access is an application that provides a way to test and demonstrate the use of Attribute Based Access Control (ABAC) with IA Node. Controlling data access to IA Node either from an API or database is a vital security consideration and required management. Access use with IA Node provides that control to information with Secure Agents using ABAC.

## Overview
This repository contributes to the development of **secure, scalable, and interoperable data-sharing infrastructure**. It supports NDTP’s mission to enable **trusted, federated, and decentralised** data-sharing across organisations.

This repository is one of several open-source components that underpin NDTP’s **Integration Architecture (IA)**—a framework designed to allow organisations to manage and exchange data securely while maintaining control over their own information. The IA is actively deployed and tested across multiple sectors, ensuring its adaptability and alignment with real-world needs.

For a complete overview of the Integration Architecture (IA) project, please see the [Integration Architecture Documentation](https://github.com/National-Node-Net/integration-architecture-documentation).

## Prerequisites
Before using this repository, ensure you have the following dependencies installed:
- **Required Tooling:**
  - Node.js 20 (Alpine 3.20)
  - Yarn - see [here](development.md)
  - MongoDB
  - Docker (if running via docker)
  - AWS CLI – Required for managing AWS Cognito
- **Pipeline Requirements:**
  - The application uses Yarn, which is required in the CI environment.
  - Deployable via Docker Compose
- **Supported Kubernetes Versions:** N/A
- **System Requirements:**
  - Runtime: Node.js 20+ 
  - Docker
  - Database: MongoDB

## Info
The detailed information below is retained for completeness; however, to quickly set up a local IANode deployment, please refer directly to the readme.md available at  [Integration Architecture Documentation](https://github.com/National-Node-Net/)

 
## Quick Start
Follow these steps to get started quickly with this repository. For detailed installation, configuration, and deployment, refer to the relevant MD files.

### 1. Download
```sh  
git clone https://github.com/National-Node-Net/ianode-access.git
cd ianode-access
```
### 2. Build
To get started run the script to start all the required services, in your terminal run

```sh
scripts/dev-docker-setup.sh
```
This script initializes the components required for ACCESS.

## Features
- **Key functionality**
  - Implements Attribute-Based Access Control (ABAC) to enforce data security at both the API and database levels. 
  - Enables granular access control by assigning security attributes to data and verifying user permissions against them. 
  - Provides an admin interface for managing user attributes, groups, and entitlements within IA Node.
- **Key integrations**
  - Works with IA Node applications (e.g., Graph, Search) for dynamic access. 
  - Supports SCIM for external identity synchronization. 
  - Integrates with enterprise authentication systems for user management.
- **Scalability & performance**
  - Efficient group-based access management for large user bases. 
  - Supports soft deletion to prevent accidental user loss. 
  - Optimized real-time access checks for high availability.
- **Modularity**
  - Functions as a pluggable entitlement service within IA Node. 
  - Configurable SCIM-based identity management. 
  - Decouples authentication from authorization for flexible deployment.

## Testing Guide

### Running Unit Tests
Navigate to the root of the project and run `npm run test` to run the tests for the repository.

## API Documentation
Documentation detailing the relevant configuration and endpoints is provided [here](docs/api.md).

## User permission attribute management
User permission attributes determine access to data within IA Node. This
access control for both database and API is enforced in the Secure Agents using
ABAC. Security labels are applied to data at a granular level, and a user's
attributes must meet these labels to access the information.

Access provide admins the ability to configure users' attributes in line with a
handling model. It also allows admins to specify local groups which permit
extensions to attributes and access. Furthermore, attributes and groups are
retrievable across the platform. The attributes have been created with
reference to both the naming conventions of the data and the user. When using
the Access application, the user attribute name is shown; upon the platform
looking up details about a user, or as part of the authorisation process, the
API will return the data attribute label.

## Integration with other IA Node applications
When deployed with its basic functionality (SCIM_ENABLED = false), Access is simply
a user entitlements service. User management is done external to IA Node by the
enterprise and consequently we need a way to bring the user through from the IdP
to Access application to register them within the system. When a user interacts with a "data
focussed" application, such as IA Node Graph or IA Node search, the application
will call an Access application endpoint. This endpoint (/whoami) return the user's details.
Under the hood it does a little bit more, if the user doesn't exist, it creates
a skeleton user with no attributes assigned. An administrator is then required
to go in and activate the user, applying the attributes at this point.

Access can be configured to utilise the System for Cross-domain Identity
Management (SCIM) standard for managing user identity information. The goal of
SCIM is to securely automate the exchange of user identities between
applications or systems. In this implementation, an existing or external
identity provider (IdP) is responsible for user management (authentication) and
Access is responsible for user attributes (authorisation).

SCIM helps to manage this relationship and when enabled in Access, functions in
the following way:

- Users are created in an external user management system, which Access
  communicates with via SCIM to obtain a mapped representation of the SCIM users.
- Authentication is handled by the external system.
- User attributes used for authorisation are added and managed by Access.
- Soft delete support - if SCIM tries to delete a user via Access, they are
  instead deactivated and an admin can then fully delete the user in the
  external IdP if required.
- SCIM IdPs can create users, but currently have no oversight or power to
  manage attributes or access. SCIM allows for group configuration, but these
  are not taken into account when it comes to authorisation decisions. Groups
  are instead handled by Access alone.

## Public Funding Acknowledgment
This repository has been developed with public funding as part of the National Digital Twin Programme (NDTP), a UK Government initiative. NDTP, alongside its partners, has invested in this work to advance open, secure, and reusable digital twin technologies for any organisation, whether from the public or private sector, irrespective of size.

## License
This repository contains both source code and documentation, which are covered by different licenses:
- **Code:** Originally developed by Telicent UK Ltd, now maintained by National Digital Twin Programme. Licensed under the [Apache License 2.0](LICENSE.md).
- **Documentation:** Licensed under the [Open Government Licence (OGL) v3.0](OGL_LICENSE.md).

By contributing to this repository, you agree that your contributions will be licensed under these terms.

See [LICENSE.md](LICENSE.md), [OGL_LICENSE.md](OGL_LICENSE.md), and [NOTICE.md](NOTICE.md) for details.

## Security and Responsible Disclosure
We take security seriously. If you believe you have found a security vulnerability in this repository, please follow our responsible disclosure process outlined in [SECURITY.md](SECURITY.md).

## Contributing
We welcome contributions that align with the Programme’s objectives. Please read our [Contributing](CONTRIBUTING.md) guidelines before submitting pull requests.

## Acknowledgements
This repository has benefited from collaboration with various organisations. For a list of acknowledgments, see [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md).

## Support and Contact
For questions or support, check our Issues or contact the NDTP team on ndtp@businessandtrade.gov.uk.

**Maintained by the National Digital Twin Programme (NDTP).**

© Crown Copyright 2026. This work has been developed by the National Digital Twin Programme and is legally attributed to the UK's Department for Business, Innovation, Science and Trade (BIST) as the governing entity.
