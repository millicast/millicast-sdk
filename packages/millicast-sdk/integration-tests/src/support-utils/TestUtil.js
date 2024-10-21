class TestUtil {

    static {
        //safari doesn't understand static class fields within the class, these must be defined here
        TestUtil.context = null;
        TestUtil.context = new (window.AudioContext || window.webkitAudioContext)()
      }

    static #createAudioContextArguments(args) {
        document.getElementById("inputAudioContextArguments").value = args;
    }

    /**
     * On some browsers AudioContext must be started by user gesture (Chrome)
     * On some browsers AudioContext is started in 'suspended' state anyway (Safari, Firefox)
     * This function MUST be called from user gesture (a click)
     * Create AudioContext if not already created,
     * if it's suspended, resume it.
    */
    static #createAudioContext() {
        var uuid = "unknown_uuid";
        try {
            var args_json = document.getElementById("inputAudioContextArguments").value;
            console.debug("createAudioContext: parsing arguments: " + args_json);

            var args = JSON.parse(args_json);
            console.debug("createAudioContext: parsed: " + args);

            var method = args[0];
            var callback = args[1];
            uuid = args[2];

            if (!method || !callback || !uuid) {
                throw new Error("pbj fields not set for create_audio_context call");
            }

            if (!TestUtil.context) {
                console.debug("createAudioContext: Creating TestUtil.context...");
                TestUtil.context = new (window.AudioContext || window.webkitAudioContext)();
                console.debug("createAudioContext: TestUtil.context created in state: " + TestUtil.context.state);
            } else {
                console.debug("createAudioContext: TestUtil.context already created");
            }

            if (TestUtil.context.state != 'running') {
                console.debug("createAudioContext: Resuming TestUtil.context...");
                TestUtil.context.resume().then(() => {
                    console.debug("createAudioContext: TestUtil.context resumed");
                    pbj.py_return(true, method, callback, uuid);
                }, (error) => {
                    console.debug("createAudioContext: TestUtil.context didn't resume");
                    console.error("createAudioContext: " + error);
                    var result = pbj.parse_error(error);
                    pbj.py_return(result, method, callback, uuid);
                });
            } else {
                console.debug("createAudioContext: TestUtil.context already running");
                pbj.py_return(true, method, callback, uuid);
            }
        } catch (error) {
            console.error("createAudioContext: " + error);
            var result = pbj.parse_error(error);
            pbj.py_return(result, method, callback, uuid);
        }
    }

    /**
     * get single frame of video at time of call as an Uint8ClampedArray,
     * crops the frame to width, height or both if set.
     * @param {*} video video element
     * @param {number} x start point of cropping horizontal offset
     * @param {number} y start point of cropping vertical offset
     * @param {number} width Width of the cropped frame
     * @param {number} height Height of the cropped frame
     * @returns null if video tag is null, or no attached stream or attached stream has no video tracks,
     *          Array of image pixel data otherwise
     */
    static #getImageDataFromVideo(video, x = 0, y = 0, width = 0, height = 0) {
        if (!video) {
            console.debug("getImageDataFromVideo: Given video tag is null, returning null");
            return null;
        }
        if (!video.srcObject) {
            console.debug("getImageDataFromVideo: Given video tag has no src or srcObject, returning null");
            return null;
        }
        if (video.srcObject && video.srcObject.getVideoTracks().length < 1) {
            console.debug("getImageDataFromVideo: Given video tag's srcObject has no video tracks, returning null");
            return null;
        }
        if (video.videoWidth == 0 || video.videoHeight == 0) {
            console.debug("getImageDataFromVideo: Video stream has size 0, returning null");
            return null;
        }

        var canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        var ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // copy single frame from video element onto canvas
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        // get single frame as array of bytes
        return ctx.getImageData(x, y, width || video.videoWidth, height || video.videoHeight);
    }

    /**
     * Reduce a single video frame into a hash string
     */
    static async #hashImageData(imageData) {
        var digest = await crypto.subtle.digest("SHA-256", imageData.data);
        var uint32digest = new Uint32Array(

            digest);
        return uint32digest.reduce((acc, nxt) => { return acc + nxt.toString(16) }, "");
    }

    /**
     * Check if at least one pixel of imageData (Uint8ClampedArray) is not fully
     * black or white
     */
    static #isVideoPresentInImageData(imageData) {
        if (!imageData) {
            console.debug("isVideoPresentInImageData: no imageData given, returning null")
            return null;
        }

        return !(TestUtil.#isImageDataUniformSpecificColor(imageData, 255, 255, 255)
            || TestUtil.#isImageDataUniformSpecificColor(imageData, 0, 0, 0));
    }

    /**
     * @returns true if platform is little endian
     */
    static #isLittleEndian() {
        var u8 = new Uint8ClampedArray(4);
        var u32 = new Uint32Array(u8.buffer);
        u32[0] = 0xff000000;
        return u8[0] === 0xff;
    }

    /**
     * @returns single Uint32 representation of RGBA or ARGB depending on platform endianness
     */
    static #rgba(r = 0, g = 0, b = 0, a = 255) {
        //LE: RGBA
        //BE: ABGR
        let value;
        if (TestUtil.#isLittleEndian()) {
            //value = r * 256 * 256 * 256 + g * 256 * 256 + b * 256 + a
            value = (r << 24 >>> 0) + (g << 16 >>> 0) + (b << 8 >>> 0) + a
        } else {
            //value = r + g * 256 + b * 256 * 256 + 256 * 256 * 256 * a; // value overflows if bit shift is used
            value = r + (g << 8 >>> 0) + (b << 16 >>> 0) + (a << 24 >>> 0);
        }
        return value;
    }

    static #_getUint32ArrayFromImageData(imageData) {
        if (!imageData) {
            throw new Error("no imageData given");
        }
        let u32 = new Uint32Array(imageData.data.buffer);
        if (u32.length <= 0) {
            throw new Error("Uint32Array from imageData is size 0");
        }
        return u32;
    }

    /**
     * @param {*} imageData 
     * @returns true if all of imageData contains a single color with no variation
     */
    static #isImageDataUniformColor(imageData) {
        let u32 = TestUtil.#_getUint32ArrayFromImageData(imageData);
        return u32.every(item => item === u32[0]);
    }

    /**
     * @param {*} imageData
     * @param {*} r 
     * @param {*} g 
     * @param {*} b 
     * @param {*} a 
     * @returns true if all of imageData contains a single specified color with no variation
     */
    static #isImageDataUniformSpecificColor(imageData, r = 0, g = 0, b = 0, a = 255) {
        //return isImageDataUniformColor() && averageColor(imageData) == [r,g,b,a];
        let u32 = TestUtil.#_getUint32ArrayFromImageData(imageData);

        let value = TestUtil.#rgba(r, g, b, a);
        //console.log(value);
        var result = u32.every((item) => item === value);
        return result;
    }

    /**
     * @param {*} imageData 
     * @returns [r,g,b,a] array (always in that order) with the average color of the imageData
     */
    static #imageDataAverageColor(imageData) {
        if (!imageData) {
            console.debug("imageDataAverageColor: no imageData given, returning null")
            return null;
        }

        let u32 = TestUtil.#_getUint32ArrayFromImageData(imageData);

        let le = TestUtil.#isLittleEndian();
        function runAvg(acc, curr, idx) {
            //LE: RGBA
            //BE: ABGR
            let r = le ? (curr & 0xff) : (curr & 0xff000000) >>> 24;
            let g = le ? (curr & 0xff00) >>> 8 : (curr & 0xff0000) >>> 16;
            let b = le ? (curr & 0xff0000) >>> 16 : (curr & 0xff00) >>> 8;
            let a = le ? (curr & 0xff000000) >>> 24 : (curr & 0xff);

            let newAcc = [
                ((acc[0] * idx) + r) / (idx + 1),
                ((acc[1] * idx) + g) / (idx + 1),
                ((acc[2] * idx) + b) / (idx + 1),
                ((acc[3] * idx) + a) / (idx + 1)
            ];
            return newAcc;
        }

        let value = u32.reduce(runAvg, [0, 0, 0, 0]);
        return [
            Math.round(value[3]),
            Math.round(value[2]),
            Math.round(value[1]),
            Math.round(value[0]),
        ];
    }

    /**
     * 
     * @param {String} identifier
     * @returns [r,g,b,a] array (always in that order) with the average color of the video of given identifier
     */
    static #videoAverageColor(identifier = "default") {
        const video_element = VideoTagManager.get_video_tag(identifier);
        var imageData = TestUtil.#getImageDataFromVideo(video_element);
        return TestUtil.#imageDataAverageColor(imageData);
    }

    /**
     * Crops a rectangle from the top-left corner of the image and mixes it down to a single pixel.
     * @param {String} identifier
     * @returns [r,g,b,a] array (always in that order) a single pixel with the average value.
     */
    static #getColorIdPixel(identifier = "default") {
        const video_element = VideoTagManager.get_video_tag(identifier);
        var imageData = TestUtil.#getImageDataFromVideo(
            video_element, 0, 0,
            Math.floor(video_element.videoWidth / 10),
            Math.floor(video_element.videoHeight / 10)
        );
        return TestUtil.#imageDataAverageColor(imageData);
    }

    /**
     * 
     * @param {String} identifier
     * @param {*} r 
     * @param {*} g 
     * @param {*} b 
     * @param {*} a 
     * @returns true if video in identifier is a flat single color,
     *  optionally color can be specified
     *  note that due to video compression the color might be slightly off
     *  from an original flat color source
     */
    static #isVideoUniformColor(identifier = "default", r, g, b, a = 255) {
        const video_element = VideoTagManager.get_video_tag(identifier);
        var imageData = TestUtil.#getImageDataFromVideo(video_element);
        if (r !== undefined && g !== undefined && b !== undefined) {
            return TestUtil.#isImageDataUniformSpecificColor(imageData, r, g, b, a);
        } else {
            return TestUtil.#isImageDataUniformColor(imageData);
        }
    }

    /**
     * Check if video is present in given video element
     */
    static #isVideoPresentInVideoTag(video) {
        var imageData = TestUtil.#getImageDataFromVideo(video);
        if (!imageData) {
            console.debug("isVideoPresentInVideoTag: no imageData from video tag, returning null")
            return null;
        }

        return TestUtil.#isVideoPresentInImageData(imageData);
    }

    /**
     * Check if audio is present (audio track exists and has audible content)
     * in stream connected to given video element
     * @returns true/false for audio presence, null if video node has no stream attached
     */
    static async #isAudioPresentInVideoTag(video, minDecibels) {
        if (!video.srcObject) {
            console.debug("isAudioPresentInVideoTag: Given video tag has no srcObject, returning null");
            return null;
        }
        if (video.srcObject.getAudioTracks().length <= 0) {
            console.debug("isAudioPresentInVideoTag: Given video tag's srcObject has no audio tracks, returning false");
            return false;
        }

        return await TestUtil.#_checkAudioInStream(video.srcObject, minDecibels);
    }

    /**
     * Check if given AnalyserNode contains audio.
     * analyser cannot be null
     * @param {AnalyserNode} analyser
     */
    static #_analyserDetectsAudio(analyser) {
        var freqs = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqs);
        var samples = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(samples);
        console.debug("_analyserDetectsAudio: freqs: " + freqs.filter(f => f > 0));
        console.debug("_analyserDetectsAudio: samples: " + samples.filter(s => s != 128));
        // some frequency is present in spectrum above abritrarily chosen threshold
        // or some sample is present in waveform above abritrarily chosen threshold
        return (freqs.some((element, index, array) => { return element > 5; }) ||
            // values are 0-255, where 128 is "zero" signal level
            samples.some((element, index, array) => { return Math.abs(element - 128) > 10; }));
    }

    /**
     * Check if analyser detects audio in
     * stream for delay milliseconds or longer to do at least 50 checks
     * @param {AnalyserNode} analyser
     * @param {number} delay milliseconds of delay
     */
    static async #_checkAudioInAnalyser(analyser, delay = 2000) {
        var startTime = new Date().getTime();
        var count = 0;

        while (new Date().getTime() < startTime + delay || count < 50) {
            if (new Date().getTime() > startTime + 30000) {
                //over 30s have passed and we haven't even done 50 checks
                throw new CPUOverloadError(
                    "_checkAudioInAnalyser: unable to reliably check audio due to cpu overload, "
                    + count + " checks in " + (new Date().getTime() - startTime) + "ms"
                );
            }

            console.debug("_checkAudioInAnalyser: checking...");
            var result = TestUtil.#_analyserDetectsAudio(analyser);
            console.debug("_checkAudioInAnalyser: result: " + result);
            count++;
            if (result) {
                var delta = new Date().getTime() - startTime;
                console.log(
                    "_checkAudioInAnalyser: checked " + count
                    + " times in " + delta + "ms, returning: true"
                );
                return result;
            }
            // "sleep" for ~10ms (will be much longer, even tens of seconds, if cpu is overloaded)
            await new Promise((r) => setTimeout(r, 10));
        }
        var delta = new Date().getTime() - startTime;
        console.log(
            "_checkAudioInAnalyser: checked " + count + " times in "
            + delta + "ms, returning: false"
        );
        return false;
    }


    /**
     * Create analyser, check if analyser detects audio in
     * stream for delay milliseconds or longer to do at least 50 checks
     * @param {MediaStream} stream
     * @param {Number} minDecibels
     * @param {number} delay milliseconds of delay
     */
    static async #_checkAudioInStream(stream, minDecibels = -140, delay = 2000) {
        var analyser = TestUtil.#createAnalyserForStream(stream, minDecibels);
        return await TestUtil.#_checkAudioInAnalyser(analyser, delay);
    }

    /**
     * Check if 2 frames with 2s delay between them are different by comparing hash
     * of all pixels
     * @param {*} video
     * @param {*} timeout
     * @returns {Promise} true if video is present and active,
     * false if video is present, but not active or disappears during check,
     * null if no video is present at all
     */
    static async #isVideoActiveInVideoTag(video, timeout = 2) {
        if (timeout === undefined) {
            timeout = 2;
        }
        var imageData = TestUtil.#getImageDataFromVideo(video);
        if (!TestUtil.#isVideoPresentInImageData(imageData)) {
            console.debug("isVideoActiveInVideoTag: video not present in video tag on 1st check, returning null");
            return null;
        }

        var hash = await TestUtil.#hashImageData(imageData);

        // "sleep" for 2s
        await new Promise((r) => setTimeout(r, 2000));

        var imageData = TestUtil.#getImageDataFromVideo(video);
        if (!TestUtil.#isVideoPresentInImageData(imageData)) {
            console.debug("isVideoActiveInVideoTag: video not present in video tag on 2nd check, returning false");
            return false;
        }

        var hash2 = await TestUtil.#hashImageData(imageData);

        if (hash == hash2) {
            console.debug("isVideoActiveInVideoTag: no difference between 1st and 2nd check, returning false");
        }
        return hash != hash2;
    }

    /**
     * Create analyser with set values
     */
    static #createAnalyser(minDecibels) {
        var analyser = this.context.createAnalyser();
        if (!analyser) {
            throw new Error("Unable to create stream analyser");
        }
        analyser.minDecibels = minDecibels;
        analyser.maxDecibels = 0;
        analyser.fftSize = 2048;
        return analyser;
    }

    /**
     * Create StreamAnalyser for given stream with given smoothing value
     * - Apply a reverb effect that extends the periods with audio
     *   to help with chrome generating lots of silence in the signal
     * - Apply huge gain (will clip, we don't care) to offset quiet (not silent)
     *   periods in chrome signal
     * @param {MediaStream} stream
     * @param {Number} minDecibels
     */
    static #createAnalyserForStream(stream, minDecibels) {
        var source = this.context.createMediaStreamSource(stream);
        var analyser = this.#createAnalyser(minDecibels);

        source.connect(analyser);
        return analyser;
    }

    static #sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Return value of 'active' attribute of the video stream in video tag given by identifier;
     * null if no stream is attached, undefined if no video tag found
     * @param {String} identifier 
     */
    static async isStreamLive(elementId) {
        var video_element = document.getElementById(elementId)
        if (!video_element) {
            console.debug(`isStreamActive: ElementId '${elementId}' not found, returning undefined`);
            return undefined;
        }
        if (!video_element.srcObject) {
            console.debug(`isStreamActive: ElementId '${elementId}' has no srcObject, returning null`);
            return null;
        }

        return await video_element?.srcObject?.active;
    }

    static async isVideoActive(elementId) {
        var video_element = document.getElementById(elementId)
        if (!video_element) {
            console.debug(`isVideoActive: ElementId '${elementId}' not found, returning undefined`);
            return undefined;
        }
        return await TestUtil.#isVideoActiveInVideoTag(video_element);
    }

    /**
     * Check if video is present in stream connected to video
     * element given by identifier
     * @param {String} identifier
     */
    static async isVideoPresent(elementId) {
        var video_element = document.getElementById(elementId)
        if (!video_element) {
            console.debug(`isVideoPresent: ElementId '${elementId}' not found, returning undefined`);
            return undefined;
        }
        return await TestUtil.#isVideoPresentInVideoTag(video_element);
    }

    /**
     * Check if audio is present in stream connected to video
     * element given by identifier
     * @param {String} identifier
     */
    static async isAudioPresent(elementId) {
        var video_element = document.getElementById(elementId)
        if (!video_element) {
            console.debug(`isAudioPresent: ElementId '${elementId}' not found, returning undefined`);
            return undefined;
        }
        return await TestUtil.#isAudioPresentInVideoTag(video_element);
    }

    /**
     * Check resolution of the video element
     */
    static getResolution(elementId) {
        var video_element = document.getElementById(elementId)
        if (!video_element) {
            console.debug(`getResolution: ElementId '${elementId}' not found, returning undefined`);
            return undefined;
        }
        return [video_element.videoHeight, video_element.videoWidth]
    }

    static async getFullStats(){
        const source = millicastView.getRTCPeerConnection()
        const reports = await source.getStats(null);
        const statsData = []
        reports.forEach((report) => {
            statsData.push(report)
        })
        return statsData
    }

    static async getStats(){
        var peer = millicastView.webRTCPeer
        // peer.initStats()
        const stats = await peer.peerConnectionStats.stats
        return {audio: stats.audio.inbounds[0], video: stats.video.inbounds[0]}
    }

    static async getLayers(waitTime=30000){
        var layers = undefined
        millicastView.once('broadcastEvent', (event) => {
            layers = event.data.medias[0].layers
        });

        const now = Date.now()
        while( Date.now() < now + waitTime){
            if (layers) {
                return layers
            }
            await TestUtil.#sleep(1000)
        }
        return layers
    }
}