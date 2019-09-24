// Set constraints for the video stream
var constraints = { video: { facingMode: "user" }, audio: false };

// var encoder = new Whammy.Video(60);

// var capturer = new CCapture({
//     framerate: 60,
//     verbose: true,
//     format: "png"
// });
// Define constants
const cameraView = document.querySelector("#camera--view"),
    cameraOutput = document.querySelector("#camera--output"),
    cameraSensor = document.querySelector("#camera--sensor"),
    cameraTrigger = document.querySelector("#camera--trigger")

cameraSensor.width = cameraView.videoWidth;
cameraSensor.height = cameraView.videoHeight;
let recorder = null;

// Access the device camera and stream to cameraView
function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            track = stream.getTracks()[0];
            cameraView.srcObject = stream;


            recorder = RecordRTC(stream, {
                type: 'video',
                recorderType: GifRecorder,
            });

            // setTimeout(function () {
            //     recorder.stopRecording(function () {
            //         console.log("STOPPED")
            //         let blob = recorder.getBlob();
            //         console.log("GOT BLOB");
            //         // console.log(blob);
            //         invokeSaveAsDialog(blob);
            //     });


            // }, 3000);

            // capturer.start();

        })
        .catch(function (error) {
            console.error("Oops. Something is broken.", error);
        });
}
// Take a picture when cameraTrigger is tapped
var shouldStart = true;

cameraTrigger.onclick = function () {
    if (shouldStart) {
        recorder.startRecording();
        shouldStart = false
        cameraTrigger.textContent = "STOP RECORDING"

    }
    else {
        recorder.stopRecording(function () {
            console.log("STOPPED")
            let blob = recorder.getBlob();
            console.log("GOT BLOB");
            // console.log(blob);
            //invokeSaveAsDialog(blob);
        });
        cameraTrigger.textContent = "START RECORDING"
        shouldStart = true
    }

    // cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    // cameraOutput.src = cameraSensor.toDataURL("image/webp");
    // capturer.capture(cameraSensor);




    // cameraOutput.classList.add("taken");

    // encoder.compile(false, function (output) {
    //     var url = (window.webkitURL || window.URL).createObjectURL(output);
    //     console.log(url);
    // });

};
// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);
