# lighthouse-ignore

[![npm version](https://badge.fury.io/js/%40marco-eckstein%2Flighthouse-ignore.svg)](
    https://badge.fury.io/js/%40marco-eckstein%2Flighthouse-ignore
)
[![npm downloads](https://img.shields.io/npm/dt/@marco-eckstein/lighthouse-ignore.svg)](
    https://npm-stat.com/charts.html?package=%40marco-eckstein%2Flighthouse-ignore&from=2018-09-09
)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](
    https://conventionalcommits.org
)

A wrapper around [Lighthouse](https://www.npmjs.com/package/lighthouse) 3.0.3 that allows you to
ignore some audits.

You can configure it to completely ignore audits and/or define a baseline of audits that allows you to
tolerate failures, including thresholds for performance scores.

## Requirements

Lighthouse requires [Google Chrome](https://www.google.de/chrome/).

## Usage

### Configuration

Lighthouse-Ignore is configured with a JSON file. Its default path is `./lighthouse-ignore-config.json`.
[lighthouse-ignore-config.ts](src/main/lighthouse-ignore-config.ts) defines and documents its schema.

Example:

```json
{
    "chromeOptions": {
    },
    "lighthouseOptions": {
        "output": "json"
    },
    "ignored": [
        {
            "auditId": "geolocation-on-start",
            "justification": "The customer requires this."
        }
    ],
    "baseline": [
        {
            "auditId": "link-name",
            "score": 0
        },
        {
            "auditId": "uses-responsive-images",
            "score": 0.86
        },
        {
            "auditId": "first-contentful-paint",
            "score": 0.41
        },
        {
            "auditId": "redirects-http",
            "score": 0
        },
        {
            "auditId": "uses-long-cache-ttl",
            "score": 0.3
        }
    ]
}

```

### Command-line

`lighhouse-ignore <url>`

An example output may be:

```console
Launching Chrome and running Lighthouse audits

76 audits have been successful.

This includes the folowing audits from the baseline, which you may want to remove from the baseline now:
- link-name: Links have a discernible name
- uses-responsive-images: Properly size images: 100%

2 audits where unsuccessful but have fulfilled baseline requirements:
- first-contentful-paint: First Contentful Paint: 50%
- redirects-http: Does not redirect HTTP traffic to HTTPS

2 audits have failed:
- uses-long-cache-ttl: Uses inefficient cache policy on static assets: 23%
- uses-http2: Does not use HTTP/2 for all of its resources

See report file for details. (Opens in Chrome)

```

### API

If you are happy with the command-line features of Lighthouse-Ignore, you probably have no use case
for the API. It is intended for people who need something more elaborate than the provided command-line
but still want to take advantage of some of its functionality in their own Lightouse wrappers.

```javascript
import * as lighthouseIgnore from "@marco-eckstein/lighthouse-ignore";

...

const config = lighthouseIgnore.readLighthouseIgnoreConfig();
lighthouseIgnore.filterLighthouseConfig(lighthouseConfig, config);
```

## Development

No global modules other than `npm` are necessary.

- Run `npm install` once after checking out.
- Then, run either `npm test` for a single full build cycle (clean, compile, lint, test),
  or `npm start` for running the full cycle initially and then watch for file changes which will
  trigger appropriate parts of the build cycle (compile, lint, test). The watch mode is not bulletproof:
  It works for file updates, but you may get problems if you rename or delete files.
- Before bumping the version, make sure the copyright year range in the license file is up to date.
- Run `npm run standard-version` instead of `npm version` to bump the version.
- Publish with `npm publish --access public`. This will run the full build cycle before publishing.
