module.exports = {
    "Does H1 exist on the page": function(client) {
      client.url(`http://localhost:3333`);
      client.assert.elementPresent("h1");
    }
  }