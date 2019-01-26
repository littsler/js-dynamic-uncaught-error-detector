# Dynamical Detection of Uncaught Error of JavaScript

This was the team course project of the Program Testing Analysis course of the Computer Science department in the TU Darmstadt. This work is based on [Jalangi2](https://github.com/Samsung/jalangi2) and requires [Mitmproxy](https://mitmproxy.org/). This project was aimed to dynamically detect the uncaught errors of JavaScript codes (from the Browser, not including the Node.js codes).

## Launch Mitmproxy with Jalangi analyses

1. **Note that Mitmproxy is UNAVAILABLE on Windows!** Create and activate virtualenv with Pyhton 2.7

   ```
   virtualenv venv -p python2.7
   . venv/bin/activate
   ```

2. Install Python requirements

   ```
   pip install -r requirements.txt
   ```

3. Install JS modules

   ```
   npm i
   ```

4. Launch mitmproxy

   ```
   mitmdump --quiet --anticache -s "scripts/proxy.py --inlineIID --inlineSource --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/SyncCallbackAnalysisBase.js --analysis src/AjaxSyncCallbackMap.js --analysis src/AsyncCallbackErrorCatcher.js"
   ```

5. Configure the browser, use **127.0.0.1:8080** as proxy

6. **testcase1.html/js, testcase2.html/js, testcase3.html/js** are 3 local manual examples. Open the html files with browser.

7. The call stacks of errors are shown in the Jalangi frames on the web pages.

## Instructions for Reproduction on Github Projects

The instructions for reproducing errors on 4 selected GitHub projects are separated in 4 folders:

* **example1** folder: Instructions for reproducing error from **XMLHttpRequest.send()** on **xhr** project
* **example2** folder: Instructions for reproducing error from **setTimeout()** on **better-interval** project
* **example3** folder: Instructions for reproducing error from **addEventListener()** on **sample-app-web** project
* **example4** folder: Instructions for reproducing error from **$.ajax()** on **dollar-js-ajax** project

