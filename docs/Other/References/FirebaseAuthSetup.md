---
title: Firebase Auth Setup
---

In order to test with [Firebase Auth](https://firebase.google.com/docs/auth), you'll need to create and setup a Firebase
project following the instructions [here](https://firebase.google.com/docs/web/setup#create-project). Then register 
OpenCircuits as a web app in the console (see [here](https://firebase.google.com/docs/web/setup#register-app)).
From there, you should be able to get your Firebase Config which will have the following format:
```json
{
    "apiKey": "<api-key>",
    "authDomain": "<auth-domain>.firebaseapp.com",
    "projectId": "<project-id>",
    "storageBucket": "<storage-domain>.firebasestorage.app",
    "messagingSenderId": "<sender-id>",
    "appId": "<app-id>"
}
```
You'll then need to take this JSON, run it through a `JSON.stringify`, and then put it in a `.env.production.local` in 
your project's root directory under the `OC_FIREBASE_CONFIG` key. It's recommended to NOT commit this, although it's 
client-side so not a security threat if leaked.

To setup Firebase server-side, you must setup the [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup).
You then need to generate and download your private keys following the instructions 
[here](https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments).

You can store it in `src/secrets`, but DO NOT COMMIT it to the repo. You then must add the command-line flag 
`-firebase_config="<path-to-file>"` (Note the quotes). If you're using `yarn start`, you can pass it like:
`yarn start --extraFlags='-firebase_config="./secrets/firebase.json"'` (MUST USE DOUBLE QUOTES FOR `firebase_config`!)

If this is working properly, clicking "sign in with google" in the "sign-in" pop up and you should be prompted without a window that asks you to sign in with your credentials.
