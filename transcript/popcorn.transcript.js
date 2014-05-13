(function (Popcorn) {
  

  Popcorn.plugin( "transcript", function( options ) {
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

      var re = new RegExp(/^\d{2}:\d{2}:\d{2}.\d{3} --> \d{2}:\d{2}:\d{2}.\d{3}$/),
          lastID = popcorn.getLastTrackEventId(),
          proto = popcorn.getTrackEvent(lastID).constructor.prototype;

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
        list = document.createElement('ol'),
        for( var i = 0; i<cues.length; i++) {
          var item = document.createElement('li'),
              text = document.createTextNode(cues[i].text);
          item.appendChild(text);
          item.dataset = {cue: cues[i]}
          list.appendChild(item);
        }
    }

    return {
      
      _setup: function( options ) {
        var cues       = getCues( this ),
            autoScroll = true,
            lastTime = null,
            list = buildListFromCues( cues );

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