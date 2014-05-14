(function (Popcorn) {

  Popcorn.plugin( "transcript", function( options ) {
    var CLASS_PREFIX = 'popcorn-transcript-',
        JUMP_EVENT   = 'JumpToCueClicked';

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
    }

    /**
     * Given a certain time, scrolls down to the relevant position in the
     * given list
     */
    function scrollToTime( list, time ) {

    }

    function buildListFromCues( cues ) {
        list = document.createElement('ol');
        list.classList.add(CLASS_PREFIX + 'cuelist');

        for( var i = 0; i<cues.length; i++) {
          
          var item = document.createElement('li'),
              text = document.createTextNode(cues[i].text),
              jump = document.createElement('button');

          jump.classList.add(CLASS_PREFIX + 'jump');
          item.classList.add(CLASS_PREFIX + 'cue');

          item.appendChild(jump);
          item.appendChild(text);
          item.dataset = {cue: cues[i]}
          list.appendChild(item);

          jump.addEventListener('click', function jumpClicked() {
            
            var ev     = document.createEvent('CustomEvent');
            ev.type    = JUMP_EVENT;
            ev.detail  = item.dataset;
            ev.bubbles = true;
            jump.dispatchEvent(ev);

          });
        }
    }

    return {
      
      _setup: function( options ) {
        var cues       = getCues( this ),
            list       = buildListFromCues( cues ),
            lastTime   = null,
            autoScroll = true;

        this.on('timeupdate', function(){
          if(!autoscroll || lastTime === this.currentTime) {
            return;
          }

          scrollToTime(list, this.currentTime);
        });
        
        Popcorn.dom.find(options.target).appendChild(list);
      },

      start: function( options ) { },
      end: function( options ) { },
       _teardown: function( options ) {}
    }
  });
})(Popcorn);
