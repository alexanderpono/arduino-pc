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
\r - return caret
\n - new line
\\ - input \
\d - backspace
\c0 - set text color 0
\c1 - set text color 1
\c2 - set text color 2
\c3 - set text color 3
\b0 - set bg color 0
\b1 - set bg color 1
\b2 - set bg color 2
\b3 - set bg color 3
\cl - clear screen
\wp255,255; - text window position at pixels (x 0..159, y 0..40)

```

## Example

```
\c1Hello, world!\n\c2Good day!
```