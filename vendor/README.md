# Vendored libraries

Served from this repository instead of a CDN, so the AR pages do not depend on a third-party host
at runtime and the exact bytes are under version control.

| File | Package | Version | License |
| --- | --- | --- | --- |
| `aframe-1.5.0.min.js` | aframe (`dist/aframe-master.min.js`) | 1.5.0 | MIT |
| `mindar-image-aframe-1.2.5.prod.js` | mind-ar | 1.2.5 | MIT |
| `mindar-face-aframe-1.2.5.prod.js` | mind-ar | 1.2.5 | MIT |
| `model-viewer-4.3.1.min.js` | @google/model-viewer | 4.3.1 | Apache-2.0 |

Note: the face tracker still downloads MediaPipe's WASM runtime (jsDelivr) and face model
(storage.googleapis.com) at runtime; that is built into mind-ar and documented on the privacy page.

To update: `npm pack <package>@<version>`, copy the same `dist` file here, bump the file name and
the `<script src>` in the AR pages.
