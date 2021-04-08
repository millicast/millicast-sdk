import { MillicastView, MillicastDirector, MillicastLogger } from "millicast-sdk-js";

window.MillicastLogger = MillicastLogger

//Get our url
const href = new URL(window.location.href);
//Get or set Defaults
const url = !!href.searchParams.get("url")
  ? href.searchParams.get("url")
  : "wss://turn.millicast.com/millisock";
const streamId = !!href.searchParams.get("streamId")
  ? href.searchParams.get("streamId")
  : process.env.MILLICAST_STREAM_ID;
const streamAccountId = !!href.searchParams.get("streamAccountId")
  ? href.searchParams.get("streamAccountId")
  : process.env.MILLICAST_ACCOUNT_ID;

const disableVideo = href.searchParams.get("disableVideo") === "true";
const disableAudio = href.searchParams.get("disableAudio") === "true";
const muted =
  href.searchParams.get("muted") === "true" ||
  href.searchParams.get("muted") === null;
const autoplay =
  href.searchParams.get("autoplay") === "true" ||
  href.searchParams.get("autoplay") === null;
const autoReconnect =
  href.searchParams.get("autoReconnect") === "true" ||
  href.searchParams.get("autoReconnect") === null;

//console.log(disableVideo, disableAudio, muted, autoplay, autoReconnect);
const disableControls =
  href.searchParams.get("disableControls") === "true" &&
  href.searchParams.get("disableControls") !== null;
const disableVolume =
  (href.searchParams.get("disableVolume") === "true" &&
    href.searchParams.get("disableVolume") !== null) ||
  disableControls;
const disablePlay =
  (href.searchParams.get("disablePlay") === "true" &&
    href.searchParams.get("disablePlay") !== null) ||
  disableControls;
const disableFull =
  (href.searchParams.get("disableFull") === "true" &&
    href.searchParams.get("disableFull") !== null) ||
  disableControls;

//console.log(disableVolume, disablePlay, disableFull);
let millicastStream;
let peer;
let playing = false;

