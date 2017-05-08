# gas-api-run  [![Build Status][travis-image]][travis-url]

[![Greenkeeper badge](https://badges.greenkeeper.io/fossamagna/gas-api-run.svg)](https://greenkeeper.io/)

> Google Apps Script Execution API Javascript client

## Installation

First, install gas-api-run using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install gas-api-run --save
```

## Usage

app.js:
```js
import Client from 'gas-api-run'
const config = {
  clientId: "<YOUR_CLIENT_ID>",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  scriptId: "<YOUR_SCRIPT_ID_FOR_DEVELOPMENT>"
};
const client = new Client(config);
global.init = client.init.bind(client);
```

index.hml
```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Google Apps Script Execution API Javascript client library Example</title>
  </head>
  <body>
    <div>
      ....
    </div>
    <script src="app.js"></script>
    <script src="https://apis.google.com/js/client.js?onload=init"></script>
  </body>
</html>
```

## License

Apache 2.0 License

This module is based on JavaScript Quickstart [sample code](https://developers.google.com/apps-script/guides/rest/quickstart/js) of Google Apps Script and according to terms described in the Apache 2.0 License.

[travis-image]: https://travis-ci.org/fossamagna/gas-api-run.svg?branch=master
[travis-url]: ps://travis-ci.org/fossamagna/gas-api-run
