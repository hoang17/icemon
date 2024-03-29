/*
  open terminal run:
    browserify main.js > bundle.js
  open index.html and check the log for test result
*/

// @flow
'use strict';

const iceServers = [
  { url: 'stun:global.stun.twilio.com:3478?transport=udp' },
  {url: "stun:stun.l.google.com:19302"},
  {url:"stun:stun.services.mozilla.com"},
  {url:'stun:stun.ekiga.net'},
  {url:'stun:stun.ideasip.com'},
  {url:'stun:stun.schlund.de'},
  {url:'stun:stun1.l.google.com:19302'},
  {url:'stun:stun2.l.google.com:19302'},
  {url:'stun:stun3.l.google.com:19302'},
  {url:'stun:stun4.l.google.com:19302'},
  {url:'stun:stun.voiparound.com'},
  {url:'stun:stun.voipbuster.com'},
  {url:'stun:stun.voipstunt.com'},
  {url:'stun:stun.voxgratia.org'},
  {url:'stun:23.21.150.121'},
  {
    url: 'turn:188.166.191.174:3478',
    credential: 'otoke123',
    username: 'client'
  },
  {
  	url: 'turn:numb.viagenie.ca',
  	credential: 'youcal123',
  	username: 'jinnguyen019@gmail.com'
  },
  {
    url: 'turn:numb.viagenie.ca',
    credential: '123123',
    username: 'lehuyhoang117@gmail.com'
  },
]

var stunturncheck = require('stunturncheck');

var items = []

for (var i = 0, len = iceServers.length; i < len; i++) {
  var item = iceServers[i]
  if (item.uris){
    item.uris.forEach(function(url){
      items.push({
        username: item.username,
        credential: item.password,
        url: url
      })
    })
  }
  else {
    items.push(item)
  }
}

console.log('********* TEST 1: CHECK BOTH STUN & TURN *********');

items.forEach(function (item) {
  stunturncheck(item, function(err, res) {
      if (err) {
          console.error(item.url + (item.username ? ':' + item.username : ''), err)
          return;
      }
      if (res > 0) {
          // a stun server could be reached and the local description
          // contains srflx (for stun) or relay (for turn) candidates.
          console.log(item.url + (item.username ? ':' + item.username : ''), 'ok')
      } else {
          // stun server could not be reached, port may be blocked.
          console.error(item.url + (item.username ? ':' + item.username : ''), 'failed')
      }
  });
})


console.log('********** TEST 2 CHECK TURN ONLY ************');

items.forEach(function (item) {
  if (item.url.substring(0,4) == 'turn'){
    checkTURNServer(item).then(function(bool){
      if (bool){
        console.log(item.url + (item.username ? ':' + item.username : ''), 'ok')
      }
      else {
        console.error(item.url + (item.username ? ':' + item.username : ''), 'failed')
      }
    }).catch(console.error.bind(console));
  }
})


function checkTURNServer(turnConfig, timeout){

  return new Promise(function(resolve, reject){

    setTimeout(function(){
        if(promiseResolved) return;
        resolve(false);
        promiseResolved = true;
    }, timeout || 5000);

    var promiseResolved = false
      , myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection   //compatibility for firefox and chrome
      , pc = new myPeerConnection({iceServers:[turnConfig]})
      , noop = function(){};
    pc.createDataChannel("");    //create a bogus data channel
    pc.createOffer(function(sdp){
      if(sdp.sdp.indexOf('typ relay') > -1){ // sometimes sdp contains the ice candidates...
        promiseResolved = true;
        resolve(true);
      }
      pc.setLocalDescription(sdp, noop, noop);
    }, noop);    // create offer and set local description
    pc.onicecandidate = function(ice){  //listen for candidate events
      if(promiseResolved || !ice || !ice.candidate || !ice.candidate.candidate || !(ice.candidate.candidate.indexOf('typ relay')>-1))  return;
      promiseResolved = true;
      resolve(true);
    };
  });
}
