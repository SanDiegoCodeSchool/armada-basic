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