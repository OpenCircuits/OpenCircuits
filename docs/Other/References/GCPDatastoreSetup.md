---
title: GCP Datastore Setup
---

To emulate the datastore instance, you must create a GCP project and add a "Firestore" in "datastore mode".  

You can set up the emulator like [This](https://cloud.google.com/datastore/docs/tools/datastore-emulator).  This requires you install the gcloud tools.

When you run the emulator, it will show you a string with the host name, which is the `ds_emu_host` parameter, and you will need to configure the emulator with your project id, which is the `ds_emu_project_id`.  Note that this project id is NOT the same as the project name.  It will have the project name in it, along with a bunch of numbers.
