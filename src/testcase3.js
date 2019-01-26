(function(){
    $(document).ready(function () {
        document.addEventListener("click", function(){
            throw new Error("Test Error!");
        });
    });
})();
