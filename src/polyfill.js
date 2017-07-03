(function(window){
  // Prepare configuration
  window.iFramePositionFixPolyfillConfiguration = window.iFramePositionFixPolyfillConfiguration || {};
  // Merge configuration
  window.iFramePositionFixPolyfillConfiguration.debug = window.iFramePositionFixPolyfillConfiguration.debug || false;
  window.iFramePositionFixPolyfillConfiguration.parent = window.iFramePositionFixPolyfillConfiguration.parent || window.parent;
  window.iFramePositionFixPolyfillConfiguration.parentScrollTopProperty = window.iFramePositionFixPolyfillConfiguration.parentScrollTopProperty || 'pageYOffset';
  // Static helpers
  window.iFramePositionFixPolyfillConfiguration.log = function () {
    if ( window.iFramePositionFixPolyfillConfiguration.debug )
      console.log( '>> iFramePositionFixPolyfillConfiguration:', arguments );
  }
  // Initialize this polyfill when the document has been fully loaded, including CSS
  window.addEventListener('load', initPolyfill, false);
  // Observe for new added elements
  var observer = new MutationObserver(initPolyfill);
  observer.observe(document.documentElement, {
      childList: true,
      subtree: true
  });
  // -------------------------------------------------------------------
  function loop ( elements, callback ) {
    if ( elements ) {
      for ( var i = 0; i < elements.length; i++ ) {
        if ( callback ) callback( elements[i] );
      }
    }
  }
  // -------------------------------------------------------------------
  function initPolyfill () {
    if ( document.styleSheets ) {
      loop( document.styleSheets, function ( styleSheet ){
        loop( styleSheet.rules, function ( rule ){
          if ( rule.style ) {
            if ( rule.style.position == 'fixed' ) {
              loop( document.querySelectorAll( rule.selectorText ), function ( element ){
                new iFramePositionFixPolyfill( element, rule.style );
              })
            }
          }
        })
      });
    }
  }
  // -------------------------------------------------------------------
  function iFramePositionFixPolyfill ( element, initialStyles ) {
    var me = this,
        isInitialized = ( element.getAttribute('data-iframe-position-fixed-initialized') === "true" );

    if ( !isInitialized ) {
      // Define properties
      me.element = element;
      me.initialTop = 0;
      me.updateTimeout = null;
      me.position;

      // Define internal functions
      me.update = function ( scrollTop ) {
        window.iFramePositionFixPolyfillConfiguration.log( 'updateScroll', me, scrollTop );
        me.position = me.initialTop + scrollTop + 'px';
        window.requestAnimationFrame(function(){me.element.style.transform = 'translateY(' + me.position + ')'});
      }

      // Initialize element position
      me.position = me.initialTop + 'px';
      me.element.style.transform = 'translateY(' + me.position + ')'
      me.element.style.willChange = 'transform';
      me.element.style.transition = '0.3s cubic-bezier(0.92, 0.13, 0.12, 0.96)';//'.3s cubic-bezier(.17,.36,0,1)'; // '.1s cubic-bezier(.55,0,.1,1)';
      me.element.setAttribute( 'data-iframe-position-fixed-initialized', true );

      // When the parent scrolls, attempt to update the element position ever 500ms.
      // If another scroll event comes in place, cancel the previous attempt and retry.
      window.iFramePositionFixPolyfillConfiguration.parent.addEventListener( 'scroll', function ( event ){
        me.update( window.iFramePositionFixPolyfillConfiguration.parent[ window.iFramePositionFixPolyfillConfiguration.parentScrollTopProperty ] )
      }, true)
    }
  }
})(window);