(function (sandbox) {
    if (sandbox.SyncCallbackMap === undefined) {
        sandbox.SyncCallbackMap = new Map();
    }
    if (sandbox.SyncFuncArgsMap === undefined) {
        sandbox.SyncFuncArgsMap = new Map();
    }

    function MyAnalysis() {
        let ajaxFuncArgsMap = sandbox.SyncFuncArgsMap.get(Function) || new Map();
        ajaxFuncArgsMap.set("ajax", [0]);
        ajaxFuncArgsMap.set("ajaxSetup", [0]);
        ajaxFuncArgsMap.set("get", [1, 2]);
        ajaxFuncArgsMap.set("getJSON", [1, 2]);
        ajaxFuncArgsMap.set("getScript", [1]);
        ajaxFuncArgsMap.set("ajaxStart", [0]);
        ajaxFuncArgsMap.set("ajaxStop", [0]);
        ajaxFuncArgsMap.set("ajaxSuccess", [0]);
        ajaxFuncArgsMap.set("ajaxSend", [0]);
        ajaxFuncArgsMap.set("ajaxComplete", [0]);
        ajaxFuncArgsMap.set("ajaxError", [0]);
        ajaxFuncArgsMap.set("load", [1, 2]);
        sandbox.SyncFuncArgsMap.set(Function, ajaxFuncArgsMap);
    }

    sandbox.analysis = new MyAnalysis();
})(J$);