document.addEventListener("DOMContentLoaded", () => {
  let mainView = document.querySelector("#mainView");
  let fullBtn = document.querySelector("#fullBtn");
  let muteBtn = document.querySelector("#muteBtn");
  let playBtn = document.querySelector("#playBtn");
  let video = document.querySelector("video");

  let int;
  let lastclientX, lastclientY;

  const toggleFullscreen = () => {
    let fullIcon = fullBtn.children[0];
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      fullIcon.classList.remove("fa-compress");
      fullIcon.classList.add("fa-expand");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();

        fullIcon.classList.remove("fa-expand");
        fullIcon.classList.add("fa-compress");
      }
    }
  };
  const togglePlay = () => {
    if (video.paused) {
      video
        .play()
        .then(() => {
          togglePlayUI(true);
        })
        .catch(() => {});
    } else {
      video.pause();
      togglePlayUI(false);
    }
  };
  const togglePlayUI = (boolean) => {
    /*let playIcon = document.querySelector('#playBtn').children[0];
    //console.log('togglePlay',boolean ,  playIcon.classList.contains('fa-pause'));

    if (boolean === true) {
      playIcon.classList.remove('fa-play');
      playIcon.classList.add('fa-pause');
    } else {
      playIcon.classList.remove('fa-pause');
      playIcon.classList.add('fa-play');
    }*/
  };
  const toggleMute = () => {
    /*let muteIcon = muteBtn.children[0];
    if(video.muted){
      muteIcon.classList.remove('fa-volume-mute');
      muteIcon.classList.add('fa-volume-down');
    }else {
      muteIcon.classList.remove('fa-volume-down');
      muteIcon.classList.add('fa-volume-mute');
    }

    video.muted = !video.muted;*/
  };
  const displayUI = () => {
    /*mainView.classList.remove('nocursor');
    fullBtn.classList.remove('hidden');
    muteBtn.classList.remove('hidden');
    playBtn.classList.remove('hidden');

    fullBtn.classList.add('visible');
    muteBtn.classList.add('visible');
    playBtn.classList.add('visible');*/
  };
  const hideUI = () => {
    /*mainView.classList.add('nocursor');
    fullBtn.classList.add('hidden');
    muteBtn.classList.add('hidden');
    playBtn.classList.add('hidden');

    fullBtn.classList.remove('visible');
    muteBtn.classList.remove('visible');
    playBtn.classList.remove('visible');*/
  };
  const enableUI = () => {
    /*fullBtn.classList.remove('not-allowed');
    muteBtn.classList.remove('not-allowed');
    playBtn.classList.remove('not-allowed');*/
  };
  let hasListeners = false;
  const addListeners = () => {
    /*muteBtn.addEventListener('click', toggleMute);
    playBtn.addEventListener('click', togglePlay);
    hasListeners = true;*/
  };
  const removeListeners = () => {
    /*if (muteBtn.removeEventListener) {                   // For all major browsers, except IE 8 and earlier
      muteBtn.removeEventListener('click', toggleMute);
    } else if (x.detachEvent) {                    // For IE 8 and earlier versions
      muteBtn.detachEvent('click', toggleMute);
    }

    if (playBtn.removeEventListener) {                   // For all major browsers, except IE 8 and earlier
      playBtn.removeEventListener('click', toggleMute);
    } else if (x.detachEvent) {                    // For IE 8 and earlier versions
      playBtn.detachEvent('click', toggleMute);
    }*/
  };
  const startInt = (evt) => {
    if (int) clearInterval(int);
    int = setInterval(() => {
      let clientX = evt.clientX;
      let clientY = evt.clientY;
      if (clientX === lastclientX && clientY === lastclientY) {
        hideUI();
        clearInterval(int);
      } else {
        lastclientX = clientX;
        lastclientY = clientY;
      }
    }, 1000);
  };
  const addStream = (stream) => {
    //Create new video element
    playing = true;
    const audio = document.querySelector("audio");

    if (disableVideo) {
      if (audio) audio.srcObject = stream;
      if (video) video.parentNode.removeChild(video);
      togglePlay();
    } else {
      //Set same id
      video.id = stream.id;
      //Set src stream
      //console.log('addStream');
      if (!muted) {
        toggleMute();
        video.removeAttribute("muted");
      }
      if (!autoplay) {
        video.autoplay = false;
        playing = false;
        togglePlayUI(false);
        video.removeAttribute("autoplay");
      }

      video.srcObject = stream;
      enableUI();
      togglePlayUI(playing);
      if (!hasListeners) addListeners();

      if (audio) audio.parentNode.removeChild(audio);
    }
  };
  const initUI = () => {
    /*if(disableVolume){
      muteBtn.classList.add('d-none');
    }

    if(disablePlay){
      playBtn.classList.add('d-none');
    }

    if(disableFull){
      fullBtn.classList.add('d-none');
    }

    displayUI();*/
  };

  const subscribe = async () => {
    const millicastView = new MillicastView();
    millicastView.on("event", (event) => {
      if (!autoReconnect) return;

      let layers = event.data["layers"] !== null ? event.data["layers"] : {};
      if (event.name === "layers" && Object.keys(layers).length <= 0) {
        //call play logic or being reconnect interval
        close().then(() => {
          subscribe();
        });
        console.error("Feed no longer found.");
      }
    });

    millicastView.on("newTrack", (event) => {
      if (!playing) addStream(event.streams[0]);
    });

    const close = () => {
      togglePlayUI(false);
      video.srcObject = null;
      playing = false;
      millicastView.millicastSignaling?.close();
      removeListeners();
      return Promise.resolve({});
    };

    try {
      const getViewerResponse = await MillicastDirector.getSubscriber(streamAccountId, streamId)
      const options = {
        subscriberData: getViewerResponse,
        streamName: streamId,
        disableVideo: disableVideo,
        disableAudio: disableAudio,
      };
      await millicastView.connect(options);
    } catch (error) {
      if (!autoReconnect) return;

      close().then(() => {
        subscribe();
      });
      console.error(error);
    }
  };

  if (fullBtn) fullBtn.onclick = toggleFullscreen;

  video.onmousemove = (evt) => {
    startInt(evt);
    displayUI();
  };
  video.addEventListener(
    "touchstart",
    (evt) => {
      startInt(evt);
      displayUI();
    },
    false
  );

  window.onmouseout = (evt) => {
    if (!evt.relatedTarget) hideUI();
  };

  int = setInterval(() => {
    hideUI();
    clearInterval(int);
  }, 2000);

  initUI();
  subscribe();
});
