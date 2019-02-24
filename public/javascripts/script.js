/* ========================================================================
 * DOM-based Routing
 * Based on http://goo.gl/EUTi53 by Paul Irish
 *
 * Only fires on body classes that match. If a body class contains a dash,
 * replace the dash with an underscore when adding it to the object below.
 *
 * .noConflict()
 * The routing is enclosed within an anonymous function so that you can
 * always reference jQuery with $, even when in .noConflict() mode.
 * ======================================================================== */

(function($) {

    // Use this variable to set up the common and page specific functions. If you
    // rename this variable, you will also need to rename the namespace below.
    var Sage = {
      // All pages
      'common': {
        init: function() {
          // JavaScript to be fired on all pages
        },
        finalize: function() {
          // JavaScript to be fired on all pages, after page specific JS is fired
        }
      },
      // Home page
      'index': {
        init: function() {

          // Get names from db on page load
          $.post({
            url: '/getNames',
            dataType: 'json',
            success: function(data, status, xhr) {
              if (typeof data === 'object') {
                if (data.success) {
                  $('#log').append("Success: Retrieved existing records from DB\n");
                  if (data.names.length) {
                    for (var i=0; i < data.names.length; i++) {
                      var record = data.names[i];
                      $tr = $('<tr/>');
                      $tr.append($('<td/>').text(record.firstname + ' ' + record.lastname));
                      $tr.append($('<td/>').append($('<button/>').addClass('retrieve').text('Get')));
                      $('#results tbody').append($tr);
                    }
                  }
                } else {
                  $('#log').append("Error: " + data.error + "\n");
                }
              } else {
                $('#log').append("Error: Did not receive valid JSON\n");
              }
            },
            error: function(xhr, status, error) {
              $('#log').append("XHR Error: "+status+"\n");
            },
          });

          // JavaScript to be fired on the home page
          $('#send').click(function(){
            var firstname = $('#firstname').val();
            var lastname = $('#lastname').val();

            if (!firstname || !lastname) {
              $('#log').append("Please enter your first and last names\n");
              return false;
            }

            $('#log').append("Sending your name for processing\n");
            $.post({
              url: '/process',
              dataType: 'json',
              data: {
                firstname: firstname,
                lastname: lastname
              },
              success: function(data, status, xhr) {
                if (typeof data === 'object') {
                  if (data.success) {
                    $('#log').append("Success: Your magic number is " + data.value + "\n");
                    $tr = $('<tr/>');
                    $tr.append($('<td/>').text(firstname + ' ' + lastname));
                    $tr.append($('<td/>').text(data.value));
                    $('#results tbody').append($tr);
                  } else {
                    $('#log').append("Error: " + data.error + "\n");
                  }
                } else {
                  $('#log').append("Error: Did not receive valid JSON\n");
                }
              },
              error: function(xhr, status, error) {
                $('#log').append("XHR Error: "+status+"\n");
              },
            });

            return false;
          });
        },
        finalize: function() {
          // JavaScript to be fired on the home page, after the init JS
        }
      }
    };
  
    // The routing fires all common scripts, followed by the page specific scripts.
    // Add additional events for more control over timing e.g. a finalize event
    var UTIL = {
      fire: function(func, funcname, args) {
        var fire;
        var namespace = Sage;
        funcname = (funcname === undefined) ? 'init' : funcname;
        fire = func !== '';
        fire = fire && namespace[func];
        fire = fire && typeof namespace[func][funcname] === 'function';
  
        if (fire) {
          namespace[func][funcname](args);
        }
      },
      loadEvents: function() {
        // Fire common init JS
        UTIL.fire('common');
  
        // Fire page-specific init JS, and then finalize JS
        $.each(document.body.className.replace(/-/g, '_').split(/\s+/), function(i, classnm) {
          UTIL.fire(classnm);
          UTIL.fire(classnm, 'finalize');
        });
  
        // Fire common finalize JS
        UTIL.fire('common', 'finalize');
      }
    };
  
    // Load Events
    $(document).ready(UTIL.loadEvents);
  
  })(jQuery); // Fully reference jQuery after this point.
  