module.exports = {
    src_folders: ["test/automation/tests"],
    selenium: {
      start_process: false
    },
    test_settings: {
      default: {
        screenshots: {
          enabled: false,
          path: '',
          on_failure: true,
          on_error: true
        },
        launch_url: 'http://localhost',
        selenium_port: 4444,
        selenium_host: '172.18.0.2',
        desiredCapabilities: {
          browserName: 'chrome',
          javascriptEnabled: true,
          acceptSslCerts: true
        }
      }
    }
  };