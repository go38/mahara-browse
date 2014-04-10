// self executing function for namespacing code
(function( Browse, $, undefined ) {

    var loadingmessage;

    //Public Method
    Browse.filtercontent = function(browsetype, limit, offset) {
        offset = typeof offset !== 'undefined' ? offset : 0;
        var filters = {};
        $("#active-filters .filter-entry").each(function() {
            var name = $(this).attr('name');
            var val = $(this).attr('value');
            if (filters[name] && filters[name].indexOf(val) == -1) {
                filters[name] += "," +val;
            } else {
                filters[name] = val;
            }
        });
        var pd = {'filter': 1, 'limit': limit, 'offset': offset,  'searchtype': $('#search-type').val()};
        $.each(filters, function(name, value) {
            pd[name] = value;
        });
        loadingmessage.removeClass('hidden');
        sendjsonrequest(config['wwwroot'] + 'artefact/browse/browse.json.php', pd, 'POST', function(data) {
            loadingmessage.addClass('hidden');
            $('#gallery').replaceWith(data.data.tablerows);
            $('#browselist_pagination').html(data.data.pagination);
            connect_hover_events();
        });
    };

    function init() {
        loadingmessage = $('#loadingmessage');
        connect_enter_event();
        connect_add_filter_options()
        connect_autocomplete();
        connect_hover_events();
        connect_placeholder_updates();

        // set filter checkboxes to be buttons
        $('input.checkbox')
            .button({
            icons: { secondary: "ui-icon-circle-plus" }
            })
            .click(function () {
                if ( $(this).is(':checked')) {
                    $(this).button("option", "icons", {secondary: "ui-icon-circle-close"});
                    var parenttype = $(this).closest('.filtersection').attr('id');
                    var filtertype = 'college';
                    if (parenttype.indexOf('sharetype') >= 0) {
                        filtertype = 'sharetype';
                    }
                    var inputval = $(this).val();
                    add_filter(filtertype, inputval);
                }
                else {
                    $(this).button("option", "icons", {secondary: "ui-icon-circle-plus"});
                    var parenttype = $(this).closest('.filtersection').attr('id');
                    var filtertype = 'college';
                    if (parenttype.indexOf('sharetype') >= 0) {
                        filtertype = 'sharetype';
                    }
                    var inputval = $(this).val();
                    remove_active_filter(filtertype, inputval);
                }
            });
    }

    function connect_hover_events() {
        $('.gall-cell').hover(function() {
            $('.gall-span', this).stop().animate({"opacity": 1});
        },function() { 
            $('.gall-span', this).stop().animate({"opacity": 0});
        });
        var pagename ='';
        $('.pagelink').hover(function() {
            pagename = $(this).text();
            $(this).text('View page');
        }, function() {
            $(this).text(pagename);
        });
    }

    function connect_placeholder_updates() {
        $('#search-type').change(function() {
            // remove any extant filters
        	// only one search type at a time
            if ($('#active-filters .filter-entry-wrapper').length) {
                remove_all_filters();
            }
            // set placeholder text in input field
            if ($(this).val() == 'user') {
                $('#filter-keyword').attr('Placeholder', 'Type name');
            } else if ($(this).val() == 'pagetitle') {
                $('#filter-keyword').attr('Placeholder', 'Type keyword');
            } else if ($(this).val() == 'pagetag') {
                $('#filter-keyword').attr('Placeholder', 'Type tag');
            }
        });
    }

    function connect_enter_event() {
        $("#filter-keyword, #filter-course").keypress(function(event) {
          var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
            if ( keycode == 13 ) {
               event.preventDefault();
               event.stopPropagation();
               add_filter($(this).attr('name'), $(this).val());
               $(this).val('');
               $(this).focus();
             $('#filter-course-container').hide();
             hide_filter_course_container();
             }
          });
    }

    function connect_autocomplete() {
        var pd = {'autocomplete': 1,
                   'field' : 'course'
                 };
        $('#filter-course').autocomplete({
            minLength: 2,
            source: function(request, response) {
                pd['term'] = request['term'];
                sendjsonrequest(config['wwwroot'] + 'artefact/browse/autocomplete.json.php', pd, 'POST', function(data) {
                    response(data.courses);
                });
            }
        });
    }

    function hide_filter_course_container() {
        $('#filter-course-container').hide();
        var a = $('#activate-course-search').find('a');
        a.removeClass('chzn-single-with-drop');
        a.parent().removeClass('chzn-container-active');
    }

    function show_filter_course_container() {
        $('#filter-course-container').show();
        var a = $('#activate-course-search').find('a');
        a.addClass('chzn-single-with-drop');
        a.parent().addClass('chzn-container-active');
    }

    function toggle_filter_course_container() {
        $('#filter-course-container').toggle();
        var a = $('#activate-course-search').find('a');
        if ($('#filter-course-container').is(":visible")) {
            a.addClass('chzn-single-with-drop');
            a.parent().addClass('chzn-container-active');
        } else {
            a.removeClass('chzn-single-with-drop');
            a.parent().removeClass('chzn-container-active');
        }
    }

    function connect_add_filter_options() {
        $('.add-text-filter-button').each(function() {
            connect_add_text_button($(this));
        });
        $('#filter-sharetype-container, #filter-college-container, #filter-keyword').click(function() {
            hide_filter_course_container();
        });
        $('.chzn-select').chosen({disable_search_threshold: 10}).change(function() {
            var id = $(this).attr('id');
            var type = id.substr(id.lastIndexOf('-')+1);
            add_filter(type, $(this).val());
        });
        $('#activate-course-search').click(function() {
            toggle_filter_course_container();
        });
        $('#query-button-course').click(function() {
            hide_filter_course_container();
        });
    }

    function connect_add_text_button(button) {
        button.click(function(event) {
            event.preventDefault();
            var type = $(button).val();
            var inputval = $(button).prev('input').val();
            add_filter(type, inputval);
              event.stopPropagation();
        });
    }

    function add_filter(addtype, value) {
        // check for existing filters
        var alreadyExists = false;
        $('.filter-entry[name="' + addtype + '"]').each(function() {
            if (addtype == 'course') {
                if ($(this).text() == value) {
                    alreadyExists = true;
                    return false; // this just breaks the each loop
                }    
            }        
            if ($(this).attr('value') == value) {
                alreadyExists = true;
                return false; // this just breaks the each loop
            }
        });

        if (alreadyExists || !value.length) {
            return false;
        }

        var temp = $('<div>').addClass('filter-entry');
        if (addtype == 'keyword') {
            temp.html(value);
            temp.attr('name', addtype);
            temp.attr('value', value);
            add_active_filter(temp);
            $('#active-filters-container').show();
        } else if (addtype == 'course') {
            var pd = {'autocomplete': 1,
                    'field' : 'courseid',
                    'term'  : $('#filter-course').val()
                  };
             sendjsonrequest(config['wwwroot'] + 'artefact/browse/autocomplete.json.php', pd, 'POST', function(data) {
                if (!data.courseid.length) {
                    return false;
                }
                temp.html(value);
                temp.attr('name', addtype);
                temp.attr('value', data.courseid);
                add_active_filter(temp);
                $('#active-filters-container').show();
             });
        } else {
            //sharetype or college
            temp.html($('#filter_' + addtype + '_chzn').find('span').html());
            temp.attr('name', addtype);
            temp.attr('value', value);
            add_active_filter(temp);
            $('.chzn-select').val([]).trigger('liszt:updated');
            $('#active-filters-container').show();
        }  
    }

    function add_active_filter(temp) {
        var filterwrapper = $('<div>').addClass('filter-entry-wrapper fl');
        filterwrapper.append(temp);
        var remove = $(".remove-filter input").clone();
        var removediv = $('<div>').addClass('remove-filter-entry');
        removediv.attr('name', temp.attr('name'));
        removediv.attr('value', temp.val());
        removediv.append(remove);
        filterwrapper.append(removediv);
        $("#active-filters").append(filterwrapper);
        connect_remove_button(remove);

        if ($('#active-filters .filter-entry').length == 2) {
            var removeallwrapper = $('<div>').attr('id', 'remove-all-wrapper').addClass('remove-all-wrapper fr');
            var removealltext = $('<div>').attr('id', 'remove-all-filter-entries');
            var removeallbutton = $('<div>').attr('id', 'remove-all-button').addClass('remove-filter-entry');
            var removebutton = $(".remove-filter input").clone();
            removealltext.html('Clear all filters');
            removeallbutton.append(removebutton);
            removeallwrapper.prepend(removealltext);
            removeallwrapper.prepend(removeallbutton);
            $("#active-filters").prepend(removeallwrapper);
            connect_remove_all_button(removebutton);
        }
        refresh_content(0);
    }

    function connect_remove_button(button) {
        button.click(function(event) {
            var parent = button.parent('.remove-filter-entry');
                
            if ($(parent).attr('name') == 'course') {
                $('#filter-course').val('');
            }
            else if ($(parent).attr('name') == 'keyword') {
                $('#filter-keyword').val('');
            }
            button.closest('.filter-entry-wrapper').remove();

            if ($('#active-filters .filter-entry').length < 2) {
                $('#remove-all-wrapper').remove();
            }
            if ($('#active-filters .filter-entry').length < 1) {
                $('#active-filters-container').hide();
            }
            refresh_content(0);
        });
    }

    function connect_remove_all_button(button) {
        button.click(function(event) {
            remove_all_filters();
        });
    }
    
    function remove_all_filters() {
        $('#active-filters .filter-entry-wrapper').each(function() {
            $(this).remove();
        });

        $('#remove-all-wrapper').remove();
        $('#filter-course').val('');
        $('#filter-keyword').val('');
        $('#active-filters-container').hide();
        refresh_content(0);
    }

    function refresh_content(offset) {
        $('#loading-graphic').show();
        offset = typeof offset !== 'undefined' ? offset : 0;
        var filters = {};
        $("#active-filters .filter-entry").each(function() {
            var name = $(this).attr('name');
            var val = $(this).attr('value');
            if (filters[name] && filters[name].indexOf(val) == -1) {
                if (name=='course') {
                    // some course names will return multiple ids
                    // cater for this when building db query
                    filters[name] += ";" +val;
                } else {
                    filters[name] += "," +val;
                }
            } else {
                filters[name] = val;
            }
        });
        var pd = {'filter': 1, 'offset': offset, 'searchtype': $('#search-type').val() };
        $.each(filters, function(name, value) {
            pd[name] = value;
        });

        sendjsonrequest(config['wwwroot'] + 'artefact/browse/browse.json.php', pd, 'POST', function(data) {
                $('#gallery').removeClass('hidden');
                $('#gallery').replaceWith(data.data.tablerows);
                if (!$('#browselist_pagination').length) {
                    var pag = $('<div>').attr('id', 'pagination').html(data.data.pagination);
                    $('#gallery').prepend(pag);
                } else {
                    $('#browselist_pagination').html(data.data.pagination);
                }
                connect_hover_events();
        });
        $('#loading-graphic').hide();
    }

    $(document).ready(function() {
        init();
    });

}( window.Browse = window.Browse || {}, jQuery ));
