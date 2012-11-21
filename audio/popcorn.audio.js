/**
 * This plugin will play an audio file, optionally muting the currently-playing media
 * 
 * - start is the time you wish to start playing the audio track
 * - end is the time you wish to stop playing the separate audio track
 * - url is a URL (absolute or relative) to an audio file to play
 * - mute boolean - whether or not to mute the media while playing the given file
 * - clip how many seconds into the audio file to start playing from - defaults to 0
 * @param {Object} options
 * 
 * Examples:
 * 
 * var p = Popcorn( "#video" )
 *     .audio({
 *         start: 30,
 *         end: 50,
 *         url: '../bessie.wav',
 *         mute: false
 *     });
 *   });
 * var p = Popcorn( "#video" )
 *     .audio({
 *         start: 10,
 *         end: 30,
 *         url: 'http://www.example.com/billyraycyrus.mp3',
 *         mute: true,
 *         clip: 4.2
 *     });
 *   });
 */
(function (Popcorn) {
   Popcorn.plugin( "audio", function( options ){
       
       return {
            // Define a manifest for the butter authoring tool to use
            manifest: {
                // Plugin meta data
                // will be used in the butter ui
                about:{
                    name: "Play Audio"
                },
                // Object representation of the plugin options
                // a form will be constructed against this object
                options:{
                    start : {elem:'input', type:'text', label:'Skip From'},
                    end : {elem:'input', type:'text', label:'To'},
                    url : {elem:'input', type:'text', label:'Audio Location'},
                    mute : {elem: 'input', type: 'checkbox', checked: 'checked', label: 'Mute'},
                    clip : {elem: 'input', type: 'text', value: 0, label: 'Clip'}
                }
            },
            /**
             * Appends the audio element to the page
             * @param {Object} options
             */
            _setup: function( options ) {
                options._audio = document.createElement('audio');
                options._audio.setAttribute('src',options.url);
                document.body.appendChild(options._audio);
            },
            /**
             * Plays the audio file
             * @todo
             */
            start: function( event, options ){
                options._audio.currentTime = this.currentTime() + (Number(options.clip) || 0);
                options._audio.play();
            },
            /**
             * Stops playing the audio track and returns the main media to its default muted/unmuted state
             * @param {Object} options
             * @todo
             */
            end: function( event, options ){
                options._audio.pause();
            },
            /**
             * Removes the audio element from the page
             * @param {Object} options
             * @todo
             */
            _tearDown: function( options ){

            }
       }
   });
})(Popcorn);