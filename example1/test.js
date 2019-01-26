$(document).ready(function () {
    var xhr = require("./index");
    xhr({
        method: "get",
        uri: "nonexisting.html",
        headers: {
            "Content-Type": "application/json"
        }
    }, function (err, resp, body) {
    })
});
