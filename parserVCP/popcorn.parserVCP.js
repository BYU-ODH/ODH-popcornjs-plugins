(function (Popcorn) {
    
    var extractURL = function(str) {
        if(str.indexOf('yt:') === 0) {
            return "http://www.youtube.com/watch?v=" + str.substr('yt:'.length);
        }
        else
        {
            return str;
        }
    }
    
    Popcorn.parser( "parseVCP", "JSON", function( data, p ) {
        // declare needed variables
        var retObj = {
            title: "",
            remote: "",
            data: []
            },
            manifestData = {},
            media = data.media[0];

        retObj.p = Popcorn.youtube(p.media,extractURL(media.url[0]));
//        this = Popcorn.smart(extractURL(media.url[0]));

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