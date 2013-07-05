/**
 * @todo - should try and implement tests against seeking, etc.
 */
test( "Popcorn Mute Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 2,
      startTime = 2,
      endTime = 5;

  expect( expects );

  ok ( "mutePlugin" in popped, "mutePlugin is a method of the popped instance" );
  popped.mutePlugin({
    start: startTime,
    end: endTime
  });
  
  stop();

  popped.cue(startTime, function() {
    ok(popped.muted(), "Sound is muted at " + startTime + " seconds");
    start();
  });

  Popcorn.plugin.debug = true;

  popped.play();

});