sysearch
===
Search inside multiple MediaWiki instances
# Installation from an extension store
The extension was pushed to the **Mozilla Add On Store** and to the **Chrome Webstore**
* [Firefox](https://addons.mozilla.org/en-US/firefox/addon/sysearch/)
* [Chrome](https://chrome.google.com/webstore/detail/sysearch/amjmbmfckmkkjmjpnkcpbjdihjidgbmj)
# Manual Installation
## Firefox
The addon has to be installed every time firefox starts as it hasn't been verified and published to the mozilla store.
1. Run `make firefox` to build the addon
2. Open `about:debugging` and click on "This Firefox"
3. Click on "Load Temporary Add-on..." and select the `build/firefox/manifest.json`
4. The addon should now show up in the address bar
## Chromium based Browsers
The addon can be installed from the local build folder or downloaded from the chrome web store (future)
1. Run `make chromium` to build the plugin
2. Go to `chrome://extensions` and enable developer mode
3. Select "Open unpacked extension" and select the `build/chromium` folder
4. The extension should now show up in the address bar
