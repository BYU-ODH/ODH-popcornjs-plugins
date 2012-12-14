/***
 This is a file that serves as a temporary fix to the problem of not being able to load up
 video files in parsers. Until that is fixed, we need to have a helper method to load
 videos from a data file.

 The issue of being unable to load up a video based on a data file's contents can be found here:

 (Note: Ticket numbers are the Mozilla team's)

 #1299 https://webmademovies.lighthouseapp.com/projects/63272/tickets/1299-json-parser-with-video-files
 #1021 https://webmademovies.lighthouseapp.com/projects/63272/tickets/1021-swapping-players-media-at-runtime
***/
(function (Popcorn) {
    var extractURL = function(str) {
           if(str.indexOf('yt:') === 0) {
              return "http://www.youtube.com/watch?v=" + str.substr('yt:'.length) + "&controls=1";
           }
           else
           {
              // @TODO: lose the controls query string thing
              // (this ensures that a YouTube video will come back with controls)
              return str + (str.indexOf("?") != -1 ? "" : "?") + "&controls=1";
           }
    }

    Popcorn.loadVCP = function( element_id, vcp_url, callback )
    {
        Popcorn.xhr({
            url: vcp_url,
            dataType: "JSON",
            success: function( response ){
                var media = response.media[0];
                var pop = Popcorn.smart( element_id, extractURL( media.url[0]) );

                if( typeof callback === "function" ) {
                    pop.parseVCP( vcp_url );
                    callback.call( pop );
                }
            }
        });
    }
})(Popcorn);
