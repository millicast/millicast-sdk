import { View, Director, Logger } from "@millicast/sdk";

window.Logger = Logger

Logger.setLevel(Logger.DEBUG);

if (import.meta.env.MILLICAST_DIRECTOR_ENDPOINT) {
  Director.setEndpoint(import.meta.env.MILLICAST_DIRECTOR_ENDPOINT)
}

//Get our url
const href = new URL(window.location.href);
//Get or set Defaults
const url = !!href.searchParams.get("url")
  ? href.searchParams.get("url")
  : "wss://turn.millicast.com/millisock";
const streamName = !!href.searchParams.get("streamName")
  ? href.searchParams.get("streamName")
  : import.meta.env.MILLICAST_STREAM_NAME;
const accountId = !!href.searchParams.get("accountId")
  ? href.searchParams.get("accountId")
  : import.meta.env.MILLICAST_ACCOUNT_ID;

// this is required for DRM streams, otherwise Director API will return errors
const subscriberToken = href.searchParams.get("token") || import.meta.env.MILLICAST_SUBSCRIBER_TOKEN;

const metadata = href.searchParams.get("metadata") === "true";
const enableDRM = href.searchParams.get("drm") === 'true';
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

let playing = false;
let fullBtn = document.querySelector("#fullBtn");
let video = document.querySelector("video");

// MillicastView object
let millicastView = null
let hasVideo =  false
let hasAudio = false

const newViewer = () => {
  const tokenGenerator = () => Director.getSubscriber(streamName, accountId, subscriberToken, enableDRM);
  const millicastView = new View(streamName, tokenGenerator, null, autoReconnect)
  millicastView.on("broadcastEvent", (event) => {
    if (!autoReconnect) return;
    if (event.name === "active") {
      const encryption = event.data.encryption
      if (encryption && enableDRM) {
        const drmOptions = {
          videoElement: document.querySelector("video"),
          audioElement: document.querySelector("audio"),
          videoEncryptionParams: encryption,
          videoMid: '0',
        };
        const audioTrackInfo = event.data.tracks.find((track) => track.type === 'audio')
        if (audioTrackInfo) {
          drmOptions.audioMid = audioTrackInfo.mediaId;
        }
        millicastView.configureDRM(drmOptions);
      }
      hasVideo = event.data.tracks.some(track => track.media === 'video')
      hasAudio = event.data.tracks.some(track => track.media === 'audio')
    }
  });
  millicastView.on("track", (event) => {
    if (!enableDRM) {
      if(hasVideo && event.track.kind === 'video' || hasAudio && !hasVideo && event.track.kind === 'audio')
        addStream(event.streams[0])
    }
  });

  millicastView.on('metadata', (metadata) => {
    if (metadata.unregistered) {
      console.log('received SEI unregistered messsage', metadata.unregistered)
    } 
    if (metadata.timecode) {
      console.log('received timecode messsage', metadata.timecode)
    }
    if (metadata.seiPicTimingTimeCodeArray) {
      console.log('received PIC timing message', metadata.seiPicTimingTimeCodeArray)
    }
  })

  millicastView.on('error', (error) => {
    console.log('Error from Millicast SDK', error)
  })

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

  if (disableVideo || !hasVideo) {
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

    //If we already had a a stream
    if (video.srcObject) {
      //Create temporal video element and switch streams when we have valid data
      const tmp = video.cloneNode(true);
      //Override the muted attribute with current muted state
      tmp.muted = video.muted;
      //Set same volume
      tmp.volume = video.volume;
      //Set new stream
      tmp.srcObject = stream;
      //Replicate playback state
      if (video.playing) {
        try { tmp.play(); } catch (e) {}
      } else if (video.paused) {
        try{ tmp.paused(); } catch (e) {}
      }
      //Replace the video when media has started playing
      tmp.addEventListener('loadedmetadata', (event) => {
      video.parentNode.replaceChild(tmp, video);
      //Pause previous video to avoid duplicated audio until the old PC is closed
      try { video.pause(); } catch (e) {}
      //If it was in full screen
      if (document.fullscreenElement == video) {
        try { document.exitFullscreen(); tmp.requestFullscreen(); } catch(e) {}
      }
      //If it was in picture in picture mode
      if (document.pictureInPictureElement == video) {
        try { document.exitPictureInPicture(); tmp.requestPictureInPicture(); } catch(e) {}
      }
      //Replace js objects too
      video = tmp;
      });
    } else {
       video.srcObject = stream;
    }
    
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
      enableDRM,
      metadata,
      disableVideo,
      disableAudio,
      absCaptureTime: true,
      peerConfig : {
        autoInitStats: true,
        statsIntervalMs: 5000
      }
    };
    window.millicastView = millicastView = newViewer()
    await millicastView.connect(options);
    
    millicastView.webRTCPeer.on('stats', (event) => {
      console.log(event)
    });

  } catch (error) {
    if (!autoReconnect) return;
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
      const mediaInfo = new chrome.cast.media.MediaInfo(streamName, '')
      mediaInfo.customData = { streamName, accountId }
      mediaInfo.streamType = chrome.cast.media.StreamType.LIVE

      const loadRequest = new chrome.cast.media.LoadRequest(mediaInfo)
      castSession.loadMedia(loadRequest).then(close)
    }
  })
}