const handler = require("serve-handler");
const http = require("http");

module.exports = class SetupTeardown {
  initialize() {
    this.server = http.createServer((request, response) =>
      handler(request, response, {
        public: "./public"
      })
    );

    return new Promise(resolve => this.server.listen(3333, resolve));
  }

  flush() {
    return new Promise(resolve => this.server.close(resolve));
  }
};