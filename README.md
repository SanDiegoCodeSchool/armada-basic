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

We have a static server host our app, a simple web page, and some setup files. Let's start by installing our dependencies.

```
$ npm i
```

We'll start our server and it will be available at `http://localhost:3333` from a browser using:

```
$ node .
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
        public: "./public"
      })
    );

    return new Promise(resolve => this.server.listen(3333, resolve));
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

# Running a local Selenium grid on Docker

## Start the Selenium Grid

```
$ docker-compose up
```

You will see the logs in a window. It is safe to leave that terminal window and open another terminal to continue to working (you will be able to monitor the logs on the other terminal window).

From a new terminal view the address of the nodes:

```
$ docker ps -a
```

## View Servers using VNC

You may want to observe the tests running using VNC viewer.

1. Download [VNC viewer](https://www.realvnc.com/en/connect/download/viewer/) so you can see the tests in action. 
1. Run it.
1. Type the hub URL and the port number of each debug mode from the `docker ps` output and click on the connect button.
1. The password is `secret`.



# Running tests on a Selenium Grid with Magellan

We are going to use the [Magellan-SeleniumGrid-Executor](https://github.com/TestArmada/magellan-seleniumgrid-executor) to allow nightwatch to talk to our Selenium grid hub by forking it as a magellan child process.

**NOTE: Make sure you have Magellan version 10.0.5 or greater installed**.

Check the package.json and ensure magellan is higher than 10.0.5.

## How To Use the Selenium-Grid Executor
Please follow the steps

 1. `npm install testarmada-magellan-seleniumgrid-executor --save`
 2. add following block to your `magellan.json` (if there isn't a `magellan.json` please create one under your folder root)
 ```javascript
 "executors": [
    "testarmada-magellan-seleniumgrid-executor"
 ]
 ```
 3. `./node_modules/.bin/magellan --config=./test/automation/conf/magellan.json --help` to see if you can see the following content printed out
 ```
 Executor-specific (testarmada-magellan-seleniumgrid-executor)
   --seleniumgrid_browser=chrome        Run tests in chrome, firefox, etc.
   --seleniumgrid_browsers=b1,b2,..     Run multiple browsers in parallel.
   --seleniumgrid_host=localhost        Host for selenium grid (exclusive with seleniumgrid_url).
   --seleniumgrid_port=4444             Port for selenium grid (exclusive with seleniumgrid_url).
   --seleniumgrid_url=http://localhost:4URL for selenium grid (exclusive with seleniumgrid_host and seleniumgrid_port).
   --seleniumgrid_list_browsers         List the available browsers configured.
 ```
Congratulations, you're all set. Run test on seleniumgrid with chrome

```console
$ ./node_modules/.bin/magellan --config=./test/automation/conf/magellan.json --seleniumgrid_browser chrome --seleniumgrid_host http://172.17.0.2:4444/wd/hub --seleniumgrid_port 4444 
```
