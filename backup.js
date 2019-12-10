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
        let playback = document.querySelector("#playback")
        playback.pause()

        // playback.onclick = function (e) {
        console.log("CLICKED")
        playback.src = videoURL
        playback.load()
        playback.play()
        // }
        videoURL = null
        isRecording = false
        cameraTrigger.textContent = "Playing... NEW RECORDING"

    }

    else if (isRecording) {

        if (intervalId != null) {
            rec.stop()
            gumStream.getAudioTracks()[0].stop()

            clearInterval(intervalId)
        }

        isRecording = false
        var frames = []

        for (let i = 0; i < images.length; i++) {
            frames.push({ data: images[i], name: 'input_' + String(i) + '.jpeg' })
        }
        images = []



        rec.exportWAV(function (audioBlob) {
            // let audioURL = URL.createObjectURL(audioBlob);
            // console.log("AUDIO URL")
            // console.log(audioBlob)
            // console.log(audioURL)
            // '-s', '1920x1080',
            // let imageToVideo = ffmpeg_run({
            //     arguments: [
            //         '-r', '24',
            //         '-i', 'input_%d.jpeg',
            //         '-v', 'verbose',
            //         '-nostdin',

            //         'output.mp4'
            //     ],
            //     files: frames,
            //     type: "command",

            //     TOTAL_MEMORY: 268435456
            // });
            // console.log(imageToVideo)

            var reader = new FileReader()
            reader.readAsArrayBuffer(audioBlob)
            reader.onloadend = (event) => {
                // console.log(event)
                // console.log(reader)
                // console.log(reader.result)
                // var audioBlob = new Blob([reader.result], { type: 'audio/wav' });
                // let url = URL.createObjectURL(audioBlob);
                // var link = document.createElement('a');


                // link.href = url;
                // link.download = new Date().toISOString() + '.wav';
                // link.innerHTML = link.download;

                // document.body.appendChild(link);
                // link.click();
                // console.log(imageToVideo[0].data)
                // let attachments = [
                //     { data: imageToVideo[0].data, name: 'video_sans_audio.mp4' },

                frames.push({ data: new Uint8Array(reader.result), name: 'audio.wav' })
                // ]
                // '-map', '0:0',
                // '-map', '1:0',
                // '-c:v', 'copy',
                // '-c:a', 'copy',


                let combineAudioAndVideo = ffmpeg_run({
                    arguments: [
                        '-r', `${fps}`,
                        '-i', 'input_%d.jpeg',
                        '-i', 'audio.wav',
                        '-v', 'verbose',

                        '-nostdin',
                        '-strict', '-2',
                        'output.mp4'
                    ],
                    files: frames,
                    type: "command",

                    TOTAL_MEMORY: 268435456
                })
                // console.log(combineAudioAndVideo)
                if (combineAudioAndVideo[0] == null) {
                    alert("ERROR")
                }
                console.log(combineAudioAndVideo[0].data)
                videoBlob = new Blob([combineAudioAndVideo[0].data], { type: 'video/mp4' });
                console.log(videoBlob)
                videoURL = URL.createObjectURL(videoBlob);

                cameraView.style.visibility = "hidden";
                cameraTrigger.textContent = "PLAY RECORDING"




            }



        })

    }
    else {
        rec.record()

        cameraView.style.visibility = "visible";

        isRecording = true
        cameraTrigger.textContent = "STOP RECORDING"


        intervalId = setInterval(function () {
            cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
            let x = cameraSensor.toDataURL("image/jpeg");
            images.push(convertDataURIToBinary(x))

        }, 1000 / fps)

    }



}


// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);
