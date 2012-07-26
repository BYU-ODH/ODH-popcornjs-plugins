/**
 * This plugin will skip past a certain portion of a video.
 * Helpful if you want to ignore a specific timeframe or implement a (patently) weak
 * censoring system.
 * 
 * - start is the time you wish to start skipping
 * - end is the time you wish to resume playback
 * @param {Object} options
 * 
 * Example (jumps from 30-50 seconds):
 * 
 * var p = Popcorn( "#video" )
 *     .skip({
 *         start: 30,
 *         end: 50
 *     });
 *   });
 */
(function (Popcorn) {
   Popcorn.plugin( "skip", function( options ){
       
       var pop = this;
       
       /**
        * Jumps ahead to a specified time.
        * This is specified as a separate function for ease-of-use with binding
        * and unbinding.
        */
       function skip(){
           pop.currentTime(options.end);
       }
       
       return {
            // Define a manifest for the butter authoring tool to use
            manifest: {
                // Plugin meta data
                // will be used in the butter ui
                about:{
                    name: "Skip Segment"
                },
                // Object representation of the plugin options
                // a form will be constructed against this object
                options:{
                    start : {elem:'input', type:'text', label:'Skip From'},
                    end : {elem:'input', type:'text', label:'To'}
                }
            },
            /**
             * Skips to the end and set a timeupdate listener to skip to the end if
             * someone is seeking
             */
            start: function( event, options ){
                skip();
                this.on('timeupdate',function(){
                    skip()
                });
            },
            /**
             * Unbinds timeupdate listener
             */
            end: function( options ){
                this.off('timeupdate',function(){
                    skip()
                });
            },
            /**
             * Takes care of any cleanup if this plugin is removed, namely unbinding
             * the timeupdate listener
             */
            _tearDown: function( options ){
                this.off('timeupdate',function(){
                    skip()
                });
            }
       }
   });
})(Popcorn);