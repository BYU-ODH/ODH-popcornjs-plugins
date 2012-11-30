(function (Popcorn) {
    
    var extractURL = function(str) {
        if(str.indexOf('yt:') === 0) {
            return "http://www.youtube.com/watch?v=" + str.substr('yt:'.length);
        }
        else
        {
            // @TODO: lose the controls query string thing
            return str + "&controls=1";
        }
    }
    
    /**
       @todo need access to the 
    **/
    Popcorn.parser( "parseVCP", "JSON", function( data ) {
        console.log(arguments);
        // declare needed variables
        var retObj = {
            title: "",
            remote: "",
            data: []
            },
            manifestData = {},
            media = data.media[0];

        window.poppo = retObj.p = Popcorn.smart(this.media.id,extractURL(media.url[0]));

        // @TODO - this 'remote' property is never used by the caller
        retObj.remote = extractURL(media.url[0]);
        Popcorn.forEach( media.tracks, function ( obj, i ) {
            Popcorn.forEach(obj.trackEvents, function( track, j ) {
                var ev = {};
                ev[track.type] = track.popcornOptions;
                retObj.data.push(ev);
            });
        });

        return retObj;
    });
})(Popcorn);
