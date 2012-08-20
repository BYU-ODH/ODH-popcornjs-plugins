Popcorn.parser( "parseVCP", "JSON", function( data ) {

    // declare needed variables
    var retObj = {
        title: "",
        remote: "",
        data: []
        },
        manifestData = {},
        media = data.media[0];

    retObj.remote = media.id;
    Popcorn.forEach( media.tracks, function ( obj, i ) {
        Popcorn.forEach(obj.trackEvents, function( track, j ) {
            var ev = {};
            ev[track.type] = track.popcornOptions;
            retObj.data.push(ev);
        });
    });

    return retObj;
});