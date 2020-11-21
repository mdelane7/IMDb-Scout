// ==UserScript==
// @name           IMDb Scout
// @namespace      https://greasyfork.org/users/1057-kannibalox
// @description    Add links from IMDb pages to torrent sites -- easy downloading from IMDb
//
// Preference window for userscripts, hosted by greasyfork:
// @require     https://greasyfork.org/libraries/GM_config/20131122/GM_config.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
//
// @version        5.3.1
// @include        http*://*.imdb.tld/title/tt*
// @include        http*://*.imdb.tld/search/title*
// @include        http*://*.imdb.tld/user/*/watchlist*
// @include        http*://*.imdb.com/title/tt*
// @include        http*://*.imdb.com/search/title*
// @include        http*://*.imdb.com/user/*/watchlist*
//
// @connect      *
// @grant        GM_log
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
//
// ==/UserScript==


var public_sites = [
  {   'name': '1337x',
      'searchUrl': 'https://1337x.unblocker.cc/category-search/%search_string%+%year%/Movies/1/',
      'matchRegex': /No results were returned/},
  {   'name': '1337x',
      'searchUrl': 'https://1337x.unblocker.cc/category-search/%search_string%/TV/1/',
      'matchRegex': /No results were returned/,
      'TV': true},
  {   'name': 'Demonoid',
      'searchUrl': 'http://www.dnoid.pw/files/?query=%tt%',
      'loggedOutRegex': /Error 522|Checking your browser|security check to access|daily site maintenance|page is not available/,
      'matchRegex': /No torrents found/,
      'both': true},
  {   'name': 'ETTV',
      'searchUrl': 'https://www.ettvdl.com/torrents-search.php?search=%search_string%+%year%',
      'matchRegex': /Nothing Found/,
      'both': true},
  {   'name': 'KZ',
      'searchUrl': 'http://kinozal.tv/browse.php?s=%search_string%+%year%&g=0&c=1002&v=0&d=0&w=0&t=0&f=0',
      'matchRegex': 'Нет активных раздач, приносим извинения. Пожалуйста, уточните параметры поиска'},
  {   'name': 'KZ',
      'searchUrl': 'http://kinozal.tv/browse.php?s=%search_string%+%year%&g=0&c=1001&v=0&d=0&w=0&t=0&f=0',
      'matchRegex': 'Нет активных раздач, приносим извинения. Пожалуйста, уточните параметры поиска',
      'TV': true},
  {   'name': 'LimeTor',
      'searchUrl': 'https://limetorrents.unblockit.win/search/movies/%search_string%+%year%/seeds/1/',
      'matchRegex': /csprite_dl14/,
      'positiveMatch': true},
  {   'name': 'NNM',
      'searchUrl': 'https://nnm-club.me/forum/tracker.php?nm=%search_string%+%year%',
      'matchRegex': 'Не найдено',
      'both': true},
  {   'name': 'RARBG',
      'searchUrl': 'https://rarbgweb.org/torrents.php?imdb=%tt%',
      'loggedOutRegex': /something wrong|Please wait|enter the captcha/,
      'matchRegex': '//dyncdn.me/static/20/images/imdb_thumb.gif',
      'positiveMatch': true,
      'both': true},
  {   'name': 'Rarelust',
      'icon': 'https://i.imgur.com/kaaYhsp.png',
      'searchUrl': 'https://rarelust.com/?s=%tt%',
      'matchRegex': 'Nothing Found'},
  {   'name': 'RlsBB',
      'icon': 'https://i.imgur.com/Ve3T1rC.png',
      'searchUrl': 'http://search.rlsbb.ru/Home/GetPost?phrase=%tt%&pindex=1&content=true&type=Simple',
      'goToUrl': 'http://rlsbb.ru/?serach_mode=light&s=%tt%',
      'loggedOutRegex': /Error 522|Checking your browser|security check to access/,
      'matchRegex': /"results":\[\]|Not Found/,
      'both': true},
  {   'name': 'RlsBB-Proxy',
      'icon': 'https://i.imgur.com/Ve3T1rC.png',
      'searchUrl': 'http://search.proxybb.com/Home/GetPost?phrase=%tt%&pindex=1&content=true&type=Simple',
      'goToUrl': 'http://search.proxybb.com/?serach_mode=light&s=%tt%',
      'loggedOutRegex': /Error 522|Checking your browser|security check to access/,
      'matchRegex': /"results":\[\]|Not Found/,
      'both': true},
  {   'name': 'RuT',
      'searchUrl': 'https://rutracker.org/forum/tracker.php?f=100,101,103,1105,1114,1213,1235,124,1247,1278,1280,1281,1327,1363,1389,1391,140,1453,1457,1467,1468,1469,1475,1543,1576,1577,1666,1670,187,1900,1908,1936,194,1950,2076,208,2082,209,2090,2091,2092,2093,2107,2109,2110,2112,212,2123,2139,2159,2160,2163,2164,2166,2168,2169,2176,2177,2178,2198,2199,22,2200,2201,2220,2221,2258,2323,2339,2343,2365,2380,2459,249,2491,251,2535,2538,2540,294,312,313,33,352,376,4,484,500,505,511,521,539,549,552,56,572,599,656,671,672,7,709,752,821,822,851,863,876,877,893,905,921,93,930,934,941,97,979,98&nm=%search_string_orig%',
      'loggedOutRegex': /Введите ваше имя/,
      'matchRegex': 'Не найдено'},
  {   'name': 'RuT',
      'searchUrl': 'https://rutracker.org/forum/tracker.php?f=103,1102,1105,1114,1120,1214,1242,1248,1278,1280,1281,1288,1301,1327,1359,1363,1389,1391,1453,1459,1460,1463,1467,1468,1469,1475,1493,1498,1531,1537,1539,1574,1690,1803,193,1938,1939,1940,195,2076,2082,2104,2107,2110,2112,2123,2139,2159,2160,2163,2164,2166,2168,2169,2176,2177,2178,2323,235,2380,2412,242,249,2491,251,2535,2538,266,294,315,325,387,489,500,534,552,56,594,599,607,656,671,672,694,704,717,718,721,752,775,781,815,816,819,821,825,842,851,863,864,876,893,915,97,979,98&nm=%search_string_orig%',
      'loggedOutRegex': /Введите ваше имя/,
      'matchRegex': 'Не найдено',
      'TV': true},
  {   'name': 'Rutor',
      'searchUrl': 'http://rutor.info/search/0/0/010/0/%tt%',
      'loggedOutRegex': /Gateway Time-out/,
      'matchRegex': 'Результатов поиска 0',
      'both': true},
  {   'name': 'TPB',
      'searchUrl': 'https://proxyproxy.fi/s/?q=%search_string%&video=on&category=0&page=0&orderby=99',
      'matchRegex': /No hits. Try adding an asterisk in you search phrase./,
      'both': true},
  {   'name': 'TGx',
      'icon': 'https://torrentgalaxy.to/common/favicon/favicon-16x16.png',
      'searchUrl': 'https://torrentgalaxy.org/torrents.php?search=%tt%',
      'matchRegex': /No results found/},
  {   'name': 'YGG',
      'searchUrl': 'https://www2.yggtorrent.si/engine/search?name=%search_string_orig%&category=2145&sub_category=all&do=search',
      'matchRegex': 'Aucun résultat !',
      'both': true},
  {   'name': 'Zooqle',
      'icon': 'https://i.imgur.com/jqKceYP.png',
      'searchUrl': 'https://zooqle.com/search?q=%tt%',
      'loggedOutRegex': /Error 522|Checking your browser|security check to access/,
      'matchRegex': 'Sorry, no torrents match',
      'both': true}
];

