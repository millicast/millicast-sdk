# Millicast Realtime Broadcast SDK for Node.js
<!-- TODO: Add badges: NPM, build, tests, etc. -->
This Software Development Kit (SDK) for Node.js allows developers to simplify Millicast services integration into their own web apps. You can find the latest, most up to date, SDK documentation at our [doc site](https://link-to-docs.com).


<!-- ## Installation
```sh
$ npm install millicast-sdk-js
``` -->

<!-- ## Usage -->

## Packages
This project is built with [Lerna](https://lerna.js.org/) and contains the following packages:

- `millicast-sdk-js`: The SDK itself.
- `millicast-publisher-demo`: Publisher demo page using SDK. You can try this demo [here](https://demo.millicast.com/?codec=h264&nosimulcast).
- `millicast-viewer-demo`: Viewer demo page using SDK.

## Development
Asumming that you have Node 12.10.x or newer and `npm` installed, install the required dependencies running:
```sh
$ npm install
```
### Building packages
As the project is built using [Lerna](https://lerna.js.org/), we can rely on it to manage our packages dependencies, so you just need to run at project's root directory
```sh
$ npm run prepare
```

Next, to build all packages add a `.env` file in both demo packages (`millicast-publisher-demo` & `millicast-viewer-demo`). You can find the following example in `.env.sample`:
```sh
# Make a .env file with the following vars
MILLICAST_STREAM_ID=test
MILLICAST_ACCOUNT_ID=test
MILLICAST_PUBLISH_TOKEN=test
```

Then, build all packages:
```sh
$ npm run build
```

Optionally you can run other Lerna command using `npx lerna [command]`.

### Running demo
If you want to add, fix or edit features in SDK, or just try our demo pages, run:
```sh
$ npm run start
```
It opens in your browser both demos and keep watching changes in all packages, so you only need to refresh both pages if you add changes in code.

### Building docs
The SDK documentation is written with [JSDcos](https://jsdoc.app/), so to build documentation to get HTMLs files run:
```sh
$ npx lerna run build-docs
```

Or if you want to navigate docs in your localhost run:
```sh
$ npx lerna run start-docs --stream
```
In the logs you find the link where you can access to docs. By default is running at http://localhost:5000.



<!-- ## License -->

