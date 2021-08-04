---
slug: ./
title: Overview
sidebar_position: 0
---

[Google Auth Setup](./GAuthSetup)

[GCP Datastore Setup](./GCPDatastoreSetup)  

Example app.yaml:
```
runtime: go113
env_variables:
  DATASTORE_PROJECT_ID: "PROJECT_ID"
```
DATASTORE_PROJECT_ID should be something like "opencircuits-beta" - whatever the project id for you GCP project is.

To change projects with gcloud use `gcloud init`

Add domain name to project: `gcloud --project=<your_project_id> beta app domain-mappings create <domain>`