var private_sites = [
  {   'name': 'PeerConnectors',
      'searchUrl': 'https://peerconnectors.me/torrents/filter?search=%search_string%&description=&keywords=&uploader=&imdb=&tvdb=&view=list&tmdb=&mal=&igdb=&start_year=&end_year=&page=0&qty=25',
      'loggedOutRegex': /Forgot your username/,
      'matchRegex': /Translation: No search results/,
      'both': true},
 
];

var sites = public_sites.concat(private_sites);

var icon_sites = [
  {   'name': 'AllMovie',
      'searchUrl': 'https://www.allmovie.com/search/movies/%search_string%',
      'showByDefault': false},
  {   'name': 'Amazon',
      'searchUrl': 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Dmovies-tv&field-keywords=%search_string%',
      'showByDefault': false},
  {   'name': 'BCDB',
      'icon': 'https://i.imgur.com/IZwCRkn.png',
      'searchUrl': 'https://www.bcdb.com/bcdb/search.cgi?query=%search_string%'},
  {   'name': 'Blu-ray.com',
      'searchUrl': 'https://www.blu-ray.com/search/?quicksearch=1&quicksearch_country=all&quicksearch_keyword=%search_string%+&section=bluraymovies',
      'showByDefault': false},
  {   'name': 'Criticker',
      'searchUrl': 'https://www.criticker.com/?search=%search_string%&type=films'},
  {   'name': 'Facebook',
      'searchUrl': 'https://www.facebook.com/search/str/%search_string%/keywords_pages',
      'showByDefault': false},
  {   'name': 'FilmAffinity',
      'searchUrl': 'https://www.filmaffinity.com/en/advsearch.php?stext=%search_string%&stype[]=title&fromyear=%year%&toyear=%year%',
      'showByDefault': false},
  {   'name': 'Google',
      'searchUrl': 'https://www.google.com/search?q=%search_string%'},
  {   'name': 'iCheckMovies',
      'searchUrl': 'https://www.icheckmovies.com/search/movies/?query=%tt%'},
  {   'name': 'Letterboxd',
      'searchUrl': 'https://letterboxd.com/imdb/%nott%'},
  {   'name': 'Metacritic',
      'searchUrl': 'https://www.metacritic.com/search/all/%search_string%/results?cats[movie]=1&cats[tv]=1&search_type=advanced&sort=relevancy',
      'showByDefault': false},
  {   'name': 'Netflix',
      'searchUrl': 'https://www.netflix.com/search/%search_string%',
      'showByDefault': false},
  {   'name': 'OpenSubtitles',
      'searchUrl': 'https://www.opensubtitles.org/en/search/imdbid-%tt%'},
  {   'name': 'Rotten Tomatoes',
      'searchUrl': 'https://www.rottentomatoes.com/search/?search=%search_string%'},
  {   'name': 'Subscene',
      'icon': 'https://subscene.com/favicon.ico',
      'searchUrl': 'https://subscene.com/subtitles/title?q=%search_string%'},
  {   'name': 'TMDB',
      'icon': 'https://www.themoviedb.org/assets/2/favicon-16x16-b362d267873ce9c5a39f686a11fe67fec2a72ed25fa8396c11b71aa43c938b11.png',
      'searchUrl': 'https://www.themoviedb.org/search?query=%search_string%'},
  {   'name': 'Trakt.tv',
      'icon': 'https://walter.trakt.tv/hotlink-ok/public/favicon.ico',
      'searchUrl': 'https://trakt.tv/search/imdb?query=%tt%',
      'showByDefault': false},
  {   'name': 'TVDB',
      'icon': 'https://www.thetvdb.com/images/icon.png',
      'searchUrl': 'https://www.thetvdb.com/search?query=%search_string%'},
  {   'name': 'uNoGS',
      'searchUrl': 'https://unogs.com/?q=%tt%',
      'showByDefault': false},
  {   'name': 'Wikipedia',
      'searchUrl': 'https://en.wikipedia.org/w/index.php?search=%search_string%&go=Go'},
  {   'name': 'YouTube.com',
      'searchUrl': 'https://www.youtube.com/results?search_query="%search_string%"+%year%+trailer'}
];

