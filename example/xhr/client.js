//run the xhr client, overriding the default path
require('../../xhr')({path: '/condor'})

// if you have installed condor with npm
// then this will look like:
//   require('condor/xhr')({path: '/condor'})
// instead.
