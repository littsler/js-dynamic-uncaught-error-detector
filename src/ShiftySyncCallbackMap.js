let Tweenable = require("shifty");

(
    function (sandbox) {
    if (sandbox.SyncCallbackMap === undefined) {
        sandbox.SyncCallbackMap = new Map();
    }
    if (sandbox.SyncFuncArgsMap === undefined) {
        sandbox.SyncFuncArgsMap = new Map();
    }

    function MyAnalysis() {
        let shiftyArgsMap = sandbox.SyncFuncArgsMap.get(Tweenable) || new Map();
        shiftyArgsMap.set("tween", [0]);
        sandbox.SyncFuncArgsMap.set(Tweenable, shiftyArgsMap);
    }

    sandbox.analysis = new MyAnalysis();
})(J$);
