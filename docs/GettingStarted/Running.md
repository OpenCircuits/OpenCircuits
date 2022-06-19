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

To view the coverage of all tests, run
```bash
yarn coverage
```

---

## Documentation

To run this documentation site locally, simply run
```bash
yarn docs
```

If you get the error `TypeError: Cannot read property 'latest' of undefined` then run the command again.

To generate the documentation from jsdocs, run
```bash
yarn build:jsdocs
```
You can even run that command while `yarn docs` is open in another window!

---

## Linting

To lint locally, simply run
```bash
yarn lint
```

Convenientally, eslint supports automatically fixing some issues. To do this, run
```bash
yarn lint:fix
```
