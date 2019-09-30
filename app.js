var BASE64_MARKER = ';base64,'

function convertDataURIToBinary(dataURI) {
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length
    var base64 = dataURI.substring(base64Index)
    var raw = window.atob(base64)
    var rawLength = raw.length
    var array = new Uint8Array(new ArrayBuffer(rawLength))

    for (i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i)
    }
    return array
}

// Set constraints for the video stream
var constraints = { video: { facingMode: "user" }, audio: true }
//stream from getUserMedia() 
var rec = null
//Recorder.js object 
var input = null
//MediaStreamAudioSourceNode we'll be recording 

//shim for AudioContext when it's not available
var AudioContext = window.AudioContext || window.webkitAudioContext
var audioContext = new AudioContext

// Define constants
let cameraView = document.querySelector("#camera--view")
let cameraOutput = document.querySelector("#camera--output")
let cameraSensor = document.querySelector("#camera--sensor")
let cameraTrigger = document.querySelector("#camera--trigger")



// Access the device camera and stream to cameraView
function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            // track = stream.getTracks()[0]
            cameraView.srcObject = stream
            gumStream = stream
            input = audioContext.createMediaStreamSource(stream)
            rec = new Recorder(input, { numChannels: 1 })

        })
        .catch(function (error) {
            console.error("MediaDevices failed with: ", error);
        });
}
// Take a picture when cameraTrigger is tapped
var isRecording = false;
var images = []
var intervalId = null
var videoURL = null
var videoBlob = null
let fps = 24
cameraTrigger.onclick = function () {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    // cameraOutput.src = x
    // cameraOutput.classList.add("taken");

    if (videoURL != null) {
        console.log("CLICKED")
        playback.src = videoURL

        var sourceElement = document.createElement('source')

        playback.appendChild(sourceElement)

        sourceElement.src = videoURL
        sourceElement.type = 'audio/wav' // or whatever


        playback.load()
        playback.onloadedmetadata = (e) => {
            console.log("METADATA LOADED")
            playback.play().then(function (test) {
                console.log(test)
            }).catch(function (error) {
                console.error("PLAY failed with: ", error);
            })
        };


        playback.onended = (e) => {
            console.log("ONENDED")
            // clearInterval(playbackInterval)
        }
        playback.ontimeupdate = (event) => {

            console.log("ontimeupdate")
            // console.log(event.target.currentTime)
            //   console.log('The currentTime attribute has been updated. Again.');
        };
        // let playback = document.querySelector("#playback")
        // playback.pause()

        // let playbackInterval = setInterval(function () {
        //     // console.log("interval")
        //     // console.log()

        //     var img = new Image

        //     img.onload = function () {
        //         var ctx = cameraSensor.getContext("2d")
        //         ctx.drawImage(img, 0, 0); // Or at whatever offset you like
        //     };
        //     let currentTimeStamp = playback.currentTime * 1000
        //     console.log(currentTimeStamp)
        //     var foundImage = null
        //     let i = 0;
        //     do {
        //         let image = images[i]
        //         if (currentTimeStamp >= image.startTimeStamp && currentTimeStamp <= image.endTimeStamp) {
        //             foundImage = image
        //         }
        //         i++;
        //     }
        //     while (foundImage == null && i < images.length)
        //     if (foundImage) {
        //         img.src = foundImage.image;
        //     }
        //     // cameraSensor.getContext("2d").drawImage(images[0].image, 0, 0);



        // }, 1000 / fps)
        // playback.onclick = function (e) {


        // }
        // videoURL = null
        // isRecording = false
        cameraTrigger.textContent = "Playing... NEW RECORDING"

    }

    else if (isRecording) {

        if (intervalId != null) {
            rec.stop()
            gumStream.getAudioTracks()[0].stop()

            clearInterval(intervalId)
        }

        isRecording = false
        // var frames = []

        // for (let i = 0; i < images.length; i++) {
        //     frames.push({ data: images[i], name: 'input_' + String(i) + '.jpeg' })
        // }
        // console.log(images)
        // images = []



        rec.exportWAV(function (audioBlob) {
            let audioURL = URL.createObjectURL(audioBlob);
            console.log(audioBlob)
            console.log(audioURL)

            videoBlob = audioBlob
            videoURL = audioURL
            var a = document.createElement('a');
            a.download = "test.wav"; // Set the file name.
            a.style.display = 'none';
            a.href = videoURL
            document.body.appendChild(a);
            a.click();
            cameraView.style.visibility = "hidden";
            cameraTrigger.textContent = "PLAY RECORDING"






        })

    }
    else {
        rec.record()

        cameraView.style.visibility = "visible";

        isRecording = true
        cameraTrigger.textContent = "STOP RECORDING"

        let startDate = Date.now()
        var previousTimeStamp = null
        intervalId = setInterval(function () {
            cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
            let x = cameraSensor.toDataURL("image/jpeg");

            let endTimeStamp = Date.now() - startDate

            var startTimeStamp = previousTimeStamp

            if (startTimeStamp == null) {
                startTimeStamp = 0
            }

            previousTimeStamp = endTimeStamp

            images.push({ image: x, startTimeStamp: startTimeStamp, endTimeStamp: endTimeStamp })




        }, 1000 / fps)

    }



}


// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);
