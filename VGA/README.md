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
\tc,o,0 - text cursor is enabed
\tc,o,1 - text cursor is disabled
\tc,i,0 - text cursor is inversed
\tc,i,1 - text cursor uses color/background color
\tc,l,0 - text cursor is small
\tc,l,1 - text cursor is large (only for inversed cursor)


```

## Example

```
\c1Hello, world!\n\c2Good day!
```