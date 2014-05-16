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

  Popcorn.plugin( "transcript", function() {
    var CLASS_PREFIX      = 'popcorn-transcript-',
        JUMP_EVENT        = 'CueJumpClicked',
        SELECT_EVENT      = 'TextSelected',
        SCROLL_INTERVAL   = 50, // lower is faster
        SCROLL_STEP       = 2;  // higher is faster, lower is smoother

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
     * given list
     */
    function scrollToTime( list, time ) {
      for(var i=0; i<list.childNodes.length; i++) {
        var item = list.childNodes[i],
            cue = item.cue;

        if(time >= cue.startTime && time <= cue.startTime) {
          var offset = item.offsetTop;
          scrollElement( list, item.offsetTop, SCROLL_STEP, SCROLL_INTERVAL );
          return;
        }
      }
    };

    /**
     * Given a list of cues, creates an ordered list and returns it
     */
    function buildListFromCues( cues ) {
        list = document.createElement('ol');
        list.classList.add(CLASS_PREFIX + 'cuelist');

        for( var i = 0; i<cues.length; i++) {
          var item  = document.createElement('li'),
              jump  = document.createElement('button'),
              quote = document.createElement('q');

          jump.setAttribute('unselectable', 'on');
          jump.setAttribute('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none');
          jump.classList.add(CLASS_PREFIX + 'jump');
          jump.innerText = 'Go';
          item.classList.add(CLASS_PREFIX + 'cue');
          quote.innerHTML = cues[i].text;

          item.appendChild(jump);
          item.appendChild(quote);
          item.cue = cues[i];
          list.appendChild(item);

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
    }

    return {
      
      _setup: function( options ) {
        options.destLang = options.destLang || 'en';

        var cues       = getCues( this ),
            list       = buildListFromCues( cues ),
            phrase     = document.createElement('dt'),
            defList    = document.createElement('dl'),
            lastTime   = null,
            autoscroll = true,
            that       = this;


        defList.classList.add(CLASS_PREFIX + 'definition');
        defList.appendChild(phrase);

        function define( text, success, error ) {
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

        list.addEventListener(JUMP_EVENT, function handleJump(e) {
          that.currentTime(e.detail.startTime);
        });

        list.addEventListener(SELECT_EVENT, function handleSelect(e) {
          clearDefinitions( defList );
          phrase.innerText = 'Loading...';

          define(e.detail, function success( data ) {
            phrase.innerText = e.detail;
            addDefinitions( defList, data.entries );
          }, function error( data ) {
            phrase.innerText = 'ERROR';
          });
        });

        /**
         * TODO: for native cues, use TextTrack.oncuechange
         */
        this.on('timeupdate', function(){
          if(!autoscroll || lastTime === that.currentTime) {
            return;
          }

          scrollToTime(list, that.currentTime);
        });

        var fragment = document.createDocumentFragment();
        fragment.appendChild(defList);
        fragment.appendChild(list);

        options._defList = defList;
        options._list = list;
       
        Popcorn.dom.find(options.target).appendChild(fragment);
      },

      start: function( options ) {},

      end: function( options ) {},

      _teardown: function( options ) {
        var target = Popcorn.dom.find(options.target);
        target.remove(options._defList);
        target.remove(options._list);
      }
    };
  });
})(Popcorn);
