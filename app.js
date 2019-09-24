var BASE64_MARKER = ';base64,';

function convertDataURIToBinary(dataURI) {
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}

// Set constraints for the video stream
var constraints = { video: { facingMode: "user" }, audio: false };

// var encoder = new Whammy.Video(60);

// var capturer = new CCapture({
//     framerate: 60,
//     verbose: true,
//     format: "png"
// });
// Define constants
var cameraView = document.querySelector("#camera--view"),
    cameraOutput = document.querySelector("#camera--output"),
    cameraSensor = document.querySelector("#camera--sensor"),
    cameraTrigger = document.querySelector("#camera--trigger")

let recorder = null;

// Access the device camera and stream to cameraView
function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            track = stream.getTracks()[0];
            cameraView.srcObject = stream;


            // recorder = RecordRTC(stream, {
            //     type: 'video',
            //     recorderType: WhammyRecorder,
            // });

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
var images = []
var intervalId = null
cameraTrigger.onclick = function () {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    // cameraOutput.src = x
    // cameraOutput.classList.add("taken");

    if (shouldStart) {
        cameraView.style.visibility = "visible";

        shouldStart = false
        cameraTrigger.textContent = "STOP RECORDING"
        intervalId = setInterval(function () {
            cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
            let x = cameraSensor.toDataURL("image/jpeg");
            images.push(convertDataURIToBinary(x))

        }, 24)

    }
    else {

        if (intervalId != null) {
            clearInterval(intervalId)
        }

        cameraTrigger.textContent = "START RECORDING"
        shouldStart = true
        var frames = []

        for (let i = 0; i < images.length; i++) {
            frames.push({ data: images[i], name: 'input_' + String(i) + '.jpeg' })
        }
        images = []
        // '-s', '1920x1080',
        var converted_files = ffmpeg_run({
            arguments: [
                '-r', '24',
                '-i', 'input_%d.jpeg',
                '-v', 'verbose',
                '-nostdin',

                'output.mp4'
            ],
            files: frames,
            type: "command",

            TOTAL_MEMORY: 268435456
        });


        let file = converted_files[0].data;
        var data = new Blob([file], { type: 'video/mp4' });

        var value = URL.createObjectURL(data);

        cameraView.style.visibility = "hidden";

        let playback = document.querySelector("#playback")
        playback.pause();
        // cameraView.setAttribute('src', value);
        playback.src = value
        playback.load();
        //videocontainer.setAttribute('poster', newposter); //Changes video poster image
        playback.play();


        // let url = window.URL.createObjectURL(file);
        console.log(file);
        console.log(data);
        console.log(value);
        // window.location.assign(value);

        // let a = document.createElement('a');
        // a.href = value;
        // a.download = 'abc.mp4';

        // document.body.appendChild(a);
        // a.click();
        // window.URL.revokeObjectURL(a.href);
        // document.body.removeChild(a);






    }
}
// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);
