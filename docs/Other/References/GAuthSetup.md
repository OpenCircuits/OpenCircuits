---
title: GAuth Setup
---

In order to test with google, you'll need to create a web app with the sign-in API (https://developers.google.com/identity/sign-in/web/sign-in click). Choose "New Project", give it a name,  give it a product name, and choose "Web browser".  For the "Authorized JavaScript Origins", enter: `http://localhost:8080`.  Click "Create..." and this will give you a client ID and secret.  Save these somewhere in the following format and DO NOT commit them to the repo.
```
{
    "id": "<client-id>.apps.googleusercontent.com",
    "secret": "<secret>",
    "redirectURL": "http://127.0.0.1:8080/auth/google"
}
```

To enable google sign-in, you must add the command-line flag `-google_auth=<path-to-file>`.

If this is working properly, clicking "sign in with google" in the "sign-in" pop up and you should be prompted without a window that asks you to sign in with your credentials.
