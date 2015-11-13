/*!
 * jQuery plugin for create stunning image backgrounds
 * Original author: @yuriyromadin
 * Licensed under the MIT license
 * Version: 1.0
 */

;(function ( $, window, document, undefined ) {

  /* Defining plugin constants and default variables */
  var pluginName = 'backgroundify',
      filterTempalte = '<svg><defs><filter id="{0}"><feGaussianBlur in="SourceGraphic" stdDeviation="{2}"/><feComponentTransfer><feFuncA type="discrete" tableValues="1 1"/></feComponentTransfer><feColorMatrix type="saturate" values="{1}"/></filter></defs></svg>',
      backgroundTempalte = '<div class="backgroundify-wrap"><svg class="backgroundify-svg"><image preserveAspectRatio="none" xlink:href="{0}" width="100%" height="100%" filter="url(#{1})" /></svg></div>',
      filterIdTemplate = 'backroundify_blur_{0}',
      css = '<style>.backgroundify-wrap{height:100%;position:absolute;top:0;left:0;right:0;bottom:0;width:100%;z-index:0;}.backgroundify-svg{height:100%!important;vertical-align:top!important;width:100%!important;}</style>',
      defaults = {
          type: 'blur',
          radius: 10,
          border: null,
          saturation: 0.5
      };

  /* Set of helper functon to process color data */
  var toHex = function(str){
        return '#' + str;
      },
      toRGB = function(r, g, b){
        return r + ',' + g + ',' + b;
      },
      rgbToHex = function(rgb){
        var ch = rgb.split(','),
            r = ch[0], g = ch[1], b = ch[2];

        return toHex(channelToHex(r) + channelToHex(g) + channelToHex(b));
      },
      channelToHex = function (c) {
        var hex = parseInt(c).toString(16);
        return hex.length == 1 ? '0' + hex : hex;
      };


  /**
   * Takes a format string and an arbitrary set of positional arguments.
   * Places positional arguments into format string and return result string
   *
   * @param {String} format string - The template string to be formatted
   * @param {... String|Number}  - set of variables to insert into template string
   * @returns {String} - resulting string
   */
  var format = function() {
    var args = Array.prototype.slice.call(arguments),
        string = args.shift();

    return string.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };

  var exists = function(id){
    if($(toHex(id)).length){
      return true;
    } else {
      return false;
    }
  };

  /**
   * Main jQuery plugin class. Is called on every element in set
   *
   * @param {HTMLElement} element - DOM node representing image to be processed
   * @param {Object} options - set of options to apply for this plugin instance
   * @returns {jQuery} - jQuery object to allow chaining
   */
  function Class(element, options) {
    this.element = element;
    this.options = $.extend( {}, defaults, options) ;
    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }

  /**
   * Extracts most used color from image using canvas element
   * Can also be configered to look only at outer edge of the image, ignoring
   * central part, as it not often relevant to the background
   * NOTE: image should be loaded from the same domain (CORS)
   *
   * @param {String} imageUrl - url from most used color should be extracted
   * @param {Float} [border] - outer edge of the image (i.e. outer 10%)
   * @returns {Deferred} - jQuery deferred object, can be use to subscribe to events
   */
  Class.prototype.extractDominantPixel = function(imageUrl, border){

    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        image = new Image(),
        $deferred = $.Deferred();

    /**
     * Iterate over each pixel and return most used rgb color
     *
     * @param {ImageData } image - image data object to extract color from
     * @param {Float} [border] - use only outter edge of the image to extract color
     * @returns {String} maxRGB - most used color in rgb representation
     */
    var extractColor = function(image, border){
      var colors = {},
          max = 0,
          maxRGB = '255,255,255';

      for(var i = 0; i < image.data.length; i += 4){
        var r = image.data[i],
            g = image.data[i + 1],
            b = image.data[i + 2],
            rgb = toRGB(r, g, b),
            color = colors[rgb] || 0;

        if(border){
          var x = (i / 4) % image.width,
              y = Math.floor((i / 4) / image.width),
              minX = image.width * border,
              maxX = image.width - minX,
              minY = image.height * border,
              maxY = image.height - minY;

          /* If current coordinates are in the image center ignore this color */
          if( (y > minY && y < maxY) && (x > minX && x < maxX)  ) {
            continue;
          }
        }

        if (color > max){
          max = color;
          maxRGB = rgb;
        }
        colors[rgb] = (++color);
      }
      return maxRGB;
    };

    image.onload = function() {

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);

      var imageData = ctx.getImageData(0, 0, image.width, image.height),
          hex = rgbToHex(extractColor(imageData, border));

      $deferred.resolve(hex);
      canvas = null;
    };
    image.crossOrigin = 'Anonymous';
    image.src = imageUrl;

    return $deferred;
  };


  /**
   * Applies blurred background to the given image. Places blurred image
   * in the image parent container and stretches to full width/height
   *
   * @param {jQuery} $parent - jQuery object, where blurred image should be placed
   * @param {String} src - url to the image that should be blurred
   * @returns {undefined} - this function returns nothing
   */

  Class.prototype.applyBlur = function($parent, src){
    var id = format(filterIdTemplate, this.options.radius),
        background = format(backgroundTempalte, src, id),
        filter = format(filterTempalte, id, this.options.saturation, this.options.radius),
        wrapId = format(filterIdTemplate, 'filter_wrap');

    if(!exists(wrapId)){
      $filterWrap = $('<div>', { id: wrapId }).appendTo('body');
    }

    if(!exists(id)){
      $filterWrap.append(filter);
    }

    $parent.append(background);
  };

  Class.prototype.init = function () {
    var $this = $(this.element),
        $parent = $this.parent(),
        src = this.element.src;

    switch(this.options.type){
      case 'blur':
        this.applyBlur($parent, src);
          break;

      case 'dominant':
        this
          .extractDominantPixel(src, this.options.border)
            .done(function(hex){
              $parent.css('background-color', hex);
            });
          break;
    }
  };

  /* Very simple wrapper preventing against multiple instantiations */
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName,
        new Class( this, options ));
      }
    });
  };

  /* Insert plugin custom css into document's head */
  $(css).appendTo('head');

})( jQuery, window, document );
