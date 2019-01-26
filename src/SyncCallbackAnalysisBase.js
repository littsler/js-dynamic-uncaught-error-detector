(function (sandbox) {
    if (sandbox.SyncCallbackMap === undefined) {
        /**
         * {
         *  Type: {
         *          name of callback: name of synchronized function
         *        }
         * }
         * @type {Map}
         */
        sandbox.SyncCallbackMap = new Map();
    }
    if (sandbox.SyncFuncArgsMap === undefined) {
        /**
         * {
         *  Type: {
         *          name of synchronized function: [positions of function arguments]
         *        }
         * }
         * @type {Map}
         */
        sandbox.SyncFuncArgsMap = new Map();
    }

    function MyAnalysis() {
        let xhrCallbackMap = {};
        xhrCallbackMap.onreadystatechange = "send";
        sandbox.SyncCallbackMap.set(XMLHttpRequest, xhrCallbackMap);
        let windowFuncArgsMap = new Map();
        windowFuncArgsMap.set("setTimeout", [0]);
        windowFuncArgsMap.set("setInterval", [0]);
        windowFuncArgsMap.set("setImmediate", [0]);
        windowFuncArgsMap.set("addEventListener", [0, 1]);
        windowFuncArgsMap.set("on", [1]);
        sandbox.SyncFuncArgsMap.set(Window, windowFuncArgsMap);
        let elementFuncArgsMap = new Map();
        elementFuncArgsMap.set("addEventListener", [0, 1]);
        elementFuncArgsMap.set("on", [1]);
        sandbox.SyncFuncArgsMap.set(Element, elementFuncArgsMap);
        let documentFuncArgsMap = new Map();
        documentFuncArgsMap.set("addEventListener", [0, 1]);
        documentFuncArgsMap.set("on", [1]);
        sandbox.SyncFuncArgsMap.set(Document, documentFuncArgsMap);
        let objectFuncArgsMap = new Map();
        objectFuncArgsMap.set("on", [1]);
        sandbox.SyncFuncArgsMap.set(Object, objectFuncArgsMap);
    }

    sandbox.analysis = new MyAnalysis();
})(J$);
