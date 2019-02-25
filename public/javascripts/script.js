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
                      $nameCol = $('<td/>').attr('id', record._id);
                      $nameCol.append($('<span/>').text(record.firstname));
                      $nameCol.append(' ');
                      $nameCol.append($('<span/>').text(record.lastname));
                      $tr.append($nameCol);
                      $tr.append($('<td/>').append($('<button/>').addClass('retrieve btn btn-sm btn-success').text('Get')));
                      $tr.append($('<td/>').append($('<button/>').addClass('delete btn btn-sm btn-danger').text('Delete')));
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

          $('#results').on('click', '.delete', function(e){
            var $row = $(e.target).parents('tr');
            var id = $('td', $row).first().attr('id');

            $('#log').append("Sending the id for deletion\n");
            $.post({
              url: '/delete',
              dataType: 'json',
              data: {
                id: id
              },
              success: function(data, status, xhr) {
                if (typeof data === 'object') {
                  if (data.success) {
                    $('#log').append("Success: Deleted the record\n");
                    $row.fadeOut("normal", function() {
                      $(this).remove();
                    });
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

          $('#results').on('click', '.retrieve', function(e){
            var $row = $(e.target).parents('tr');
            var firstname = $('span', $('td', $row).first()).first().text();
            var lastname = $('span', $('td', $row).first()).last().text();

            $('#log').append("Sending the name for processing\n");
            $.post({
              url: '/process',
              dataType: 'json',
              data: {
                firstname: firstname,
                lastname: lastname,
                save: false
              },
              success: function(data, status, xhr) {
                if (typeof data === 'object') {
                  if (data.success) {
                    $('#log').append("Success: Their magic number is " + data.value + "\n");
                    $('td:nth-child(2)', $row).text(data.value);
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
                    $tr.append($('<td/>').text(firstname + ' ' + lastname).attr('id', data.id));
                    $tr.append($('<td/>').text(data.value));
                    $tr.append($('<td/>').append($('<button/>').addClass('delete btn btn-sm btn-danger').text('Delete')));
                      $('#results tbody').append($tr);
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
  