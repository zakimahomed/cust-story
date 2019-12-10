
// Access the device camera and stream to cameraView
function cameraStart() {
    var myStorage = window.localStorage;
    var cat = localStorage.getItem('myCat');
    if (cat == null || cat == undefined || cat == "") {
        alert("NO LOCAL STORAGE")
    }
    else {
        alert(cat)
    }
    localStorage.setItem('myCat', 'Tom');

}

// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);
