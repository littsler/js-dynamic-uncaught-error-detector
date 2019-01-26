1. Make sure that **browserify** is installed

   ```
   npm i browserify -g
   ```

2. Git clone xhr project

   ```
   git clone https://github.com/naugtur/xhr
   ```

3. Install xhr project

   ```
   cd xhr
   npm i
   ```

4. Copy all files under current folder (example1) to the **xhr** folder, **index.js** file under **xhr** folder will be covered.

5. You may browserify a new **test.bundle.js**, or skip this step and use our prebuilt **test.bundle.js**.

   ```
   browserify test.js index.js -o test.bundle.js
   ```

6. Open **test.html** with browser.