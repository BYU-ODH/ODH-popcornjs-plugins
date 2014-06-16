/**
 * NB: This is a copy of Scott Downe's Subtitle Plugin that has been modified
 * for the following purposes
 * 
 * 1. To cause overlapping subtitle tracks to be displayed on top of each
 *    other, instead of inline
 *
 * 2. To add a toString() method to the options object, for improved clarity
 *    when editing subtitles in Butter
 *
 * 3. To work in full screen
 *
 * 4. To position subtitles correctly when using Video.js
 *
 * 5. To utilize requestAnimationFrame. We don't want to position subtitles
 *    when we don't need to.
 *
 * 6. To add a class to the subtitle container, for CSS purposes
 */

(function ( Popcorn ) {

  window.requestAnimationFrame = window.requestAnimationFrame       ||
                                 window.mozRequestAnimationFrame    ||
                                 window.webkitRequestAnimationFrame ||
                                 window.msRequestAnimationFrame;

  var i = 0,
      createDefaultContainer = function( context, id ) {

        var ctxContainer = context.container = document.createElement( "div" ),
            style    = ctxContainer.style,
            media    = context.media,
            parentEl = media.parentElement,
            vjs      = parentEl.querySelector('.vjs-control-bar');

        ctxContainer.classList.add('popcorn-subtitle-container');

        var updatePosition = function() {
          var position = context.position();
          // the video element must have height and width defined
          style.fontSize = "18px";
          style.width = media.offsetWidth + "px";

          if(vjs) { // place above videojs control bar
            style.top = vjs.offsetTop - ctxContainer.offsetHeight - 40 + "px";
          }
          else
          {
            style.top = position.top  + media.offsetHeight - ctxContainer.offsetHeight - 40 + "px";
          }
          style.left = position.left + "px";

          window.requestAnimationFrame(updatePosition);
        };

        ctxContainer.id = id || Popcorn.guid();
        style.zIndex = 2147483647; // just enough to display on full-screen
        style.position = "absolute";
        style.color = "white";
        style.textShadow = "black 2px 2px 6px";
        style.fontWeight = "bold";
        style.textAlign = "center";

        window.requestAnimationFrame(updatePosition);

        context.media.parentNode.appendChild( ctxContainer );

        return ctxContainer;
      };

  /**
   * Subtitle popcorn plug-in
   * Displays a subtitle over the video, or in the target div
   * Options parameter will need a start, and end.
   * Optional parameters are target and text.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Target is the id of the document element that the content is
   *  appended to, this target element must exist on the DOM
   * Text is the text of the subtitle you want to display.
   *
   * @param {Object} options
   *
   * Example:
     var p = Popcorn('#video')
        .subtitle({
          start:            5,                 // seconds, mandatory
          end:              15,                // seconds, mandatory
          text:             'Hellow world',    // optional
          target:           'subtitlediv',     // optional
        } )
   *
   */

  Popcorn.plugin( "subtitle" , {

      manifest: {
        about: {
          name: "Popcorn Subtitle Plugin",
          version: "0.1",
          author: "Scott Downe",
          website: "http://scottdowne.wordpress.com/"
        },
        options: {
          start: {
            elem: "input",
            type: "text",
            label: "Start"
          },
          end: {
            elem: "input",
            type: "text",
            label: "End"
          },
          text: {
            elem: "textarea",
            label: "Text"
          }
        }
      },

      _setup: function( options ) {
        options.toString = function() {
          return options.text;
        };
        var newdiv = document.createElement( "div" );

        newdiv.id = "subtitle-" + i++;
        newdiv.style.display = "none";

        // Creates a div for all subtitles to use
        !this.container && createDefaultContainer( this );

        // use shared default container
        options.container = this.container;
        

        document.getElementById( options.container.id ) && document.getElementById( options.container.id ).appendChild( newdiv );
        options.innerContainer = newdiv;

        options.showSubtitle = function() {
          if(options.text) {
            options.innerContainer.innerHTML =
              options.text.replace(/\n/g,"<br>");
          }
          else
          {
            options.innerContainer.innerHTML = "";
          }
        };
      },
      /**
       * @member subtitle
       * The start function will be executed when the currentTime
       * of the video  reaches the start time provided by the
       * options variable
       */
      start: function( event, options ){
        options.innerContainer.style.display = "block";
        options.showSubtitle( options, options.text );
      },
      /**
       * @member subtitle
       * The end function will be executed when the currentTime
       * of the video  reaches the end time provided by the
       * options variable
       */
      end: function( event, options ) {
        options.innerContainer.style.display = "none";
        options.innerContainer.innerHTML = "";
      },

      _teardown: function ( options ) {
        options.container.removeChild( options.innerContainer );
      }
  });

})( Popcorn );
