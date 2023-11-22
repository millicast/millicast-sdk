import MillicastPublishUserMedia from './js/MillicastPublishUserMedia'
import { Director, Logger } from "@millicast/sdk"

window.Logger = Logger

Logger.setLevel(Logger.DEBUG);

const streamName = process.env.MILLICAST_STREAM_NAME ?? 'demo_' + Math.round(Math.random() * 100) + '_' + new Date().getTime();
const accountId = process.env.MILLICAST_ACCOUNT_ID
const publishToken = process.env.MILLICAST_PUBLISH_TOKEN
const disableVideo = false
const disableAudio = false
const disableStereo = false
const disableOrientation = true
let isBroadcasting = false
let isVideoMuted   = false
let isAudioMuted   = false

document.addEventListener("DOMContentLoaded", async (event) => {
  $('.privy-popup-container, .privy-popup-content-wrap').click(e => {
    return false;
  })

  const videoWin = document.querySelector('video');

  //check if mobile user.
  let isMobile = window.mobilecheck = function () {
    let check = false;
    (function (a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a) ||
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
            a.substr(0, 4))) {
        check = true;
      }
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }();
  //console.log('*index*  isMobile: ', isMobile);
  if (!isMobile) {
    videoWin.setAttribute("class", "vidWinBrowser");
  }
  //GUI ELEMENTS Refs
  //video overlay
  let viewUrlEl   = document.getElementById('viewerURL');
  let readyFlag   = document.getElementById('readyBadge');
  let onAirFlag   = document.getElementById('liveBadge');
  let userCount   = document.getElementById('userCount');

  //publish button
  let pubBtn      = document.getElementById('publishBtn');
  //Cam elements
  let camsList    = document.getElementById('camList'),
      camMuteBtn  = document.getElementById('camMuteBtn');
  //Mic elements
  let micsList    = document.getElementById('micList'),
      micMuteBtn  = document.getElementById('micMuteBtn');
  //Share Copy element
  let cpy         = document.getElementById('copyBtn');
  let ctrl        = document.getElementById('ctrlUI');
  let view        = document.getElementById('shareView');
  //Signup element
  let signup      = document.getElementById('signUpBtn');
  //Bandwidth Video element
  let elementList = document.querySelectorAll('#bandwidthMenu>.dropdown-item');

  // Publish & share sections
  let publishSection    = document.getElementById('publishSection'),
      shareSection      = document.getElementById('shareSection');
  //demo timer
  let tm;
  let tmInt          = 300000;//300000 - 5min

  //////

  function setUserCount() {
    // Add listener of broacastEvent to get UserCount
    console.log(millicastPublishUserMedia._events, 'publisher user media')
    millicastPublishUserMedia.on('broadcastEvent', (event) => {
      const {name, data} = event
      console.log(event, 'broadcastEvent')
      if (name === 'viewercount') {
        userCount.innerHTML = data.viewercount
      }
    })
  }
  //////

  function handleOrientation() {
    let el  = document.querySelector(".turnDeviceNotification");
    let elW = document.querySelector(".turnDeviceNotification.notification-margin-top");
    let thx = document.getElementById('thanks');

    if (window.orientation === undefined || !thx.classList.contains('d-none')) {
      return;
    }
    switch (window.orientation) {
      case 90:
        /* Device is in landscape mode */
        el.style.display  = "none";
        elW.style.display = "none";
        break;
      case -90:
        /* Device is upside-down in landscape mode*/
        el.style.display  = "none";
        elW.style.display = "block";
        break;
      default:
        /* Device is in portrait mode*/
        el.style.display  = "block";
        elW.style.display = "none";
    }
  }

  let previousOrientation = window.orientation;
  let checkOrientation    = function () {
    //console.log('checkOrientation', window.orientation, window.orientation !== previousOrientation);
    if (window.orientation !== previousOrientation) {
      previousOrientation = window.orientation;
    }
    handleOrientation()
  };

  if (!disableOrientation) {
    window.addEventListener("resize", checkOrientation, false);
    window.addEventListener("orientationchange", checkOrientation, false);
    // (optional) Android doesn't always fire orientationChange on 180 degree turns
    setInterval(checkOrientation, 2000);
    checkOrientation();
  }


  /////////////////////////
  const tokenGenerator = () => Director.getPublisher(publishToken, streamName)
  const millicastPublishUserMedia = window.millicastPublish = await MillicastPublishUserMedia.build({ streamName }, tokenGenerator, true)
  let selectedBandwidthBtn = document.querySelector('#bandwidthMenuButton');
  let bandwidth = 0
  const events = ['viewercount']

  const BroadcastMillicastStream = async () => {
    try{
      await millicastPublishUserMedia.connect({ bandwidth, events: events })
      isBroadcasting = true;
      broadcastHandler();
      setUserCount();
    }
    catch(error){
      console.log(error);
          isBroadcasting = false;
          broadcastHandler();
          onSetSessionDescriptionError(error)
    }
  }

  const onSetVideoBandwidth = async (evt) => {
    selectedBandwidthBtn.disabled  = true;
    bandwidth                      = evt.target.dataset.rate;
    selectedBandwidthBtn.innerHTML = bandwidth === 0 ? 'Maximum Bitrate' : `${bandwidth} kbps`;

    if(!millicastPublishUserMedia.isActive()){
      selectedBandwidthBtn.disabled = false;
    }
    else{
      try{
        await millicastPublishUserMedia.webRTCPeer.updateBitrate(bandwidth)
        console.log('Bitrate updated')
      }
      catch (e) {
        onSetSessionDescriptionError(e)
      }
    }
    selectedBandwidthBtn.disabled = false;
  }



  /////////////////////////

  function onSetSessionDescriptionError(error) {
    isBroadcasting = false;
    console.log('Failed to set session description: ' + error.toString());
  }


  /* UI */
  async function initUI() {
    if (disableVideo === true) {
      selectedBandwidthBtn.classList.add('d-none');
    }
    selectedBandwidthBtn.innerHTML = bandwidth === 0 ? 'Maximum Bitrate' : `${bandwidth} kbps`;
    if( bandwidth !== 0 )onSetVideoBandwidth();
    elementList.forEach(function (el) {
      el.classList.add('btn');
      el.addEventListener('click', onSetVideoBandwidth)
    });
    let a = true;
    //stereo support
    if(!disableStereo){
      a = {
        channelCount: {ideal:2},
        echoCancellation: false
      }
    }
    console.log('constraints audio:',a, ' disableAudio:',(!disableAudio ? a : false));


    millicastPublishUserMedia.mediaManager.constraints = {
      audio: !disableAudio ? a : false,
      video: !disableVideo ? {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 24 },
      } : false,
    };
    try{
     videoWin.srcObject = await millicastPublishUserMedia.getMediaStream()
     const devices = await millicastPublishUserMedia.devices
     displayDevices(devices)
    }
    catch(err){
      console.error(err);
    }
    pubBtn.addEventListener('click', async (e) => {
      await BroadcastMillicastStream();
    })

    //
    camsList.addEventListener('click', async (e) => {
      try{
        let target = e.target;
        videoWin.srcObject = await millicastPublishUserMedia.updateMediaStream('video',target.id)
        displayActiveDevice('cam');
      }
      catch(e){
        console.log('*index*  new stream failed ', e);
        alert('Failed to update.',e);
      }
    });
    camMuteBtn.addEventListener('click', (e) => {
      if (millicastPublishUserMedia.muteMedia('video',!isVideoMuted)) {
        isVideoMuted = !isVideoMuted;
        let iconEl = document.querySelector('#camOnIcon');
        isVideoMuted ? iconEl.classList.add('fa-video-slash') : iconEl.classList.remove('fa-video-slash');
      }
    });
    //

    micsList.addEventListener('click', async (e) => {
      try{
        let target = e.target;
        videoWin.srcObject = await millicastPublishUserMedia.updateMediaStream('audio', target.id)
        displayActiveDevice('mic');
      }
      catch(e){
        console.log('*index*  new stream failed ', e);
      }
    });
    micMuteBtn.addEventListener('click', (e) => {
      if (millicastPublishUserMedia.muteMedia('audio',!isAudioMuted)) {
        isAudioMuted = !isAudioMuted;
        let iconEl   = document.querySelector('#micOnIcon');
        isAudioMuted ? iconEl.classList.add('fa-microphone-slash') : iconEl.classList.remove('fa-microphone-slash');
      }
    });
    //

    cpy.addEventListener('click', () => {
      doCopy();
      showGuide('guide2', false);
    });

    viewUrlEl.addEventListener('click', e => {
      //do not open browser if mobile.
      if (isMobile) {
        return doCopy();
      }

      let url = (viewUrlEl.textContent || viewUrlEl.innerText).trim();
      //console.log('openViewer: ', url);
      if (url.length === 0 || url === 'https://' || url === 'Must broadcast first') {
        alert('You need to start a broadcast first.');
        return false;
      } else {
        window.open(url, '_blank');
      }
    });
    signup.addEventListener('click', e => {
      window.location = 'https://millicast.com/pricing/';//'https://dash.millicast.com/#/signup?planId=5';
    });
  }

  function displayDevices(data) {
    let mics = data.audioinput;
    while (micsList.firstChild) {
      micsList.removeChild(micsList.firstChild);
    }
    if (mics.length > 0) {
      mics.forEach(device => {
        let item       = document.createElement('button');
        item.innerHTML = device.label;
        item.classList = 'dropdown-item use-hand';
        item.id        = device.deviceId;
        micsList.appendChild(item);
      })
    }

    // update cam list
    let cams = data.videoinput;
    while (camsList.firstChild) {
      camsList.removeChild(camsList.firstChild);
    }
    if (cams.length > 0) {
      cams.forEach(device => {
        //console.log('device: ',device);
        let item       = document.createElement('button');
        item.innerHTML = device.label;
        item.classList = 'dropdown-item use-hand';
        item.id        = device.deviceId;
        camsList.appendChild(item);
      })
    }

    displayActiveDevice();
  }

  function displayActiveDevice(type) {
    if (type === 'mic' || !type) {
      micListBtn.innerHTML = '<p>' + cleanLabel(millicastPublishUserMedia.activeAudio.label) + '</p><span class="boxCover"></span>';
    }
    if (type === 'cam' || !type) {
      camListBtn.innerHTML = '<p>' + cleanLabel(millicastPublishUserMedia.activeVideo.label) + '</p><span class="boxCover"></span>';
    }
  }

  function broadcastHandler(b) {
    if (isBroadcasting) {
      showViewerUrl();
      onAirFlag.classList.remove('hidden')
      readyFlag.classList.add('hidden')
      //
      pubBtn.disabled               = true;
      selectedBandwidthBtn.disabled = false;
      if (!tm) {
        setTimer();
      }
      //switch guides display.
      if(showGuide){
        showGuide('guide1', false);
        showGuide('guide2', true);
      }
    } else {
      onAirFlag.classList.add('hidden')
      readyFlag.classList.remove('hidden')
      //
      pubBtn.disabled               = false;
    }
  }

  function showViewerUrl() {
    publishSection.classList.add('d-none');
    let href = (location.href).split('?')[0];
    if (href.indexOf('htm') > -1) {
      href = href.substring(0, href.lastIndexOf('/') + 1);
    }

    let viewerUrl = `https://viewer.millicast.com/?streamId=${accountId}/${streamName}`;

    if (disableVideo === true) {
      viewerUrl = `${viewerUrl}&disableVideo=${disableVideo}`
    }

    viewUrlEl.removeChild(viewUrlEl.firstChild);
    viewUrlEl.innerHTML = viewerUrl;
    shareSection.classList.remove('d-none');
  }

  function endDemo() {
    if (millicastPublishUserMedia) {
      millicastPublishUserMedia.stop();
    }
    let pb = document.getElementById('publishView');
    while (pb.firstChild) {
      pb.removeChild(pb.firstChild);
    }
    let thx = document.getElementById('thanks');
    thx.classList.remove('d-none');
  }

  function setTimer() {
    console.log('timer start', tmInt);
    tm = setTimeout(endDemo, tmInt);
  }

  /* UTILS */
  function cleanLabel(s) {
    if (s.indexOf('Default - ') === 0) {
      s = s.split('Default - ').join('');
    }
    return s;
  }

  function doCopy() {
    //add to clean text.
    let view = document.getElementById("viewerURL");
    let path = (view.textContent || view.innerText).trim();
    /* if(path.length == 0 || path == 'https://') {
        alert('Error: No Broadcast. [ Please begin a live broadcasting. ]');
        return false;
    } */
    let txt            = document.createElement('input');
    txt.type           = 'text';
    txt.readonly       = true;
    txt.value          = path;
    txt.style.position = 'fixed';
    txt.style.left     = '-9999px';
    document.body.appendChild(txt);

    let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (iOS) {
      txt.setAttribute('contenteditable', true);
      txt.setAttribute('readonly', false);
      let range = document.createRange();
      range.selectNodeContents(txt);
      let s = window.getSelection();
      s.removeAllRanges();
      s.addRange(range);
      txt.setSelectionRange(0, 999999);
      txt.setAttribute('contenteditable', false);
      txt.setAttribute('readonly', true);
    } else {
      txt.select();
    }
    document.execCommand('copy');
    alert('Copied to Clipboard!');
    document.body.removeChild(txt);
    return true;
  }

  initUI()

})