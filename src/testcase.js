$(document).ready(function () {
    sendData({d: "text"});
});

function sendData(data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/non-existing.php");
    xhr.onreadystatechange = function () {
        var json = JSON.parse(xhr.responseText);
    };
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}
