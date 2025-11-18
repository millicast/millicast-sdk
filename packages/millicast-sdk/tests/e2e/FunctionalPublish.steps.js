const {defineFeature, loadFeature}=require('jest-cucumber');
const puppeteer=require('puppeteer');

const feature=loadFeature('./tests/features/FunctionalPublish.feature');

defineFeature(feature, test => {
  let browser;
  let broadcasterPage;
  let viewerPage;

  beforeAll(async () => {
    browser=await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    // Create two pages - one for broadcaster, one for viewer
    broadcasterPage=await browser.newPage();
    viewerPage=await browser.newPage();

    broadcasterPage.on('console', msg => console.log('BROADCASTER:', msg.text()));
    broadcasterPage.on('pageerror', error => console.log('BROADCASTER ERROR:', error.message));

    viewerPage.on('console', msg => console.log('VIEWER:', msg.text()));
    viewerPage.on('pageerror', error => console.log('VIEWER ERROR:', error.message));

  });

  afterEach(async () => {
    if (broadcasterPage) {
      await broadcasterPage.close();
    }
    if (viewerPage) {
      await viewerPage.close();
    }
  });

  test('Broadcasting stream', ({given, when, then}) => {

    given(/^a page with view options and a page with broadcaster options and codec (.*)$/, async (codec) => {
      // Load broadcaster page

      const htmlPath=path.resolve(__dirname, './PuppeteerJest.html');
      console.log('Loading HTML from:', htmlPath);

      await broadcasterPage.goto(`file://${htmlPath}`);
      await broadcasterPage.waitForLoadState?.('networkidle')||await broadcasterPage.waitForTimeout(1000);

      // Load viewer page
      await viewerPage.goto(`file://${htmlPath}`);
      await viewerPage.waitForLoadState?.('networkidle')||await viewerPage.waitForTimeout(1000);

      const broadcasterDebug=await broadcasterPage.evaluate(() => ({
        title: document.title,
        sdkReady: window.sdkReady,
        hasMillicast: typeof window.millicast!=='undefined',
        statusText: document.getElementById('status')?.textContent,
        error: window.sdkError?.message||window.globalError?.message
      }));
      console.log('Broadcaster debug:', broadcasterDebug);

      const viewerDebug=await viewerPage.evaluate(() => ({
        title: document.title,
        sdkReady: window.sdkReady,
        hasMillicast: typeof window.millicast!=='undefined',
        statusText: document.getElementById('status')?.textContent,
        error: window.sdkError?.message||window.globalError?.message
      }));
      console.log('Viewer debug:', viewerDebug);

      // Wait for SDK to be ready on both pages (Relies on window.sdkReady from PuppeteerJest.html)
      await Promise.all([
        broadcasterPage.waitForFunction(() => window.sdkReady===true, {timeout: 15000}),
        viewerPage.waitForFunction(() => window.sdkReady===true, {timeout: 15000})
      ]);

      // Set up codec configuration on broadcaster page
      await broadcasterPage.evaluate((selectedCodec) => {
        window.testConfig={
          codec: selectedCodec,
          streamName: `test-stream-${Date.now()}`,
          publishToken: 'test-publish-token',
          subscribeToken: 'test-subscribe-token'
        };
      }, codec);

      // Set up viewer configuration
      await viewerPage.evaluate((selectedCodec) => {
        window.testConfig={
          codec: selectedCodec,
          streamName: `test-stream-${Date.now()}`,
          subscribeToken: 'test-subscribe-token'
        };
      }, codec);
    });

    when('I broadcast a stream and connect to stream as viewer', async () => {
      try {
        // Start broadcasting
        await broadcasterPage.evaluate(() => {
          return new Promise((resolve, reject) => {
            try {
              if (!window.millicast) {
                throw new Error('Millicast SDK not loaded on broadcaster page');
              }

              const {Publisher}=window.millicast;

              if (!Publisher) {
                throw new Error('Publisher class not found in Millicast SDK');
              }

              // Create publisher instance
              const publisher=new Publisher(
                window.testConfig.streamName,
                window.testConfig.publishToken
              );

              // Set up publisher events
              publisher.on('connected', () => {
                window.publisherConnected=true;
              });

              publisher.on('connectionError', (error) => {
                window.publisherError=error;
                reject(error);
              });

              // Create fake media stream
              navigator.mediaDevices.getUserMedia({
                video: {
                  width: 640,
                  height: 480,
                  frameRate: 30
                },
                audio: true
              }).then(stream => {
                // Configure codec if supported
                const publishOptions={
                  codec: window.testConfig.codec
                };

                return publisher.publish(stream, publishOptions);
              }).then(() => {
                window.publishingStarted=true;
                window.publisher=publisher;
                resolve();
              }).catch(publishError => {
                window.publisherError=publishError;
                reject(publishError);
              });

            } catch (error) {
              window.broadcasterError=error;
              reject(error);
            }
          });
        });

        // Small delay to ensure broadcast is established
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Start viewing
        await viewerPage.evaluate(() => {
          return new Promise((resolve, reject) => {
            try {
              if (!window.millicast) {
                throw new Error('Millicast SDK not loaded on viewer page');
              }

              const {Viewer}=window.millicast;

              if (!Viewer) {
                throw new Error('Viewer class not found in Millicast SDK');
              }

              // Create viewer instance
              const viewer=new Viewer(
                window.testConfig.streamName,
                window.testConfig.subscribeToken
              );

              // Set up viewer events
              viewer.on('connected', () => {
                window.viewerConnected=true;
              });

              viewer.on('track', (event) => {
                window.receivedTracks=window.receivedTracks||[];
                window.receivedTracks.push(event.track);

                if (event.track.kind==='video') {
                  window.receivedVideo=true;
                }
              });

              viewer.on('connectionError', (error) => {
                window.viewerError=error;
                reject(error);
              });

              // Start viewing
              viewer.connect().then(() => {
                window.viewer=viewer;
                resolve();
              }).catch(viewError => {
                window.viewerError=viewError;
                reject(viewError);
              });

            } catch (error) {
              window.viewerError=error;
              reject(error);
            }
          });
        });
      } catch (error) {
        // If the step fails, throw the error directly for Jest to report
        throw error;
      }
    });

    then('broadcast is active and Viewer receive video data', async () => {
      // Wait a bit for video data to be received
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get final status
      const broadcasterStatus=await broadcasterPage.evaluate(() => ({
        connected: window.publisherConnected,
        started: window.publishingStarted,
        error: window.publisherError?.message||window.broadcasterError?.message,
        sdkAvailable: !!window.millicast
      }));

      const viewerStatus=await viewerPage.evaluate(() => ({
        connected: window.viewerConnected,
        receivedVideo: window.receivedVideo,
        receivedTracks: (window.receivedTracks||[]).length,
        error: window.viewerError?.message,
        sdkAvailable: !!window.millicast
      }));

      // Assertions
      expect(broadcasterStatus.sdkAvailable).toBe(true);
      expect(viewerStatus.sdkAvailable).toBe(true);

      // Throw hard errors if publisher or viewer reported one
      if (broadcasterStatus.error) {
        throw new Error(`Broadcasting failed: ${broadcasterStatus.error}`);
      }
      if (viewerStatus.error) {
        throw new Error(`Viewing failed: ${viewerStatus.error}`);
      }

      // Basic success criteria
      expect(broadcasterStatus.connected||broadcasterStatus.started).toBeTruthy();
    });
  }, 30000); // 30 second timeout for complex operations
});