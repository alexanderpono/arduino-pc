# VGA controller with serial interface

## Software
...

## Hardware
...

## Connection
Baud rate 9600

## Commands

```
\h - this help
\r - send return caret
\n - send new line
\\ - send \
\bs - send backspace
\c[0..3] - set text color 0/1/2/3. Example: \c0
\b[0..3] - set bg color 0/1/2/3. Example: \b0
\cl - clear screen
\wp255,255; - set text window position at pixels (x 0..159, y 0..40)
\dt - get device type
\di - get device ID
\dv - get device version
\dc - get device capabilities
\tco0 - set text cursor is disabed
\tco1 - set text cursor is enabed
\tci0 - set text cursor is inversed
\tci1 - set text cursor uses color/background color
\tcl0 - set text cursor is small
\tcl1 - set text cursor is large (only for inversed cursor)
\tcp255,255; - set text cussor position at chars (x 0..24 y 0..10)
\gco0 - turn graphics cursor off
\gco1 - turn graphics cursor on
\gcp255,255; - set graphics cursor position (x 0..159, y 0..40)
```

## Example

```
\c1Hello, world!\n\c2Good day!
```