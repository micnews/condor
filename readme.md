# tracking-script

Track what a user does on a site in csv-format

## Example

Running `node example/server.js` will start an example script on port 1234 that does POST requests whenever an event is tracked, and that event is then printed to the terminal

## Usage

```js
var xhr = require('xhr')
  , track = require('../track')()

  , noop = function () {}

track.ondata = function (csv) {
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

## Data format

### Generic Headers

```
event,windowWidth,windowHeight,scollX,scollY,location,offset,userAgent,referrer,path,clickX,clickY,href,target,visibility,name
```

The data always has columns corresponding to these headers:

* __event__ Describes what event that has occured. Is one of the following:
 * __load__ Emitted when the page has loaded (_window.onload_)
 * __resize__ Emitted everytime a user resize the window (_window.onresize_). All resizing within 500ms are tracked as one resize-event.
 * __scroll__ Emitted everytime a user scroll. All scrolling within 500ms is tracked as one scoll-event.
 * __visibility__ Event describing if the page is visible or not. The initial visibility (when the script was loaded) will have offset 0.
 * __change__ Emitted when a user changes a form (_document.onchange_)
 * __click__ Emitted when a user clicks on the page
 * __end__ Emitted when a user ends its session on a page, e.g. closes the window or click on a link.
* __windowWidth__ The width of the users window (Number in px)
* __windowHeight__ The height of the users window (Number in px)
* __scrollX__ How far the user has scrolled (horizontally)
* __scrollY__ How far the user has scrolled (vertically)
* __location__ The page the user is on (_window.location_)
* __offset__ Time (in ms) that has gone by since tracking was initiated
* __userAgent__ The useragent the user has (_navigator.userAgent_)
* __referrer__ The referrer header (_document.referrer_)
* __path__ The css-path describing the DOM-element (if available). For _click_ events this is the element clicked, for _change_ events this is the element changed
* __clickX__ The x-coordinate on the page that was clicked. Only applicable for _click_ events.
* __clickY__ The y-coordinate on the page that was clicked. Only applicable for _click_ events.
* __href__ The href-attribute on the a DOM-element associated with the DOM-element that was clicked. Only applicable for _click_ events.
* __target__ The target-attribute on the a DOM-element associated with the DOM-element that was clicked. Only applicable for _click_ events.
* __visibility__ String describing if the page was visible or not. Can be one of `visible` or `hidden`. Only applicable for _visibility_ events.
* __name__ The name-attribute on the DOM-element that was changed. Only applicable for _change_ events.
