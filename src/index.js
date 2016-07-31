/* global gapi */

const MAX_RETRY_COUNT = 5;

export default class Client {
  constructor(options) {
    this.clientId = options.clientId;
    this.scopes = options.scopes;
    this.scriptId = options.scriptId;
    this.initDone = false;
    this.retryCount = 0;
    this.maxRetryCount = options.maxRetryCount != null ? options.maxRetryCount : MAX_RETRY_COUNT;
  }

  getToken() {
    if (this.initDone) {
      return Promise.resolve(gapi.auth.getToken());
    }
    const self = this;
    const timeout = 500;
    const timeoutHandler = (resolve, reject) => {
      return () => {
        if (self.initDone) {
          resolve(gapi.auth.getToken());
        } else {
          if (self.retryCount < self.maxRetryCount) {
            self.retryCount++;
            setTimeout(timeoutHandler(resolve, reject), timeout * (self.retryCount + 1));
          } else {
            self.retryCount = 0;
            reject();
          }
        }
      };
    };
    return new Promise((resolve, reject) => {
      setTimeout(timeoutHandler(resolve, reject), timeout * (self.retryCount + 1));
    });
  }

  run(name, ...args) {
    this.retryCount = 0;
    return this.getToken()
    .then(token => {
      if (token && token.expires_at - new Date().getTime() / 1000 >= 60) {
        return this.callScriptFunction(name, args);
      } else {
        return new Promise((resolve, reject) => {
          this.checkAuth(Boolean(token), authResult => {
            if (authResult && !authResult.error) {
              this.callScriptFunction(name, args)
              .then(result => {
                resolve(result);
              })
              .catch(err => {
                reject(err);
              });
            } else {
              reject(authResult.error);
            }
          });
        });
      }
    });
  }

  callScriptFunction(name, args) {
    const scriptId = this.scriptId;

    const request = {
      function: name,
      parameters: args,
      devMode: true
    };

    // Make the API request.
    const op = gapi.client.request({
      root: 'https://script.googleapis.com',
      path: `v1/scripts/${scriptId}:run`,
      method: 'POST',
      body: request
    });

    return new Promise((resolve, reject) => {
      op.execute(resp => {
        if (resp.error) {
          reject(JSON.stringify(resp, null, 2));
        } else {
          resolve(resp.response.result);
        }
      });
    });
  }

  checkAuth(immediate, handleAuthResult) {
    const promise = new Promise((resolve, reject) => {
      gapi.auth.authorize(
        /* eslint-disable camelcase */
        {client_id: this.clientId, scope: this.scopes, immediate: immediate},
        /* eslint-enable camelcase */
        authResult => {
          if (authResult && !authResult.error) {
            reject(authResult);
          } else {
            resolve(authResult);
          }
        });
    });
    if (!(typeof handleAuthResult === 'function')) {
      return promise;
    }
    promise
    .then(handleAuthResult).catch(handleAuthResult);
  }

  init() {
    gapi.auth.authorize(
      /* eslint-disable camelcase */
      {
        client_id: this.clientId,
        scope: this.scopes.join(' '),
        immediate: true
      },
      /* eslint-enable camelcase */
      () => {
        this.initDone = true;
        this.retryCount = 0;
      });
  }
}
