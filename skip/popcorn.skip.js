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
   Popcorn.plugin( "skip", (function(){
       
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
                    end : {elem:'input', type:'text', label:'To'},
                    target : {hidden: true}
                }
            },
            _setup: function( options ){
                var pop             = this,
                    hasDisabledList = ( (pop.data && pop.data.disabled) !== undefined );

                options._skip = function() {

                    /**
                     * Normal operation would be based in the start/end methods.
                     * When a Popcorn instance has a disabled plugin, its start
                     * methods aren't called. Since we're using a timeupdate we need
                     * to check to make sure skipping hasn't been explicitly disabled.
                     * 
                     * I'm not sure if all Popcorn versions contain pop.data.disabled,
                     * which is why I've created the boolean hasDisabledList
                     */
                    if( hasDisabledList && pop.data.disabled.skip ) {
                        return;
                    }

                    var ct = pop.currentTime();
                    if (ct >= options.end || ct < options.start) {
                        return;
                    }
                    pop.currentTime(options.end);
                };
                
                pop.on( "timeupdate", options._skip );
            },

            start: function( event, options ){
            },

            end: function( event, options ){
            },

            /**
             * Takes care of any cleanup if this plugin is removed, namely unbinding
             * the timeupdate listener
             */
            _teardown: function( options ){
                this.off('timeupdate', options._skip ); // cf. this.on, where we have to pass the actual function
            }
       }
   })());
})(Popcorn);