// For internal use (order matters)
var valid_states = [
  'found',
  'missing',
  'logged_out',
  'error'
];

function replaceSearchUrlParams(site, movie_id, movie_title, movie_title_orig) {
  var search_url = site['searchUrl'];
  // If an array, do a little bit of recursion
  if ($.isArray(search_url)) {
    var search_array = [];
    $.each(search_url, function(index, url) {
      search_array[index] = replaceSearchUrlParams(url, movie_id, movie_title, movie_title_orig);
    });
    return search_array;
  }
  var space_replace = ('spaceEncode' in site) ? site['spaceEncode'] : '+';
  var search_string = movie_title.trim().replace(/ +\(.*|&/g, '').replace(/\s+/g, space_replace);
  var search_string_orig = movie_title_orig.trim().replace(/ +\(.*|&/g, '').replace(/\s+/g, space_replace);
  var movie_year = document.title.replace(/^(.+) \((.*)([0-9]{4})(.*)$/gi, '$3');
  var s = search_url.replace(/%tt%/g, 'tt' + movie_id)
    .replace(/%nott%/g, movie_id)
    .replace(/%search_string%/g, search_string)
    .replace(/%search_string_orig%/g, search_string_orig)
    .replace(/%year%/g, movie_year);
  return s;
}

function getPageSetting(key) {
  return (onSearchPage ? GM_config.get(key + '_search') : GM_config.get(key + '_movie'));
}

// Small utility function to return a site's icon
function getFavicon(site, hide_on_err) {
    var favicon;
  if (typeof(hide_on_err) === 'undefined') { hide_on_err = false }
  if ('icon' in site) {
    favicon = site['icon'];
  } else {
    var url = new URL(site['searchUrl']);
    favicon = url.origin + '/favicon.ico';
  }
  var img = $('<img />').attr({'style': '-moz-opacity: 0.4; border: 0; vertical-align: text-top',
                               'width': GM_config.get('cfg_icons_size'),
                               'src': favicon,
                               'title': site['name'],
                               'alt': site['name']});
  if (hide_on_err) { img.attr('onerror', "this.style.display='none';") }
  return img;
}

// Adds search links to an element
// state should always be one of the values defined in valid_states
function addLink(elem, link_text, target, site, state) {
  var link = $('<a />').attr('href', target).attr('target', '_blank');
  if ($.inArray(state, valid_states) < 0) {
    console.log("Unknown state " + state);
  }
  if (getPageSetting('use_mod_icons')) {
    var icon = getFavicon(site);
    (GM_config.get('one_line')) ? icon.css({'border-width': '3px', 'border-style': 'solid', 'border-radius': '2px'}) : icon.css({'border-width': '0px', 'border-style': 'solid', 'border-radius': '2px'});
    if (state == 'error' || state == 'logged_out') {
      icon.css('border-color', 'red');
    } else if (state == 'missing') {
      icon.css('border-color', 'yellow');
    } else {
      icon.css('border-color', 'green');
    }
    link.append(icon);
  } else {
    if (state == 'missing' || state == 'error' || state == 'logged_out') {
      link.append($('<s />').append(link_text));
    } else {
      link.append(link_text);
    }
    if (state == 'error' || state == 'logged_out') {
      link.css('color', 'red');
    }
  }

  if (!onSearchPage) {
    $('#imdbscout_' + state).append(link).append(' ');
  } else {
    var result_box = $(elem).find('td.result_box');
    if (result_box.length > 0) {
      $(result_box).append(link);
    } else {
      $(elem).append($('<td />').append(link).addClass('result_box'));
    }
  }
}

// Performs an ajax request to determine
// whether or not a url should be displayed
function maybeAddLink(elem, link_text, search_url, site) {
  // If the search URL is an array, recurse briefly on the elements.
  if ($.isArray(search_url)) {
    $.each(search_url, function(index, url) {
      maybeAddLink(elem, link_text + '_' + (index + 1).toString(), url, site);
    });
    return;
  }

  var domain = search_url.split('/')[2];
  var now = (new Date())*1;
  var lastLoaded = window.localStorage[domain+'_lastLoaded'];
  if (!lastLoaded) {
    lastLoaded = now - 5000;
  } else {
    lastLoaded = parseInt(lastLoaded);
  }
  if (now-lastLoaded < 1000) {
    window.setTimeout(maybeAddLink.bind(undefined, elem, site['name'], search_url, site), 1000);
    return;
  }
  else
  {
    window.localStorage[domain+'_lastLoaded']=(new Date())*1;
  }

  var target = search_url;
  if (site.goToUrl) {
    target = site.goToUrl;
  }
  var success_match = ('positiveMatch' in site) ? site['positiveMatch'] : false;
  GM_xmlhttpRequest({
    method: 'GET',
    url: search_url,
    onload: function(response) {
      if (response.responseHeaders.indexOf('efresh: 0; url') > -1) {
      addLink(elem, link_text, target, site, 'logged_out');
      } else if (site['positiveMatch'] && site['loggedOutRegex'] && String(response.responseText).match(site['loggedOutRegex'])) {
        addLink(elem, link_text, target, site, 'logged_out');
      } else if (String(response.responseText).match(site['matchRegex']) ? !(success_match) : success_match) {
          if (getPageSetting('highlight_missing').split(',').includes(site['name'])) {
            if (elem.style) {
            elem.parentNode.style.background = 'rgba(255,104,104,0.7)';
            } else {
              document.querySelector('#imdbscout_missing').style.background = 'rgba(255,104,104,0.7)';
            }
          }
          if (!getPageSetting('hide_missing')) {
          addLink(elem, link_text, target, site, 'missing');
          }
      } else if (site['loggedOutRegex'] && String(response.responseText).match(site['loggedOutRegex'])) {
        addLink(elem, link_text, target, site, 'logged_out');
      } else {
        addLink(elem, link_text, target, site, 'found');
      }
    },
    onerror: function() {
      addLink(elem, link_text, target, site, 'error');
    },
    onabort: function() {
      addLink(elem, link_text, target, site, 'error');
    }
  });
}

// Run code to create fields and display sites
function perform(elem, movie_id, movie_title, movie_title_orig, is_tv, is_movie) {
  var site_shown = false;
  $.each(sites, function(index, site) {
    if (site['show']) {
      site_shown = true;
      // If we're on a TV page, only show TV links.
      if ((Boolean(site['TV']) == is_tv ||
           Boolean(site['both'])) ||
          (!is_tv && !is_movie) || getPageSetting('ignore_type')) {
        var searchUrl = replaceSearchUrlParams(site, movie_id, movie_title, movie_title_orig);
        if (site.goToUrl)
          site.goToUrl = replaceSearchUrlParams({
            'searchUrl': site['goToUrl'],
            'spaceEncode': ('spaceEncode' in site) ? site['spaceEncode'] : '+'
          }, movie_id, movie_title, movie_title_orig);
        if (getPageSetting('call_http_mod')) {
          maybeAddLink(elem, site['name'], searchUrl, site);
        } else {
          addLink(elem, site['name'], searchUrl, site, 'found');
        }
      }
    }
  });
  if (!site_shown) {
    $(elem).append('No sites enabled! "IMDb Scout Mod Preferences" button you can find on Monkeys plugin icon.');
  }
}

//------------------------------------------------------
// Button Code
//------------------------------------------------------

function displayButton() {
  var p = $('<p />').attr('id', 'imdbscout_button');
  p.append($('<button>Load IMDb Scout</button>').click(function() {
    $('#imdbscout_button').remove();
    if (onSearchPage) {
      performSearch();
    } else {
      performPage();
    }
  }));
  if (onSearchPage) {
    $('#sidebar').append(p);
  } else if ($('h1.header:first').length) {
    $('h1.header:first').parent().append(p);
  } else {
    $('#title-overview-widget').parent().append(p);
  }
}

//------------------------------------------------------
// Icons at top bar
//------------------------------------------------------

// Adds a dictionary of icons to the top of the page.
// Unlike the other URLs, they aren't checked to see if the movie exists.
function addIconBar(movie_id, movie_title, movie_title_orig) {
  var iconbar;
  if ($('h1.header:first').length) {
    iconbar = $('h1.header:first').append($('<br/>'));
  } else if ($('.title_wrapper h1').length) {
    iconbar = $('.title_wrapper h1').append($('<br/>'));
  } else if ($('h3[itemprop="name"]').length) {
    iconbar = $('h3[itemprop="name"]').append($('<br/>'));
  } else {
    iconbar = $('#tn15title .title-extra');
  }
  $.each(icon_sites, function(index, site) {
    if (site['show']) {
      var search_url = replaceSearchUrlParams(site, movie_id, movie_title, movie_title_orig);
      var image = getFavicon(site);
      var html = $('<span />').append("&nbsp;").attr('style', 'font-size: 11px;').append(
        $('<a />').attr('href', search_url)
          .addClass('iconbar_icon').append(image));
      iconbar.append(html).append();
    }
  });
  //If we have access to the openInTab function, add an Open All feature
  if (GM_openInTab) {
    var aopenall = $('<a />').text('Open All')
        .prepend("&nbsp;")
        .attr('href', 'javascript:;')
        .attr('style', 'font-weight:bold;font-size:11px;font-family: Calibri, Verdana, Arial, Helvetica, sans-serif;');
    aopenall.click(function() {
      $('.iconbar_icon').each(function() {
        GM_openInTab($(this).attr('href'));
      });
    }, false);
    iconbar.append(aopenall);
  }
}

//------------------------------------------------------
// Search page code
//------------------------------------------------------

function performSearch() {
  //Add css for the new table cells we're going to add
  var styles = '.result_box {width: 335px}';
  styles += ' .result_box a { margin-right: 5px; color: #444;} ';
  styles += ' .result_box a:visited { color: #551A8B; }';
  styles += ' #content-2-wide #main, #content-2-wide';
  styles += ' .maindetails_center {margin-left: 5px; width: 1001px;} ';
  GM_addStyle(styles);

  if($('div#main table.results tr.detailed').length !== 0) {
    //Loop through each result row
    $('div#main table.results tr.detailed').each(function() {
      var link = $(this).find('.title>a');
      var is_tv = Boolean($(this).find('.year_type').html()
                          .match('TV Series'));
      var is_movie = Boolean($(this).find('.year_type').html()
                             .match(/\(([0-9]*)\)/));
      var movie_title = link.html();
      var movie_title_orig = movie_title;
      var movie_id = link.attr('href').match(/tt([0-9]*)\/?$/)[1];

      $(this).find('span.genre a').each(function() {
        if ($(this).html() == 'Adult') {
          $(this).parent().parent().parent()
            .css('background-color', 'red');
        }
      });
      perform($(this), movie_id, movie_title, movie_title_orig, is_tv, is_movie);
    });
  } else {
    // Chameleon code, in a different style
    var titleDivs = document.getElementsByClassName('col-title');
    var compact = true;
    if(titleDivs.length === 0)
    {
      titleDivs=document.getElementsByClassName('lister-item-header');
      compact=false;
    }
    for(var i=0; i<titleDivs.length; i++)
    {
      var t = titleDivs[i];
      var link = t.getElementsByTagName('a')[0];
      var is_tv = link.nextElementSibling.textContent.indexOf('-')!==-1;
      var is_movie = !is_tv;
      var movie_title = link.textContent;
      var movie_title_orig = movie_title;
      var movie_id = link.href.split("/title/tt")[1].split("/")[0];

      var elem = t.parentNode.parentNode;
      if(!compact)
        elem = t.parentNode;
      perform(elem, movie_id, movie_title, movie_title_orig, is_tv, is_movie);
    }
  }
}

//------------------------------------------------------
// Watchlist page code
//------------------------------------------------------

function performWatchlist() {
  //Add css for the new table cells we're going to add
  var styles = '.result_box {width: 335px}';
  styles += ' .result_box a { margin-right: 5px; color: #444;} ';
  styles += ' .result_box a:visited { color: #551A8B; }';
  styles += ' #content-2-wide #main, #content-2-wide';
  styles += ' .maindetails_center {margin-left: 5px; width: 1001px;} ';
  GM_addStyle(styles);
  if($('div .lister-list.mode-detail').children().length !== 0) {
    $('div .lister-list.mode-detail').children().each(function() {
      var link = $(this).find('.lister-item-header>a');
      var is_tv = Boolean($(this).find('.lister-item-details').html()
                          .match('TV Series'));
      var is_movie = Boolean($(this).find('.lister-item-year').html()
                             .match(/^([0-9]*)$/));
      var movie_title = link.html();
      var movie_title_orig = movie_title;
      var movie_id = link.attr('href').match(/tt([0-9]*)\/?.*/)[1];
      perform($(this), movie_id, movie_title, movie_title_orig, is_tv, is_movie);
    });
  }
}

//------------------------------------------------------
// TV/movie page code
//------------------------------------------------------

function performPage() {
  var movie_title = $('.title_wrapper>h1').clone().children().remove().end().text();
  if (movie_title === "") {
    movie_title = $('h3[itemprop="name"]').text().trim();
  }
  var movie_title_orig = $('.originalTitle').clone().children().remove().end().text();
  if (movie_title_orig === "") {
    movie_title_orig = movie_title;
  }
  var movie_id = document.URL.match(/\/tt([0-9]+)\//)[1].trim('tt');
  var is_tv_page = Boolean($('title').text().match('TV Series')) ||
      Boolean($('.tv-extra').length);
  var is_movie_page = Boolean($('title').text().match(/.*? \(([0-9]*)\)/));
  //Create area to put links in
  perform(getLinkArea(), movie_id, movie_title, movie_title_orig,
          is_tv_page, is_movie_page);
  addIconBar(movie_id, movie_title, movie_title_orig);
}

//------------------------------------------------------
// Find/create elements
//------------------------------------------------------

function getLinkArea() {
  // If it already exists, just return it
  if ($('#imdbscout_header').length) {
    return $('#imdbscout_header');
  }
  var p = $('<p />').append('<h2>' + GM_config.get('imdbscoutmod_header_text') + '</h2>').attr('id', 'imdbscout_header').css({
    'padding': '0px 20px',
    'font-weight': 'bold'
  });
  var background_color = (GM_config.get('new_layout_dark')) ? '#333333' : '#EEEEEE';
  var txt_color = (GM_config.get('new_layout_dark')) ? '#EEEEEE' : '#333333';
  var p_new = $('<p />').append(GM_config.get('imdbscoutmod_header_text')).attr('id', 'imdbscout_header').css({
    'padding': '4px 11px',
    'font-weight': 'bold',
    'background-color': background_color,
    'margin-top': '0px',
    'margin-bottom': '0px',
    'overflow': 'hidden',
    'color': txt_color
  });
  if (GM_config.get('use_new_layout')) {
  var p = p_new;
  }
  $.each(valid_states, function(i, name) {
    if (GM_config.get('one_line')) {
      p.append($('<span />').attr('id', 'imdbscout_' + name));
    } else {
      var title = $('<span>' + name.replace('_', ' ') + ': </span>').css({
        'textTransform': 'capitalize',
        'min-width': '100px',
        'display': 'inline-block'
      });
      p.append($('<div />').attr('id', 'imdbscout_' + name).append(title));
    }
  });
  if ($('h1.header:first').length) {
    $('h1.header:first').parent().append(p);
  } else if (GM_config.get('use_new_layout')) {
      if ($('.button_panel.navigation_panel').length) {
      $('.button_panel.navigation_panel').after(p);
      } else if ($('.title_block').length) {
        $('.title_block').after(p);
        }
  } else if ($('#title-overview-widget').length && !GM_config.get('use_new_layout')) {
    $('#title-overview-widget').parent().append(p);
  } else if ($('.titlereference-header').length) {
    $('.titlereference-header').append(p);
  } else {
    $('#tn15rating').before(p);
  }
  return $('#imdbscout_header');
}

//------------------------------------------------------
// Create the config name
//------------------------------------------------------

function configName(site) {
  if ('configName' in site) {
    return 'show_' + site['configName'] + (site['TV'] ? '_TV' : '');
  } else {
    return 'show_' + site['name'] + (site['TV'] ? '_TV' : '');
  }
}

//------------------------------------------------------
// Code being run (main)
//------------------------------------------------------

// Get everything configured

// Create the non-site dictionary for GM_config
var config_fields = {
  'imdbscoutmod_header_text': {
    'label': 'Header text for torrent sites:',
    'type': 'text',
    'default': ''
  },
  'cfg_icons_size': {
    'label': 'Size of the icons (pixels):',
    'type': 'text',
    'default': '20'
  },
  'use_new_layout': {
    'section': 'Movie Page:'.bold(),
    'type': 'checkbox',
    'label': 'Use the new layout?',
    'default': true
  },
  'new_layout_dark': {
    'type': 'checkbox',
    'label': 'Dark background for the new layout?',
    'default': true
  },
  'loadmod_on_start_movie': {
    'type': 'checkbox',
    'label': 'Load on start?',
    'default': true
  },
  'call_http_mod_movie': {
    'type': 'checkbox',
    'label': 'Actually check for torrents?',
    'default': true
  },
  'hide_missing_movie': {
    'type': 'checkbox',
    'label': 'Hide missing links?',
    'default': false
  },
  'use_mod_icons_movie': {
    'type': 'checkbox',
    'label': 'Use icons instead of text?',
    'default': true
  },
  'one_line': {
    'type': 'checkbox',
    'label': 'Show results on one line?',
    'default': true
  },
  'ignore_type_movie': {
    'type': 'checkbox',
    'label': 'Search all sites, ignoring movie/tv distinction?',
    'default': false
  },
  'highlight_missing_movie': {
    'label': 'Highlight when not on:',
    'type': 'text',
    'default': ''
  },
  'loadmod_on_start_search': {
    'section': 'Search Page:'.bold(),
    'type': 'checkbox',
    'label': 'Load on start?',
    'default': false
  },
  'call_http_mod_search': {
    'type': 'checkbox',
    'label': 'Actually check for torrents?',
    'default': false
  },
  'hide_missing_search': {
    'type': 'checkbox',
    'label': 'Hide missing links?',
    'default': false
  },
  'use_mod_icons_search': {
    'type': 'checkbox',
    'label': 'Use icons instead of text?',
    'default': true
  },
  'ignore_type_search': {
    'type': 'checkbox',
    'label': 'Search all sites, ignoring movie/tv distinction?',
    'default': false
  },
  'watchlist_as_search': {
    'type': 'checkbox',
    'label': 'Treat the watchlist a a search page?',
    'default': false
  },
  'highlight_missing_search': {
    'label': 'Highlight when not on:',
    'type': 'text',
    'default': ''
  }
};

// Add each public site to a GM_config dictionary schema
// The GM_config default for checkboxes is false
$.each(public_sites, function(index, site) {
  config_fields[configName(site)] = {
    'section': (index == 0) ? ['Public download sites:'.bold()] : '',
    'type': 'checkbox',
    'label': ' ' + site['name'] + (site['TV'] ? ' (TV)' : '')
  };
});

// Add each private site to a GM_config dictionary schema
// The GM_config default for checkboxes is false
$.each(private_sites, function(index, site) {
  config_fields[configName(site)] = {
    'section': (index == 0) ? ['Private download sites:'.bold()] : '',
    'type': 'checkbox',
    'label': ' ' + site['name'] + (site['TV'] ? ' (TV)' : '')
  };
});

// Icon sites should be shown by default though,
// since they barely use any resources.
$.each(icon_sites, function(index, icon_site) {
  config_fields['show_icon_' + icon_site['name']] = {
    'section': (index == 0) ? ['Other sites:'.bold()] : '',
    'type': 'checkbox',
    'label': ' ' + icon_site['name'],
    'default': ('showByDefault' in icon_site) ?
    icon_site['showByDefault'] : true
  };
});

// Initialize and register GM_config
GM_config.init({
  'id': 'imdb_scout',
  'title': 'IMDb Scout Mod Preferences',
  'fields': config_fields,
  'css': '.section_header { \
            background: white   !important; \
            color:  black       !important; \
            border: 0px         !important; \
            text-align: left    !important;} \
          .field_label { \
            font-weight: normal !important;}',
  'events':
  {
    'open': function() {
      $('#imdb_scout').contents().find('#imdb_scout_section_2').find('.field_label').each(function(index, label) {
        var url = new URL(public_sites[index].searchUrl);
        $(label).append(' ' + '<a class="grey_link" target="_blank" style="color: gray; text-decoration : none" href="' + url.origin + '">'
                        + (/www./.test(url.hostname) ? url.hostname.match(/www.(.*)/)[1] : url.hostname)  + '</a>');
        $(label).prepend(getFavicon(public_sites[index], true));
      });
      $('#imdb_scout').contents().find('#imdb_scout_section_3').find('.field_label').each(function(index, label) {
        var url = new URL(private_sites[index].searchUrl);
        $(label).append(' ' + '<a class="grey_link" target="_blank" style="color: gray; text-decoration : none" href="' + url.origin + '">'
                        + (/www./.test(url.hostname) ? url.hostname.match(/www.(.*)/)[1] : url.hostname)  + '</a>');
        $(label).prepend(getFavicon(private_sites[index], true));
      });
      $('#imdb_scout').contents().find('#imdb_scout_section_4').find('.field_label').each(function(index, label) {
  $(label).prepend(getFavicon(icon_sites[index], true));
      });
    }
  }
});

GM_registerMenuCommand('IMDb Scout Mod Preferences', function() {GM_config.open()});

// Fetch per-site values from GM_config
$.each(sites, function(index, site) {
  site['show'] = GM_config.get(configName(site));
});

$.each(icon_sites, function(index, icon_site) {
  icon_site['show'] = GM_config.get('show_icon_' + icon_site['name']);
});

// Are we on a search page?
// This variable is camelCased to show it's global
// Hopefully it can be factored out of the global scope in the future
var onSearchPage = Boolean(location.href.match('search')) || Boolean(location.href.match('watchlist'));

$('title').ready(function() {
  if (window.top == window.self) {
    if (!onSearchPage && GM_config.get('loadmod_on_start_movie')) {
      performPage();
    } else if (onSearchPage && GM_config.get('loadmod_on_start_search')) {
      if (Boolean(location.href.match('watchlist')) && GM_config.get('watchlist_as_search')) {
        performWatchlist();
      } else {
        performSearch();
      }
    } else {
      displayButton();
    }
  }
});
