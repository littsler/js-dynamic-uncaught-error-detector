// var fs = require("fs");

function test() {
    wrapper();
}

function wrapper() {
    wait_a_second();
}

function wait_a_second() {
    setTimeout(function () {
        var an_obj = {func: "not a function"};
        an_obj.func();
    }, 1000);
}

$(document).ready(function () {
    test();
});
