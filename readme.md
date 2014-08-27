# condor

Track what a user does on a site in csv-format

[![NPM](https://nodei.co/npm/condor.png?downloads&stars)](https://nodei.co/npm/condor/)

[![NPM](https://nodei.co/npm-dl/condor.png)](https://nodei.co/npm/condor/)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/mic-condor.svg?auth=adcabc92c3b9ffe4987e7efc3925a23b)](https://saucelabs.com/u/mic-condor)

## Example

See the example folder for examples of how to use condor.

## Usage

```js
var xhr = require('xhr')
  , track = require('../condor')({
        // default 500ms
        // set for how long time scroll & resize events should be
        // [debounced](https://www.npmjs.org/package/debounce)
        // The `duration`-attribute is the last of these events.

        debounceTime: 300
    })

  , noop = function () {}

track.onevent = function (csv) {
  // this callback is called everytime an event happens
  // the data is a line of csv, see below for information on the format of the
  // csv
  xhr({
      method: 'POST'
    , body: csv
    , uri: '/track'
  }, noop)
}

// this gets called by beforeunload - so anything in here must be synchronous
track.onend = function (csv) {
  // this will be an end-event - meaning that the visit on the page has ended
  xhr({
      method: 'POST'
    , body: csv
    , uri: '/track'
    , sync: true
  }, noop)
}
```

The callback to './track' gets called everytime a trackable event occur. _csv_ is the data about the event (see [data-format](#data-format) for details)

## Csv format

Track is done in csv that corresponds to the following headers:

```
eventName,windowWidth,windowHeight,scrollX,scrollY,location,duration,referrer,path,clickX,clickY,href,target,visibility,name,trackableType,trackableValue
```

If not explicitly written out, the columns are always included (when available). For example, there's always a column describing the width of the window and if a referrer exists that's also always included in the events.

* __eventName__ Describes what event that has occured. Is one of the following:
  * __load__ Emitted when the page has loaded (_window.onload_)
  * __resize__ Emitted everytime a user resize the window (_window.onresize_). All resizing within 500ms are tracked as one resize-event.
  * __scroll__ Emitted everytime a user scroll. All scrolling within 500ms is tracked as one scoll-event.
  * __visibility__ Event describing if the page is visible or not. The initial visibility (when the script was loaded) will have duration 0.
  * __change__ Emitted when a user changes a form (_document.onchange_)
  * __click__ Emitted when a user clicks on the page
  * __end__ Emitted when a user ends its session on a page, e.g. closes the window or click on a link.
  * __trackable-load__, __trackable-visible__, __trackable-hover__, __trackable-click__ These events handles dom-elements with special `data-trackable-type` and `data-trackable-value` attributes.
    * __trackable-load__ On load each trackable element is logged with this event
    * __trackable-visible__ Event emitted when a trackable gets visible, e.g. when a user scroll enough to show a trackable element
    * __trackable-hover__ Event emitted when a user hover over a trackable element.
    * __trackable-click__ Event emitted when a user click on a trackable element.
* __windowWidth__ The width of the users window (Number in px)
* __windowHeight__ The height of the users window (Number in px)
* __scrollX__ How far the user has scrolled (horizontally)
* __scrollY__ How far the user has scrolled (vertically)
* __location__ The page the user is on (_window.location_)
* __duration__ Time (in ms) that has gone by since tracking was initiated
* __timestamp__ The time when the event happened (_date.toUTCString()_)
* __timezone__ The timezone (in minutes) the user is in (_date..getTimezoneOffset()_)
* __referrer__ The referrer header (_document.referrer_)
* __path__ The css-path describing the DOM-element (if available). For _click_ events this is the element clicked, for _change_ events this is the element changed. For _trackable-*_ events this is the trackable element.
* __clickX__ The x-coordinate on the page that was clicked (_event.pageX_). Only applicable for _click_ events.
* __clickY__ The y-coordinate on the page that was clicked (_event.pageY_). Only applicable for _click_ events.
* __href__ The href-attribute on the a DOM-element associated with the DOM-element that was clicked. Only applicable for _click_ events.
* __target__ The target-attribute on the a DOM-element associated with the DOM-element that was clicked. Only applicable for _click_ events.
* __visibility__ String describing if the page was visible or not. Can be one of `visible` or `hidden`. Only applicable for _visibility_ events.
* __name__ The name-attribute on the DOM-element that was changed. Only applicable for _change_ events.
* __trackableType__ For _trackable-*_ events this is the string from the `data-trackable-type` attribute.
* __trackableValue__ For _trackable-*_ events this is the string from the `data-trackable-value` attribute