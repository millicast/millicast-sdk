import { View, Director, Logger } from "millicast-sdk-js";

window.Logger = Logger

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
let playing = false;
let fullBtn = document.querySelector("#fullBtn");
let video = document.querySelector("video");

// MillicastView object
let millicastView = null

const newViewer = () => {
  const tokenGenerator = () => Director.getSubscriber(streamId, streamAccountId)
  const millicastView = new View(streamId, tokenGenerator)
  millicastView.on("broadcastEvent", (event) => {
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
  
  millicastView.on("track", (event) => {
    addStream(event.streams[0]);
  });

  return millicastView
}


const togglePlay = () => {
  if (video.paused) {
    video.play()
  } else {
    video.pause();
  }
};

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
      video.removeAttribute("muted");
    }
    if (!autoplay) {
      video.autoplay = false;
      playing = false;
      video.removeAttribute("autoplay");
    }

    video.srcObject = stream;
    if (audio) audio.parentNode.removeChild(audio);
  }
};

let isSubscribed = false

const close = () => {
  video.srcObject = null;
  playing = false;
  millicastView?.millicastSignaling?.close();
  millicastView = null
  isSubscribed = false
  return Promise.resolve({});
};

const subscribe = async () => {
  if (millicastView?.isActive() || isSubscribed) {
    return
  }

  try {
    isSubscribed = true
    const options = {
      disableVideo: disableVideo,
      disableAudio: disableAudio,
    };
    millicastView = newViewer()
    await millicastView.connect(options);
  } catch (error) {
    if (!autoReconnect) return;

    close().then(() => {
      subscribe();
    });
    console.error(error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  let int;
  let lastclientX, lastclientY;

  const startInt = (evt) => {
    if (int) clearInterval(int);
    int = setInterval(() => {
      let clientX = evt.clientX;
      let clientY = evt.clientY;
      if (clientX === lastclientX && clientY === lastclientY) {
        clearInterval(int);
      } else {
        lastclientX = clientX;
        lastclientY = clientY;
      }
    }, 1000);
  };

  if (fullBtn) fullBtn.onclick = toggleFullscreen;

  video.onmousemove = (evt) => {
    startInt(evt);
  };
  video.addEventListener(
    "touchstart",
    (evt) => {
      startInt(evt);
    },
    false
  );

  int = setInterval(() => {
    clearInterval(int);
  }, 2000);
  subscribe();
});

const receiverApplicationId = 'B5B8307B'

window['__onGCastApiAvailable'] = function(isAvailable) {
  if (!isAvailable) {
    return false
  }
  
  const stateChanged = cast.framework.CastContextEventType.CAST_STATE_CHANGED
  const castContext = cast.framework.CastContext.getInstance()
  castContext.setOptions({
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    receiverApplicationId
  })

  castContext.addEventListener(stateChanged, ({castState}) => {
    if (castState === cast.framework.CastState.NOT_CONNECTED) {
      subscribe()
    }

    if (castState === cast.framework.CastState.CONNECTED) {
      const castSession = castContext.getCurrentSession()
      const mediaInfo = new chrome.cast.media.MediaInfo(streamId, '')
      mediaInfo.customData = { streamId, streamAccountId }
      mediaInfo.streamType = chrome.cast.media.StreamType.LIVE

      const loadRequest = new chrome.cast.media.LoadRequest(mediaInfo)
      castSession.loadMedia(loadRequest).then(close)
    }
  })
}