# backgroundify-js

jQuery plugin to fill void around image that don't fit their parent container
nicely

## Demo

[View demo](http://yuriyromadin.github.io/backgroundify-js/)

## Usage

```javascript
// Blur with optional radius parameter
$('.blur').backgroundify({
  type: 'blur'
  radius: 2,
});

// Dominant color extraction with optional border amount parameter
$('.color').backgroundify({
  type: 'dominant',
  border: 0.1
});
```
