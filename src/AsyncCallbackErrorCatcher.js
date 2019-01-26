(function (sandbox) {
    if (sandbox.Constants.isBrowser) {
        sandbox.Results = {};
    }
    if (sandbox.SyncCallbackMap === undefined) {
        sandbox.SyncCallbackMap = new Map();
    }
    if (sandbox.SyncFuncArgsMap === undefined) {
        sandbox.SyncFuncArgsMap = new Map();
    }

    function MyAnalysis() {
        let logs = [];
        /**
         * {
         *  base object: {
         *        synchronized function name: synchronized function object
         *               }
         * }
         * @type {Map<Object, Map<String, Object>>}
         */
        let sync_call_map = new Map();
        /**
         * {
         *  callback object: callback name
         * }
         * @type {Map<Object, String>}
         */
        let callback_object = new Map();
        /**
         * {
         *  callback object: {
         *        "base": base object
         *        "sync": associated synchronized function name
         *                    }
         * }
         * @type {Map<Object, Object>}
         */
        let callback_sync_map = new Map();
        let functionsArray = [];

        function findInvokedFuncByFuncObj(func) {
            return functionsArray.find(function (element) {
                // log("element fname: " + element.getFname() + " found?: " + (element.getFunctionObj() === func));
                return element.getFunctionObj() === func;
            });
        }

        function findInvokedFuncByLocation(loc) {
            // log("target loc: " + loc);
            return functionsArray.find(function (element) {
                return doLocationsEqual(element.getFlocation(), loc);
            });
        }

        function InvokeFunction(fiid, flocation, fname, functionObj, parentFuncObj, stackInfo, isAsyncFunc, isAsynFuncCallback) {
            this.fiid = fiid;
            this.flocation = flocation;
            this.fname = fname;
            this.functionObj = functionObj;
            this.parentFuncObj = parentFuncObj;
            this.stackInfo = stackInfo;
            this.isAsyncFunc = isAsyncFunc;
            this.isAsynFuncCallback = isAsynFuncCallback;
            this.getFiid = function () {
                return this.fiid;
            };
            this.setFiid = function (fiid) {
                this.fiid = fiid;
            };
            this.getFlocation = function () {
                return this.flocation;
            };
            this.setFlocation = function (flocation) {
                this.flocation = flocation;
            };
            this.getFname = function () {
                return this.fname;
            };
            this.setFname = function (fname) {
                this.fname = fname;
            };
            this.getFunctionObj = function () {
                return this.functionObj;
            };
            this.setFunctionObj = function (functionObj) {
                this.functionObj = functionObj;
            };
            this.getParentFuncObj = function () {
                return this.parentFuncObj;
            };
            this.setParentFuncObj = function (parentFuncObj) {
                this.parentFuncObj = parentFuncObj;
            };
            this.getStackInfo = function () {
                return this.stackInfo.slice();
            };
            this.setStackInfo = function (stackInfo) {
                this.stackInfo = stackInfo;
            };
            this.getIsAsyncFunc = function () {
                return this.isAsyncFunc;
            };
            this.setIsAsyncFunc = function (isAsyncFunc) {
                this.isAsyncFunc = isAsyncFunc;
            };
            this.getIsAsynFuncCallback = function () {
                return this.isAsynFuncCallback;
            };
            this.setIsAsynFuncCallback = function (isAsynFuncCallback) {
                this.isAsynFuncCallback = isAsynFuncCallback;
            }
        }

        function log(line) {
            if (sandbox.Results) {
                logs.push("<li>" + line + "</li>");
            } else {
                log(line);
            }
        }

        this.endExecution = function () {
            if (sandbox.Results) {
                for (let i = 0; i < logs.length; i++) {
                    sandbox.log(logs[i]);
                }
            }
        };

        this.invokeFunPre = function (iid, f, base, args, isConstructor, isMethod, functionIid, functionSid) {
            /**
             * In this function, the stack for invoked function would be stored as well as the base function that invokes it.
             * But the asynchronous callback functions info will not record here because we are not sure when and where they would be invoked.
             */
                // if (sandbox.sid === 1) {
                // log("===========================invokeFunPre===========================<br/>" + base + "." + f.name);
                // var is_sync = isSync(f.name);
            let is_sync = isSyncFunc(base, f.name);
            let logInfo;
            let info = "undefined";
            let parentFunc = args.callee.caller;
            if (parentFunc != null) {
                info = parentFunc.toString();
                // log("Callee: " + args.callee);
            }
            // log("function to execute: " + f.name + " and is invoked by " + info);
            if (is_sync) {
                logInfo = "line " + getLine(iid) + " Synchronous function " + f.name + " is called.<br/>";
            } else {
                // only the asynchronous function will be record here
                logInfo = "line " + getLine(iid) + " Asynchronous function " + f.name + " is called.<br/>";
            }
            let flocation = getLocation(iid);
            if (functionsArray.length === 0) {
                // root function
                let baseStackInfo = [logInfo];
                let functionInvoked = new InvokeFunction(iid, flocation, f.name, f, parentFunc, baseStackInfo, !is_sync, false);
                functionsArray.push(functionInvoked);
            } else {
                let baseFunction = findInvokedFuncByFuncObj(parentFunc);
                let baseStackInfo = [];
                if (baseFunction !== undefined) {
                    baseStackInfo = baseFunction.getStackInfo();
                }
                baseStackInfo.push(logInfo);
                let functionInvoked = new InvokeFunction(iid, flocation, f.name, f, parentFunc, baseStackInfo, !is_sync, false);
                functionsArray.push(functionInvoked);
            }
            // log(logInfo);
            if (!is_sync) {
                let func_map = sync_call_map.get(base) || new Map();
                func_map.set(f.name, f);
                sync_call_map.set(base, func_map);
            }
            // log(base + ", " + f.name);
            // log(sync_call_map.has(base) + ", " + sync_call_map.get(base).has(f.name));
            checkForCallbackArg(base, f.name, args);
            // }
        };

        this.functionEnter = function (iid, f, dis, args) {
            // if (sandbox.sid === 1) {
            // only take care about asynchronous callback
            if (callback_object.has(f)) {
                // log("===========================functionEnter===========================");
                let logInfo;
                let fName = callback_object.get(f);
                let parentFunc;
                logInfo = "line " + getLine(iid) + " Asynchronous function callback " + fName + " is called.<br/>";
                // log(logInfo);
                let syncFuncName = callback_sync_map.get(f).sync;
                let base = callback_sync_map.get(f).base;
                let parentFuncObj = getSyncFuncByBaseAndName(base, syncFuncName);
                // sync_call_map.forEach(function (value, key, map) {
                //     value.forEach(function (value2, key2, map2) {
                //         log(key + ": {" + key2 + ": " + value2 + "}");
                //     })
                // });
                // log("parentFuncObj: " + parentFuncObj);
                parentFunc = findInvokedFuncByFuncObj(parentFuncObj);
                // log("parentFunc: " + parentFunc);
                let baseStackInfo = parentFunc.getStackInfo();
                baseStackInfo.push(logInfo);
                // log("basestackinfo: " + baseStackInfo + ", syncFuncName: " + syncFuncName + ", base: " + base);
                let functionInvoked = undefined;
                let _doFuncAlreadyExist = findInvokedFuncByLocation(getLocation(iid)) !== undefined;
                if (!_doFuncAlreadyExist && parentFunc !== undefined) {
                    functionInvoked = new InvokeFunction(iid, getLocation(iid), fName, f, parentFuncObj, baseStackInfo, false, true);
                    functionsArray.push(functionInvoked);
                }
            }
            // }
        };
        this.functionExit = function (iid, returnVal, wrappedExceptionVal) {
            // var sid = getSid(iid);
            // if (sandbox.sid === 1) {
            if (wrappedExceptionVal !== undefined) {
                log("===========================functionExit===========================");
                let flocation = getLocation(iid);
                // log("current exit function location is : " + flocation);
                let functionInvoked = findInvokedFuncByLocation(flocation);
                if (functionInvoked !== undefined) {
                    log(stringifyCallstack(functionInvoked.getStackInfo()) + "line " + wrappedExceptionVal.exception.lineNumber + " Occurrence of error: " + wrappedExceptionVal.exception.toString());
                }
            }
            // }
        };
        this.putField = function (iid, base, offset, val, isComputed, isOpAssign) {
            if (sandbox.sid === 1) {
                // log("===========================putField===========================");
                if (base !== null && val instanceof Function) {
                    checkForCallbackAssignment(base, offset, val);
                }
            }
        };

        function getLocation(iid) {
            iid = sandbox.getGlobalIID(iid);
            return sandbox.iidToLocation(iid);
        }

        function getSyncFuncByBaseAndName(base, name) {
            // log("search invoked: base: " + base + ", func: " + name);
            if (sync_call_map.has(base)) {
                // log("sync_call_map contains " + base);
                if (sync_call_map.get(base).has(name)) {
                    return sync_call_map.get(base).get(name);
                }
            }
            return undefined;
        }

        function isSyncFunc(base, name) {
            // log("check: " + base + name);
            for (let [key, value] of sandbox.SyncCallbackMap.entries()) {
                // log("check type " + key);
                if (base instanceof key) {
                    // log("found base type: " + key);
                    for (let callback in value) {
                        if (value.hasOwnProperty(callback)) {
                            // log("check callback " + callback);
                            if (value[callback] === name) {
                                return false;
                            }
                        }
                    }
                }
            }
            for (let [key, value] of sandbox.SyncFuncArgsMap.entries()) {
                if (base instanceof key) {
                    if (value.has(name)) {
                        return false;
                    }
                }
            }
            // log("not found");
            return true;
        }

        function checkForCallbackAssignment(base, offset, f) {
            if (callback_object.has(f)) {
                return;
            }
            for (let [key, value] of sandbox.SyncCallbackMap.entries()) {
                if (base instanceof key) {
                    // log(base + " instanceof " + key + ", value[" + offset + "]: " + value[offset]);
                    let syncFuncName = value[offset];
                    if (syncFuncName !== undefined) {
                        // log("callback assignment found with " + base + "." + offset + " for " + syncFuncName);
                        callback_sync_map.set(f, {
                            base: base,
                            sync: syncFuncName
                        });
                        callback_object.set(f, offset);
                        return;
                    }
                }
            }
        }

        function checkForCallbackArg(base, syncFuncName, args) {
            for (let [key, value] of sandbox.SyncFuncArgsMap.entries()) {
                if (base instanceof key && value.has(syncFuncName)) {
                    // if (value.has(syncFuncName)) {
                    // log("callback arg " + base + "." + syncFuncName);
                    let argArray = value.get(syncFuncName);
                    for (let i = 0; i < argArray.length; ++i) {
                        if (args[argArray[i]] instanceof Function) {
                            // log("callback arg in position " + argArray[i] + " found for " + base + "." + syncFuncName);
                            if (!callback_object.has(args[argArray[i]])) {
                                callback_sync_map.set(args[argArray[i]], {
                                    base: base,
                                    sync: syncFuncName
                                });
                                callback_object.set(args[argArray[i]], "[Anonymous] of " + syncFuncName);
                            }
                            return;
                        } else if (args[argArray[i]] instanceof Object) {
                            for (let k in args[argArray[i]]) {
                                if (args[argArray[i]].hasOwnProperty(k) && args[argArray[i]][k] instanceof Function) {
                                    // log("callback arg with key " + k + " found for " + base + "." + syncFuncName);
                                    if (!callback_object.has(args[argArray[i]][k])) {
                                        callback_sync_map.set(args[argArray[i]][k], {
                                            base: base,
                                            sync: syncFuncName
                                        });
                                        callback_object.set(args[argArray[i]][k], k);
                                    }
                                }
                            }
                            return;
                        }
                    }
                }
            }
        }

        function getLine(iid) {
            // iid = sandbox.getGlobalIID(iid);
            let location = sandbox.smap[sandbox.sid][iid];
            return location[0];
        }

        function doLocationsEqual(loc_a, loc_b) {
            if (loc_a.startsWith("<a")) {
                loc_a = extractLocation(loc_a);
            }
            if (loc_b.startsWith("<a")) {
                loc_b = extractLocation(loc_b);
            }
            // log("compare locations: " + loc_a + " === " + loc_b + ": " + (loc_a === loc_b));
            return loc_a === loc_b
        }

        function extractLocation(loc_in_tag) {
            let start = loc_in_tag.indexOf(">");
            return loc_in_tag.substring(start + 1, loc_in_tag.length - 4);
        }

        function stringifyCallstack(stack) {
            let str = "";
            for (let i = 0; i < stack.length; i++) {
                str += stack[i];
            }
            return str;
        }
    }

    sandbox.analysis = new MyAnalysis();
})(J$);

/*
mitmdump --quiet --anticache -s "scripts/proxy.py --inlineIID --inlineSource --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/SyncCallbackAnalysisBase.js --analysis src/AjaxSyncCallbackMap.js --analysis src/AsyncCallbackErrorCatcher.js"
 */
