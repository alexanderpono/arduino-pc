#include "VGAX.h"
#include "TextScreen.h"
#include "VGAx-utils.h"

unsigned char screenBuf[TXT_SCREEN_H][TXT_SCREEN_W];
unsigned char atScreen[TXT_SCREEN_H][TXT_SCREEN_W];
unsigned int counter = 0; 

byte TextScreen::cursorX = 0;
byte TextScreen::cursorY = 0;
byte TextScreen::screenTargetX = 1;
byte TextScreen::screenTargetY = 1;
byte TextScreen::windowW = 13;
byte TextScreen::windowH = 5;
boolean TextScreen::isInitialDraw = true;
byte TextScreen::colorMain = COLOR_1;
byte TextScreen::bgColor = COLOR_BLACK;
byte textTmp;

void TextScreen::clearCursor()
{
    clearChar(cursorX, cursorY, byte(95));
}

void TextScreen::renderCursor()
{
    printChar(cursorX, cursorY, byte(95));
}

byte TextScreen::textXToScreenX(byte textX)
{
    return screenTargetX + textX * 5;
}
byte TextScreen::textYToScreenY(byte textY)
{
    return screenTargetY + textY * 6;
}

void TextScreen::printChar(byte textX, byte textY, byte ch)
{
    byte screenX = textXToScreenX(textX);
    byte screenY = textYToScreenY(textY);
    vgaPrintAscii(ch, screenX, screenY, colorMain);
}

void TextScreen::clearChar(byte textX, byte textY, byte ch)
{
    byte screenX = textXToScreenX(textX);
    byte screenY = textYToScreenY(textY);
    vgaPrintAscii(ch, screenX, screenY, bgColor);
}

void TextScreen::dump()
{
    byte textX = 0;
    byte textY = 0;
    byte newVal;
    byte oldVal;

    for (textY = 0; textY < windowH; textY++)
    {
        for (textX = 0; textX < windowW; textX++)
        {
            newVal = screenBuf[textY][textX];

            if (!TextScreen::isInitialDraw)
            {
                oldVal = atScreen[textY][textX];
                if (newVal != oldVal)
                {
                    clearChar(textX, textY, oldVal);
                    printChar(textX, textY, newVal);
                    atScreen[textY][textX] = newVal;
                }
            }
            else
            {
                printChar(textX, textY, newVal);
                atScreen[textY][textX] = newVal;
            }
        }
    }

    isInitialDraw = false;
}

void TextScreen::setCharAt(byte x, byte y, byte ch)
{
    screenBuf[y][x] = ch;
}

void TextScreen::print(String s)
{
    clearCursor();
    for (byte i = 0; i < s.length(); i++)
    {
        if (cursorX < windowW)
        {
            setCharAt(cursorX, cursorY, s.charAt(i));
            cursorX++;
            if (cursorX >= windowW)
            {
                cursorX = 0;
                cursorY++;
                if (cursorY >= windowH) {
                    scrollUp();
                    cursorY--;
                }
            }
        }
        else
        {
            cursorX = 0;
            cursorY++;
        }
    }
}

void TextScreen::println(String s)
{
    print(s);
    newLine();
}

void TextScreen::moveCursorTo(byte x, byte y)
{
    if (x < windowW && y < windowH)
    {
        cursorX = x;
        cursorY = y;
    }
}

void TextScreen::newLine()
{
    cursorX = 0;
    cursorY++;
    if (cursorY >= windowH) {
        scrollUp();
        cursorY--;
    }
}

void TextScreen::cls()
{
    cursorX = 0;
    cursorY = 0;
    clearBuffer();
    vgaClear();
}

void TextScreen::clearBuffer()
{
    unsigned char x;
    unsigned char y;
    byte val = ' ';

    for (y = 0; y < windowH; y++)
    {
        for (x = 0; x < windowW; x++)
        {
            setCharAt(x, y, val);
            atScreen[y][x] = val;
        }
    }
}

void TextScreen::clearAt(byte textX, byte textY) 
{
    vgaPrintAscii(byte(126), textXToScreenX(textX), textYToScreenY(textY), COLOR_BLACK);
}

void TextScreen::printAt(byte x, byte y, String s)
{
    byte curX = x;
    byte curY = y;
    for (byte i = 0; i < s.length(); i++)
    {
        if (curX < windowW)
        {
            setCharAt(curX, curY, s.charAt(i));
            curX++;
            if (curX >= windowW)
            {
                curX = 0;
                curY++;
            }
        }
        else
        {
            curX = 0;
            curY++;
        }
    }
}

#define SHOW_CURSOR_COUNT 30000
#define HIDE_CURSOR_COUNT 60000

void TextScreen::renderCursorUsingTick()
{
    counter++;
    if (counter == SHOW_CURSOR_COUNT)
    {
        renderCursor();
    }
    if (counter == HIDE_CURSOR_COUNT)
    {
        counter = 0;
        clearCursor();
    }
}

void TextScreen::setColor(byte color)
{
   colorMain = color;
}

void TextScreen::setBgColor(byte color)
{
   bgColor = color;
}

void TextScreen::scrollUp()
{
    unsigned char x;
    unsigned char y;
    byte val = ' ';

    for (y = 1; y < windowH; y++) //
    {
        byte *destLine = &screenBuf[y-1][0];
        byte *srcLine = &screenBuf[y][0];

        byte *dest = destLine;
        byte *src = srcLine;
        for (x = 0; x < windowW; x++)
        {
            *dest = *src;
            dest++;
            src++;
        }
    }

    for (x = 0; x < windowW; x++)
    {
        setCharAt(x, windowH - 1, val);
    }
}

byte TextScreen::getCharAt(byte x, byte y) {
    return screenBuf[y][x];
}

void TextScreen::returnCaret() {
  cursorX = 0;  
}

void TextScreen::backspace() {
    if (cursorX > 0) {
        cursorX--;
        textTmp = getCharAt(cursorX, cursorY);
        clearChar(cursorX, cursorY, textTmp);   
        moveCursorTo(cursorX, cursorY);
    }
}

void TextScreen::screenTargetXY(byte x, byte y) 
{
    if ((x < VGAX_WIDTH) && (y < VGAX_HEIGHT)) {
        screenTargetX = x;
        screenTargetY = y;
    }
}
