# Where to start

We are beginning with a basic webpage 

# Testing with Nightwatch

Checkout the [Nightwatch Docs](http://v09.nightwatchjs.org/gettingstarted#installation) or follow along below:

## Install nightwatch (we need the 0.9 version), selenium and chromedriver

```
$ npm install nightwatch@0.9 chromedriver selenium-server --save-dev
```

## A note about directory structure

We require a certain directory structure so we'll be putting everything inside `test/automation`.

## Setup Nightwatch and a sanity test

We'll use the following config as `nightwatch.conf.js` and put it inside `test/automation/conf`.

`test/automation/conf/nightwatch.conf.js`

```js
module.exports = {
  src_folders: ["test/automation/tests"],
  selenium: {
    start_process: true,
    server_path: require("selenium-server").path,
    host: "127.0.0.1",
    port: 4444,
    cli_args: {
      "webdriver.chrome.driver": require("chromedriver").path
    }
  },
  test_settings: {
    default: {
      desiredCapabilities: {
        browserName: "chrome"
      }
    }
  }
};
```

You might ask **"What is this all doing?"**

We're telling `nightwatch` where to find the tests to run, how to run selenium and the settings (browser, url) for selenium to run.

## Add a test

And a sample test under our `test/automation/tests/` directory. We can call this anything but for consistency, let's call it `first-test.spec.js`.

```
module.exports = {
  "Does the header exist": function(client) {
    client.url(`http://localhost:3333`);
    client.assert.elementPresent("h1");
  }
};
```

## Run `nightwatch`

At this point we have everything we need to execute our first test. Let's run:

```
$ ./node_modules/.bin/nightwatch --config=test/automation/conf/nightwatch.conf.js
```

This should open a chrome browser that opens to `http://localhost:3333`, but results in a **This site cannot be reached** message and a failing test.

This is because nothing is starting our app! So let's open a new terminal session and start our app in that (`npm start`). Once you can react it, run `nightwatch` again and we should see a passing test.

Awesome! We have our first passing test.

# Step 3 | Executing With Magellan

Next we'll add in magellan. Right now, magellan won't give us much since we have a single test running in a single browser, but once we have multiple tests and multiple browsers, the benefits of parallelization will begin to show themselves.

We'll need [`magellan`](https://github.com/TestArmada/magellan) itself as well as it's [`testarmada-magellan-local-executor`](https://github.com/TestArmada/magellan-local-executor) and, since we're using `nightwatch`, [`testarmada-magellan-nightwatch-plugin`](https://github.com/TestArmada/magellan-nightwatch-plugin) the nightwatch plugin so magellan understands how to execute nightwatch tests.

```
$ npm install testarmada-magellan testarmada-magellan-local-executor testarmada-magellan-nightwatch-plugin --save-dev
```

There are [quite a few plugins](https://github.com/TestArmada/magellan#test-framework-compatibility-and-installation) for magellan, but for now we'll keep our config file minimal.

`test/automation/magellan.json`

```
{
  "framework": "testarmada-magellan-nightwatch-plugin",
  "executors": ["testarmada-magellan-local-executor"],
  "nightwatch_config": "./test/automation/conf/nightwatch.conf.js"
}

```

With our application still running, we'll execute `magellan` and tell it to run using the `default` browser (which is Chrome for us)

```
$ ./node_modules/.bin/magellan --local_browser=default --config=test/automation/magellan.json
```

# Starting your Application with Magellan

So while spinning our app up separately works locally, it's a bit of a chore and won't work in a CI environment. To fix this we'll spin up our app programatically.

`magellan` provides hooks for us to execute arbitrary code on the `setup` and the `teardown` parts of its lifecycle by specifying [`setup_teardown`](https://github.com/TestArmada/magellan#setup-and-teardown) in our `magellan.json`.

There are of course, _many_ ways to spin up your app so this **will** vary quite a bit based on your application and you as the developer know best how to spin up your app.

**For Create React App specifically**

We want to have a static server host our app. To do that, we'll want to build our app:

```
$ npm run build
```

This will create a `/build` folder and we'll spin up a static server to host it on `localhost:3333`.

We'll use `serve`, but again this is **completely up to your application**:

```
$ npm install serve --save-dev
```

We'll add a reference to our new setup file in our `magellan.json`

```
{
  ...
  "setup_teardown": "./test/automation/setup_teardown.js"
}
```

And create our new file with `initialize` (setup) and `flush` (teardown).

`test/automation/setup_teardown.js`

```
const handler = require("serve-handler");
const http = require("http");

module.exports = class SetupTeardown {
  initialize() {
    this.server = http.createServer((request, response) =>
      handler(request, response, {
        public: "./build"
      })
    );

    return new Promise(resolve => this.server.listen(3000, resolve));
  }

  flush() {
    return new Promise(resolve => this.server.close(resolve));
  }
};
```

We can now stop our out-of-process app running and call `magellan` directly:

```
$ ./node_modules/.bin/magellan --local_browser=default --config=test/automation/magellan.json
```

# Running in Sauce Labs

Now that we have things running in a single command, let's get things running on multiple browsers via Sauce Labs.

We'll use the `testarmada-magellan-saucelabs-executor` to tell `magellan` how it should execute on Sauce Labs (this is instead of `testarmada-magellan-local-executor` to run locally).

We'll install it.

```
$ npm install testarmada-magellan-saucelabs-executor --save-dev
```

And follow the [How to use](https://github.com/TestArmada/magellan-saucelabs-executor#how-to-use) section in the docs.

Add it to our `magellan.json` file under `executors`:

```
{
   ...
  "executors": [
    "testarmada-magellan-local-executor",
    "testarmada-magellan-saucelabs-executor"
  ]
  ...
}
```

We'll also need to add a `sauce` profile to our `nightwatch.conf.js`

`test/automation/conf/nightwatch.conf.js`

```
  test_settings: {
    ...
    sauce: {
      selenium_host: "ondemand.saucelabs.com",
      selenium_port: 80,
      selenium: {
        start_process: false
      }
    }
  }
```

We can now run our tests in Sauce Labs by using the following command:

```
$ SAUCE_USERNAME=username SAUCE_ACCESS_KEY=saucekey SAUCE_CONNECT_VERSION=4.3.16 ./node_modules/.bin/magellan --config=test/automation/magellan.json --sauce_browsers chrome_latest_Windows_10_Desktop --sauce_create_tunnels
```