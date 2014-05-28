/**
 * TODO: rewrite DOM creation methods to HTML string
 * TODO: this currently has to run AFTER the text tracks have loaded. Maybe just
 * run the Popcorn VTT parser instead of trying to use native tracks
 *
 * Available languages (per ARCLITE)
 *
 * English  French(fr)
 * English  German (de)
 * English  Italian(it)
 * English  Spanish(es)
 * English  Dutch (nl)
 * English  Chinese (zh)
 * English  Hebrew (he)
 * English  Portuguese(pt)
 * English  Swedish(sv)
 * English  Russian(ru)
 * English  Japanese (ja)
 * English  Korean (ko)
 *
 * Options:
 *  target: Where to place the transcript
 *  api: The location of the dictionary API (see https://github.com/BYU-ARCLITE/DictionaryLookup),
 *  srcLang: the source language
 *  destLang: the language to translate into (defaults to English)
 *
 * Example:
 *  pop.transcript({
 *    target: "elementID",
 *    api: "http://www.example.com/api/v1/",
 *    srcLang: "zh",
 *    destLang: "en"
 *  });
 */
(function (Popcorn) {
  "use strict";
  var CLASS_PREFIX      = 'popcorn-transcript-',
      JUMP_EVENT        = 'CueJumpClicked',
      SELECT_EVENT      = 'TextSelected',
      CONTROL_EVENT     = 'AutoscrollChanged',
      LOAD_INTERVAL     = 250, // the length of time to wait in-between checking to see if cues have loaded, in ms
      SCROLL_INTERVAL   = 50, // lower is faster
      SCROLL_STEP       = 5;  // higher is faster, lower is smoother
  
  Popcorn.plugin( "transcript", function() {
    var defs         = null, // definitions
        list         = null,
        controls     = null,
        autoscroll   = true,
        popEvents    = [],
        loadItvl     = null, // the result of setInterval while we wait for the tracks to load
        nativeEvents = [];

    return {
      _setup: function( options ) {
        var that = this;
        loadItvl = setInterval(function tryToGetCues() {
          var cues = getCues( that );
          if(cues.length) {
            window.clearInterval( loadItvl );
            initialize.call(that, options, cues);
          }
        }, LOAD_INTERVAL);
      },

      start: function( options ) {},

      end: function( options ) {},

      _teardown: function( options ) {
        window.clearInterval(loadItvl);

        defs.remove();
        list.remove();
        controls.remove();
        popEvents.forEach(this.removeTrackEvent);
        nativeEvents.forEach(function removeCueEvents(data) {
          data.cue.removeEventListener(data.type, data.e);
        });
      }
    };
    
    function initialize( options, cues ) {
      options.destLang = options.destLang || 'en';

      var cues        = getCues( this ),
          that        = this,
          phrase      = document.createElement('dt');

      list     = buildListFromCues( cues );
      defs     = document.createElement('div');
      controls = buildControls();

      var clearBtn = document.createElement('button');
      var defList  = document.createElement('dl');

      clearBtn.innerHTML = 'Clear';
      clearBtn.classList.add(CLASS_PREFIX + 'clear-definitions');

      defs.appendChild(clearBtn);
      defs.appendChild(defList);
      defs.classList.add(CLASS_PREFIX + 'definition');
      defList.appendChild(phrase);

      controls.addEventListener( CONTROL_EVENT, function handle(e) {
        autoscroll = e.detail;
      });

      clearBtn.addEventListener( 'click', function empty() {
        clearDefinitions(defList);
        defs.classList.remove('active');
      });

      var events = addTrackListeners(this, cues, function handleCueChange(track, index, active) {
        var activeCount = list.querySelectorAll('.active').length;

        if(active) {
          var scroll = (autoscroll && activeCount === 0); // don't scroll if we still have a track showing
          markActiveTrack(list, index, scroll);
        }else{
          clearTrack(list, index);
        }
      });
      nativeEvents = nativeEvents.concat(events.nativeEvents);
      popEvents    = popEvents.concat(events.popEvents);

      list.addEventListener(JUMP_EVENT, function handleJump(e) {
        disableScroll();
        clearTrack(list, -1);
        that.currentTime(e.detail.startTime);
      });

      list.addEventListener(SELECT_EVENT, function handleSelect(e) {
        defs.classList.add('active');
        clearDefinitions( defList );
        phrase.innerText = 'Loading...';
        disableScroll();

        define(options, e.detail, function success( data ) {
          phrase.innerText = e.detail;
          addDefinitions( defList, data.entries );
        }, function error( data ) {
          phrase.innerText = 'No entry found for "' + e.detail + '"';
        });
      });

      var fragment = document.createDocumentFragment();
      fragment.appendChild(defs);
      fragment.appendChild(controls);
      fragment.appendChild(list);

      Popcorn.dom.find(options.target).appendChild(fragment);
    };

    function disableScroll() {
      autoscroll = false;
      controls.querySelector('input').checked = false;
    };
  });

  function define( options, text, success, error ) {
    var request = new XMLHttpRequest();
    var qstr = 'lookup?srcLang=' + options.srcLang + '&destLang=' +
          options.destLang + '&word=' + text;

    request.open('GET', options.api + encodeURI(qstr));
    request.onreadystatechange = function() {
      if(request.readyState !== 4) {
        return;
      }
      if(request.status !== 200) {
        if(typeof error === 'function') {
          error();
        }
        return;
      }
      if(typeof success === 'function') {
        var data = JSON.parse(request.responseText);
        if(!data.success) {
          error(data);
          return;
        }
        success(data);
      }
    };
    request.send();
  };

  function buildControls() {
    var div = document.createElement('div');
    div.innerHTML = '<label class=' + CLASS_PREFIX + 'toggle-scroll>' +
                    '<input type=checkbox checked> Auto-Scroll</label>'; 
    
    div.querySelector('input').addEventListener('change', function handle() {
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent(CONTROL_EVENT, true, true, this.checked);
      this.dispatchEvent(e);
    }); 

    return div.childNodes[0];
  };

  /**
   * Helper function for getCues, for use when there are native subtitles
   */
  function _getCuesFromVideo( video ) {
    var track = null;

    for(var i=0; i<video.textTracks.length && !track; i++) {
      if( video.textTracks.item(i).mode === 'showing' ) {
        track = video.textTracks.item(i);
      }
    }
    if(!track) {
      return [];
    }

    return track.cues;
  };

  /**
   * Helper function for getCues, for use when there are Popcorn
   * subtitles in play
   */
  function _getCuesFromPopcorn( popcorn ) {
    if(!popcorn.getTrackEvents().length) {
      return [];
    }

    var re     = new RegExp(/^\d{2}:\d{2}:\d{2}.\d{3} --> \d{2}:\d{2}:\d{2}.\d{3}$/),
        proto  = popcorn.getTrackEvent(lastID).constructor.prototype,
        lastID = popcorn.getLastTrackEventId();

    // popcorn uses "start" instead of startTime.
    // this allows startTime to reference start.
    Object.defineProperty(proto, "startTime", {
      get: function getStartTime() {
        return this.start;
      }
    });

    Object.defineProperty(proto, "endTime", {
      get: function getEndTime() {
        return this.end;
      }
    });
   
    // only return subtitle plugin tracks 
    return popcorn.getTrackEvents().filter(function isSubtitle(ev) {
      return re.test(ev.id);
    });
  };
 
  /**
   * Returns an array-like object of text cue objects in this format:
   * { 
   *   0: {startTime: SECONDS.MILLISECONDS, endTime: SECONDS.MILLISECONDS, text: TEXT_OF_CUE},
   *   …
   *   n: {startTime: SECONDS.MILLISECONDS, endTime: SECONDS.MILLISECONDS, text: TEXT_OF_CUE},
   *   length: n
   * ] 
   */
  function getCues( popcorn ) {
    
    if(typeof popcorn.media.addTextTrack === 'function') {
      return _getCuesFromVideo( popcorn.media );
    }

    return _getCuesFromPopcorn( popcorn );
  };

  /**
   * Scrolls the given element to the given offset
   * @param element the element to scroll
   * @param offset the position to scroll to
   * @param step how much to jump with each movement
   * @param interval how many milliseconds in-between steps
   */
  function scrollElement( element, offset, step, interval) {
    var interval = window.setInterval(function smoothScroll(){
      var current = element.scrollTop;
      if(current + step >= offset) {
        element.scrollTop = offset;
        window.clearInterval(interval);
      }
      else
      {
        element.scrollTop += SCROLL_STEP;
      }
      // the element apparently isn't scrolling. abort! abort!
      if(element.scrollTop === current) {
        window.clearInterval(interval);
      }
    }, interval);
  };

  /**
   * Given a certain time, scrolls down to the relevant position in the
   * given list and marks all relevant cues with an active class
   *
   * @param list the element containing cue items
   * @param index the track to mark as active
   * @param scroll whether or not to scroll
   */
  function markActiveTrack( list, index, scroll ) {
    var hasScrolled = false,
        nodes = list.childNodes,
        item = nodes[index];
    
    item.classList.add('active');
        
    if(scroll && !hasScrolled) {
      hasScrolled = true; // if there are overlapping tracks, don't scroll past the first one
      // show context--i.e., one item before this one
      var offset = nodes[index-1] ? nodes[index-1].offsetTop : item.offsetTop;
      scrollElement( list, offset, SCROLL_STEP, SCROLL_INTERVAL );
    }
  };

  /**
   * Specifies that the given track should no longer be marked as 'active'
   * @param list the element containing cue items
   * @param index the track to mark as active. If -1, clears all
   */
  function clearTrack( list, index ) {
    if(index !== -1) {
      list.childNodes[index].classList.remove('active');
    }
    else
    {
      var active = list.querySelectorAll('.active');
      for(var i = 0; i<active.length; i++) {
        active[i].classList.remove('active');
      }
    }
  };

  /**
   * Given a list of cues, creates an ordered list and returns it
   */
  function buildListFromCues( cues ) {
      var html = '<ol style="position:relative" class=' + CLASS_PREFIX + 'cuelist>';

      for( var i = 0; i<cues.length; i++) {
        var unselectable = '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none';
        html += '<li class=' + CLASS_PREFIX +'cue>' + 
             '<button unselectable=on class='+ CLASS_PREFIX +'jump ' +
                     'style="' + unselectable + '">Go</button>' +
             '<q>' + cues[i].text + '</q></li>';

      }
      html += '</ol>';

      var div = document.createElement('div');
      div.innerHTML = html;

      var list = div.childNodes[0];
      var items = list.querySelectorAll('li');
      

      for( var i = 0; i<items.length; i++ ) {
        var item  = items[i],
            jump  = item.querySelector('button'),
            quote = item.querySelector('q');

        item.cue = cues[i];

        // the IIFE is crucial, because otherwise the event listeners'
        // closures reference incorrect items
        (function(jump, item){ 
          jump.addEventListener('click', function jumpClicked() {
            
            var e     = document.createEvent('CustomEvent');
            e.initCustomEvent(JUMP_EVENT, true, true, item.cue);
            jump.dispatchEvent(e);

          });

          // TODO: Should we attach this on the list and not use a custom
          // event?
          quote.addEventListener('mouseup', function quoteClicked() {
            var text = window.getSelection().toString();

            if(!text) {
              return;
            }
            
            var e     = document.createEvent('CustomEvent');
            e.initCustomEvent(SELECT_EVENT, true, true, text);
            jump.dispatchEvent(e);
            
          });
        })(jump, item);
      }
      return list;
  };

  function clearDefinitions( definitionList ) {
    definitionList.querySelector('dt').innerHTML = '';
    var defs = definitionList.querySelectorAll('dd');
    for(var i = 0; i<defs.length; i++) {
      defs[i].remove();
    }
  };

  function addDefinitions( definitionList, definitions ) {
    definitions.forEach(function addDef(definition) {
      var dd = document.createElement('dd');
      dd.innerText = definition;
      definitionList.appendChild(dd);
    });
  };

  /**
   * Applies the callback function to the given cues
   * @param pop the popcorn instance this applies to
   * @param tracks An array-like object of either TextTracks or Popcorn TrackEvents
   * @param callback A function called when the track is turned on or off:
   * @return An object of events (if created) that should be deleted on teardown
   * Example:
   *  var result = addTrackListeners( [track1,track2,...,trackn], function handle(track, active) {
   *    // track is the track that caused the event
   *    // active states whether or not the track is being used
   *  });
   *
   *  contents of result: {popcornEvents: [...], nativeEvents: [{track: TrackEvent, e: Function, type: 'cuechange'}]}
   */
  function addTrackListeners( pop, tracks, callback ) {
    if(!tracks.length) { return []; }
    var isNative = tracks[0] instanceof window.VTTCue;
    var response = {popEvents: [], nativeEvents: []};
    var pops = response.popEvents;
    var nats = response.nativeEvents;

    for(var i = 0; i<tracks.length; i++) {
      var cue = tracks[i];
      (function attachEvent(cue, index){
        function handleEnter() { callback(cue, index, true);  };
        function handleExit()  { callback(cue, index, false); };

        if(isNative) {
          cue.addEventListener('enter', handleEnter);
          cue.addEventListener('exit', handleExit);
          nats.push({"cue": cue, "e": handleEnter, "type": 'enter'});
          nats.push({"cue": cue, "e": handleExit, "type": 'exit'});
        }
        else
        {
          pops.push(pop.cue(track.startTime, function(){callback(track, index, true)}));
          pops.push(pop.cue(track.endTime, function(){callback(track, index, false)}));
        }
      }(cue, i));
    }
    return response;
  };

})(Popcorn);
