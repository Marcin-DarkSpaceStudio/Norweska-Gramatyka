
//
//  TODO
//
//  show zagadnienia btn only after scrolling down
//
//  splash screen or new green header
//
//  check #hash on init
//  then recreate state
//
//  open and scroll to submenu
//  at the same time, filter the list
//  after the click on submenu, show a helpfull note about this topic
//  encourage to read below
//  add aditional aids in the list that solve problems


//
//  Gramatyka App
//
var grammar = function() {
  "use strict";

  var debug = false;

  var main = document.getElementById('js__main');
  var mainClass = main.className;
  var activeSubsection = '';

  var sublists = {
    js__tid:            document.getElementById('js__tid'),
    js__verb:           document.getElementById('js__verb'),
    js__adjektiv:       document.getElementById('js__adjektiv'),
    js__substantiv:     document.getElementById('js__substantiv'),
    js__ordning:        document.getElementById('js__ordning'),
    js__pronomen:       document.getElementById('js__pronomen')
  };

  var problems = [
    'eiendomspronomen',
    'personlige-pronomen',
    'sporrepronomen',
    'refleksive-pronomen',
    'verb',
    'imperativ',
    'modale',
    'adjektiv',
    'gradering',
    'perfektum-partisipp',
    'sideordning',
    'underordning',
    'sporsmal',
    'syntaks',
    'substantiv',
    'determinativ',
    'genitiv',
    'presens-perfektum',
    'presens',
    'futurum',
    'preteritum',
    'passiv'
  ];


  //  backgrounds object
  //  title: [ artist, url, back-position ]
  var backgrounds = {
    empty: [
      'zostajemy przy zielonym tle'
    ],
    apodictische_waaren: [
      'Jacob Smies',
      'https://www.rijksmuseum.nl/en/collection/RP-T-1897-A-3489'
    ],
    piskijker_en_boeren_familie: [
      'Nicolaes van Haeften',
      'https://www.rijksmuseum.nl/en/collection/RP-P-1892-A-17348',
      'center top'
    ],
  };

  function trackEvent( name, data ) {

    if (
      window.tianji &&
      typeof window.tianji.track === 'function'
    ) {

      window.tianji.track( name, data || {} );

    }

  }


  function init() {

    attachMainEvent();
    checkHash();
    checkTime( new Date() );

    //changeHeaderImg();

  }


  //  Init
  init();



  function changeHeaderImg() {

    var header;
    var headerWrap;
    var aidImg;
    var artist;

    //  wylosuj jeden background
    var backName = getRandomBack();
    var backData = backgrounds[ backName ];

    //console.log(backName);
    //console.log(backData);

    //  jeśli empty, return
    if ( backName === 'empty' ) {
      return;
    }

    //  prepere elements
    header = document.getElementById( 'aid-header' );
    headerWrap = header.parentNode;
    aidImg = document.getElementById( 'aid-header-img' );
    aidImg.parentNode.removeChild( aidImg );
    artist = document.createElement( 'a' );
    artist.href = backData[1];
    artist.innerHTML = backData[0];
    artist.target = '_blank';
    artist.className = 'aid-header-artist';

    //  change headerWrap
    headerWrap.style.backgroundImage = 'url( \'i/' + backName + '.jpg \')';
    headerWrap.className = 'section-trans';
    header.classList.add( 'aid-header--back' );

    //  if there is background-positioning
    if ( backData[2] ) {
      headerWrap.style.backgroundPosition = backData[2];
    }

    header.appendChild( artist );

  }


  function getRandomBack() {
    var property;
    var propArray = [];

    //  Push first items
    for ( property in backgrounds ) {
      if ( backgrounds.hasOwnProperty( property ) ) {
        // if it is own property

        propArray.push( property );

      }
    }

    propArray = shuffleArray( propArray );

    return propArray[1];
  };


  //  Fisher-Yates Shuffle
  function shuffleArray( propArray ) {

    var counter = propArray.length;
    var index;
    var temp;

    //  While there are elements in the propArray
    while (counter > 0) {
      //  Pick a random index
      index = Math.floor(Math.random() * counter);

      //  Decrease counter by 1
      counter--;

      //  And swap the last element with it
      temp = propArray[counter];
      propArray[counter] = propArray[index];
      propArray[index] = temp;
    }

    return propArray;
  };



  function checkTarget(event) {

    var hash;
    var url;
    var currentUrl = window.location.href.split('#')[0];
    var feedbackEl;
    var feedback;
    var aidEl;
    var parent;
    var elWithHref = getParentWithAtt( event.target, 'href' );

    showDebugMsg( elWithHref );


    if ( elWithHref ) {
      hash = elWithHref.href.split('#')[1];
      url = elWithHref.href.split('#')[0];
    }


    //  anchor to current page
    if ( hash && url && ( url === currentUrl ) ) {

      showDebugMsg( 'hash: ' + hash );

      trackEvent( 'problem_select', {
        problem: hash
      } );

      //  check if it is a sublist
      if ( sublists.hasOwnProperty( hash ) ) {

        showDebugMsg('sublists ma prop');

        toggleSublist( sublists[ hash ] );

        event.preventDefault();
        event.stopPropagation();
        return;

      }


      //  check if jsClasses has the prop
      if ( problems.indexOf( hash ) >= 0  ) {

        showDebugMsg('problems list has hash, add class');

        main.className = mainClass + ' js__hidden js__' + hash;

      }


      Velocity(
        document.getElementById( hash ),
        'scroll',
        { duration: 800, easing: 'easeInOutQuart' }
      );
      return;

    }
    //  it should be outbound link
    else if ( url && ( url !== currentUrl ) ) {

      trackEvent( 'outgoing_link', {
        url: url
      } );

    }

    //  Data Feedback
    feedbackEl = getParentWithAtt( event.target, 'data-feedback' );

    if ( feedbackEl ) {
      feedback = feedbackEl.getAttribute('data-feedback');
      aidEl = getParentWithId( event.target );
    }

    //  If there is feedback and found aidEl
    if ( aidEl && feedback ) {

      showDebugMsg( 'aidId: ' + aidEl.id + ' | feedback: ' + feedback );

      trackEvent( 'feedback', {
        item: aidEl.id,
        value: feedback
      } );

      showFeedback( event.target );

    }

  }


  function toggleSublist( el ) {

    //  if there is active subsection
    if ( activeSubsection && ( activeSubsection !== '' ) ) {
      //  hide activeSubsection
      Velocity(
        activeSubsection,
        'slideUp',
        { duration: 400, easing: 'easeInOutQuart' }
      );

      showDebugMsg('hide active section');
      showDebugMsg(el);
    }

    //  el is not active
    if ( activeSubsection === el ) {

      activeSubsection = '';

      showDebugMsg('reset active section');

    }
    else {

        //  show el
        Velocity(
          el,
          'slideDown',
          { duration: 400, easing: 'easeInOutQuart' }
        );

        activeSubsection = el;

        showDebugMsg('show new section');
        showDebugMsg(el);

    }

  }


  //  check what user is linking to
  //  change the main class so the view from the hash remains
  function checkHash() {

    var currentUrl = window.location.href;
    var currentHash = currentUrl.split('#')[1];

    if ( currentHash && ( currentHash.length > 0 ) && ( problems.indexOf( currentHash ) >= 0 ) ) {

      main.className = mainClass + ' js__hidden js__' + currentHash;

      showDebugMsg('Class: ' + mainClass + ' js__hidden js__' + currentHash);

    }

  }


  //
  //  check time
  //  change the welcome msg
  //
  function checkTime( t ) {

    var heiEl = document.getElementById( 'js__hei' );

    var heiArr = [

      'Morn, morn',
      'God morgen',
      'God dag',      //  this one is default
      'God kveld'

    ];

    var no = 3;

    var h = t.getHours();

    showDebugMsg('h: ' + h );

    if ( h < 5 ) {
      //  god kveld
      no = 3;
    }
    else if ( h < 7 ) {
      //  morn, morn
      no = 0;
    }
    else if ( h < 10 ) {
      //  god morgen
      no = 1;
    }
    else if ( h < 18 ) {
      //  god dag
      //  this one is default
      //  don't change anything
      no = -1;
    }
    //  else use 3 in var

    showDebugMsg('no: ' + no );

    //  update elements html
    if ( ( no >= 0 ) && heiEl ) {

      heiEl.innerHTML = heiArr[ no ] + '!';

    }


  }



  function attachMainEvent() {
    document.addEventListener('click', function listener(event) {
      checkTarget(event);
    }, false);
  }


  function getParentWithAtt( el, att ) {

    var parent;

    if ( el.hasAttribute( att ) ) {
      return el;
    }

    parent = el.parentNode;

    while ( !parent.hasAttribute( att ) ) {

      parent = parent.parentNode;

      if ( parent == document.body ) {
        return false;
      }


    }

    return parent;

  }

  function getParentWithId( el ) {

    return getParentWithAtt( el, 'id' );

  }

  function getParentWithClass( el, className ) {

    var parent = el;
    var currentClass;

    while ( parent && parent !== document.body ) {

      currentClass = parent.className;

      if (
        typeof currentClass === 'string' &&
        ( ' ' + currentClass + ' ' ).indexOf( ' ' + className + ' ' ) >= 0
      ) {

        return parent;

      }

      parent = parent.parentNode;

    }

    return false;

  }


  function showFeedback( el ) {

    var parent = getParentWithClass( el, 'aid-footer__faces' );
    var thanks = document.createElement('div');

    if ( !parent ) {

      return;

    }

    if ( parent.getAttribute( 'data-feedback-shown' ) === 'true' ) {

      return;

    }

    parent.setAttribute( 'data-feedback-shown', 'true' );

    thanks.className = 'aid-feedback-thanks';
    thanks.innerHTML = 'Takk for tilbakemeldingen!';

    parent.appendChild( thanks );

    if ( typeof Velocity === 'function' ) {

      Velocity(
        thanks,
        'slideDown',
        { duration: 300, easing: 'easeInOutQuart' }
      );

    }
    else {

      thanks.style.display = 'block';

    }

  }



  function showDebugMsg( msg ) {

    if ( !debug ) {
      return;
    }

    window.console.log( msg );

  }



}();


//  attribute polyfill
;(function(prototype) {
  prototype.hasAttribute = prototype.hasAttribute || function(name) {
      return !!(this.attributes[name] &&
                this.attributes[name].specified);
  }
})(Element.prototype);
