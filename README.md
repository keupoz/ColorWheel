# ColorWheel.js

This is the simple HSV color wheel with touch support. Works on Canvas API

## Installation
Download and include the script file via `script` tag. Then initialize a picker:
```javascript
let picker = new ColorWheel(function (eventState, eventName) {
    // Do something here when color is changed
});
document.body.appendChild(picker.canvas);
```

## API

### Constructor
```javascript
let picker = new ColorWheel(callback, size);
```
 - `callback` is called after any changes of color. Called with parameters `eventState` and `eventName`
 - `size` is an optional parameter. Sets width and height of the picker. Default is `256`
 
#### Event states
 - `0`: initial color change when user clicked on canvas
 - `1`: color change while moving the cursor
 - `2`: end of moving cursor
 - `3`: setting the color from code
 
#### Event names
 - `rotateHue`: handler of changing hue
 - `moveTone`: handler of changing saturation and value
 - `setHSV`, `setHSL`: function used for changing the color from code. `eventState` is always `3`
 
### Properties

#### ColorWheel.version
Static property, contains version string tag
```javascript
ColorWheel.version; // '1.0'
```

#### ColorWheel.canvas
The `Canvas` element that can be added to page
```javascript
document.body.appendChild(picker.canvas);
picker.canvas.classList.add('picker');
```

#### ColorWheel.HSV and ColorWheel.HSL
These properties are the current color in HSV or HSL color space. Hue is presented in degrees, other values are in range `[0,1]`
```javascript
picker.HSL; // [30, 1, 0.5]
picker.HSV; // [30, 1, 1]
```

#### ColorWheel.css
This property contains the css string in HSL format
```javascript
// 'hsl(30, 100%, 50%)'
document.body.style.backgroundColor = picker.css;
```

### Methods

#### ColorWheel.setSize `(size)`
Sets picker size
```javascript
picker.setSize(300);
```

#### ColorWheel.setHSV `(hue, saturation, value)`
Sets color in HSV model
```javascript
picker.setHSV(30, 1, 1); // callback will be called
```

#### ColorWheel.setHSL `(hue, saturation, lightness)`
Sets color in HSL model
```javascript
picker.setHSL(30, 1, 0.5); // callback will be called
```

## License
Published under MIT license, 2018