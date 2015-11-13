# backgroundify-js

jQuery plugin to fill void around image that don't fit their parent container
nicely

## Demo

![Using blur](http://yuriyromadin.github.io/backgroundify-js/example1.png)

![Using dominant color](http://yuriyromadin.github.io/backgroundify-js/example2.png)

![Using blur](http://yuriyromadin.github.io/backgroundify-js/example3.png)

![Using dominant color](http://yuriyromadin.github.io/backgroundify-js/example4.png)

## Usage

```javascript
// Blur with optional radius parameter
$('.blur').backgroundify({
  type: 'blur'
  radius: 2, // [optional]
  saturation: 0.5 // [optional]
});

// Dominant color extraction with optional border amount parameter
$('.color').backgroundify({
  type: 'dominant',
  border: 0.1 // [optional] - only look up dominant color using image edge, i.e. 10% edge
});
```
