module.exports = {
    "Does H1 exist on the page": function(client) {
      console.log('####### TEST IS RUNNING')
      client.url(`http://localhost:3333`);
      client.assert.elementPresent("h1");
    },
    "Does true equal true": function(client) {
      console.log('####### TEST IS RUNNING')
      expect(true).to.equal(true);
    }
  }