---
title: Running
---

---

## Frontend

To run OpenCircuits locally (after [installing](./Installation)), simply run
```bash
yarn start
```

And choose which application to run, (generally this would be `digital`)

The building process may take a few seconds but then your browser should open and any local changes you make to the code will automatically persist!

---

## Backend

While generally unnecessary unless you are working on an issue that involves backend communication, to run the backend locally - simply run
```bash
yarn build
```

And select `server`.

And then perform a
```bash
yarn start
```

And choose `server` and it should start!

:::warning

IF YOU RUN INTO `exec: "gcc": executable file not found in %PATH%` ON WINDOWS  
[CLICK HERE](https://medium.com/@yaravind/go-sqlite-on-windows-f91ef2dacfe)

:::

---

## Testing

To test OpenCircuits locally, simply run
```bash
yarn test
```
