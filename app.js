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


var audioTrack = null;

// Access the device camera and stream to cameraView
function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            // track = stream.getTracks()[0]
            cameraView.srcObject = stream
            audioTrack = new WebAudioTrack()
            // audioTrack.appendAudioFromTrack(x)
            // gumStream = stream
            // input = audioContext.createMediaStreamSource(stream)
            // rec = new Recorder(input, { numChannels: 1 })

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


    if (videoURL != null) {
        console.log("CLICKED")

        let playback = document.querySelector("#playback")

        playback.src = videoURL
        playback.load()
        let ctx = cameraSensor.getContext("2d")


        var x = 0
        var imgTags = []

        var doneImages = 0
        var isDone = false 
        for (var x = 0; x < images.length; x++) {
            var img = new Image
            imgTags.push(img)
            imgTags[x]
            imgTags[x].onload = function () {
                doneImages += 1
                if (doneImages >= images.length) {
                    isDone = true 
                    console.log("ACTUAL DONE")

                    let playbackInterval = setInterval(function () {
            
            
            
            
            
                        let currentTimeStamp = playback.currentTime * 1000
                        // console.log(currentTimeStamp)
            
                        var foundImage = null
                        var i = 0;
                        do {
            
                            let image = images[i]
                            if (currentTimeStamp >= image.startTimeStamp && currentTimeStamp <= image.endTimeStamp) {
                                foundImage = imgTags[i]
                            }
                            i++;
                        }
                        while (foundImage == null && i < images.length)
                        if (foundImage) {
            
                            ctx.drawImage(foundImage, 0, 0); // Or at whatever offset you like
            
                        }
                        // cameraSensor.getContext("2d").drawImage(images[0].image, 0, 0);
            
            
            
                    }, 1000 / fps)
            
                    playback.onended = (e) => {
                        console.log("ONENDED")
                        clearInterval(playbackInterval)
                    }
            
                    playback.play().then(function (test) {
                        console.log(test)
                        console.log("PLAY CALLED")
                    }).catch(function (error) {
                        console.error("PLAY failed with: ", error);
                    })
            
                    cameraTrigger.textContent = "Playing... NEW RECORDING"
                }
            }
            imgTags[x].src = images[x].image
        }








    }

    else if (isRecording) {



        isRecording = false
        // var frames = []

        // for (let i = 0; i < images.length; i++) {
        //     frames.push({ data: images[i], name: 'input_' + String(i) + '.jpeg' })
        // }
        // console.log(images)
        // images = []




        audioTrack.stopRecording(function (e) {
            if (intervalId != null) {
                // rec.stop()
                // gumStream.getAudioTracks()[0].stop()

                clearInterval(intervalId)
            }
            cameraView.muted = true
            console.log(e)

            videoURL = audioTrack.getBlobSrc()


            // var a = document.createElement('a');
            // a.download = "test.wav"; // Set the file name.
            // a.style.display = 'none';
            // a.href = videoURL
            // document.body.appendChild(a);
            // a.click();
            cameraView.style.visibility = "hidden";
            cameraTrigger.textContent = "PLAY RECORDING"


        })



        // })

    }
    else {
        // rec.record()
        cameraView.style.visibility = "visible";

        isRecording = true
        cameraTrigger.textContent = "STOP RECORDING"


        var startTime = audioTrack.context.currentTime * 1000

        console.log("StartRecording")
        let startDate = Date.now()

        var previousTimeStamp = null
        // var previousAudioTrackTimeStamp = null
        let ctx = cameraSensor.getContext("2d")

        intervalId = setInterval(function () {

            let end = audioTrack.context.currentTime * 1000

            let endTimeStamp = Date.now() - startDate
            ctx.drawImage(cameraView, 0, 0);
            let x = cameraSensor.toDataURL("image/jpeg");


            var startTimeStamp = previousTimeStamp

            if (startTimeStamp == null) {
                startTimeStamp = 0
            }


            previousTimeStamp = endTimeStamp
            // console.log(time)
            // console.log(end)
            images.push({ image: x, startTimeStamp: startTime, endTimeStamp: end })
            startTime = end




        }, 10)
        audioTrack.startRecording(function (e) {



        })


    }



}


// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);
