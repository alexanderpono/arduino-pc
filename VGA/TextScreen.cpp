#include "VGAX.h"
#include "TextScreen.h"
#include "VGAx-utils.h"

unsigned int counter = 0; 

byte TextScreen::cursorX = 0;
byte TextScreen::cursorY = 0;
byte TextScreen::grCursorX = 0;
byte TextScreen::grCursorY = 0;
byte TextScreen::screenTargetX = 0;
byte TextScreen::screenTargetY = 0;
byte TextScreen::windowW = TXT_SCREEN_W;
byte TextScreen::windowH = TXT_SCREEN_H;
byte TextScreen::colorMain = COLOR_1;
byte TextScreen::bgColor = COLOR_BLACK;
byte textTmp;
byte TextScreen::flags = IS_TEXT_CURSOR_ON | IS_TEXT_CURSOR_INVERSED;

void TextScreen::clearTextCursor()
{
    if ((flags & IS_TEXT_CURSOR_ON) == 0)
    {
        return;
    }

    if ((flags & IS_TEXT_CURSOR_VISIBLE) == IS_TEXT_CURSOR_VISIBLE) {
        if ((flags & IS_TEXT_CURSOR_INVERSED) == IS_TEXT_CURSOR_INVERSED) {
            drawTextCursor();
        } else {
            clearChar(cursorX, cursorY, byte(95));
        }
        flags = flags & NOT_IS_TEXT_CURSOR_VISIBLE;
    }
}

void TextScreen::renderTextCursor()
{
    if ((flags & IS_TEXT_CURSOR_ON) == 0)
    {
        return;
    }

    if ((flags & IS_TEXT_CURSOR_INVERSED) == IS_TEXT_CURSOR_INVERSED) {
        drawTextCursor();

        if ((flags & IS_TEXT_CURSOR_VISIBLE) == IS_TEXT_CURSOR_VISIBLE) {
            flags = flags & NOT_IS_TEXT_CURSOR_VISIBLE;
        } else {
            flags = flags | IS_TEXT_CURSOR_VISIBLE;
        }
    } else {
        printChar(cursorX, cursorY, byte(95));
        flags = flags | IS_TEXT_CURSOR_VISIBLE;
    }
}

void TextScreen::renderGrCursor()
{
    if ((flags & IS_GR_CURSOR_ON) == 0)
    {
        return;
    }

    vga.putpixel(grCursorX,grCursorY,inverse(vga.getpixel(grCursorX,grCursorY)));

    if (((grCursorY + 1) < VGAX_HEIGHT) && ((grCursorX) < VGAX_WIDTH))
    {
        vga.putpixel(grCursorX,grCursorY+1,inverse(vga.getpixel(grCursorX,grCursorY+1)));
    }


    if (((grCursorY + 2) < VGAX_HEIGHT) && ((grCursorX) < VGAX_WIDTH))
    {
        vga.putpixel(grCursorX,grCursorY+2,inverse(vga.getpixel(grCursorX,grCursorY+2)));
    }

    if (((grCursorY) < VGAX_HEIGHT) && ((grCursorX+1) < VGAX_WIDTH))
    {
        vga.putpixel(grCursorX+1,grCursorY,inverse(vga.getpixel(grCursorX+1,grCursorY)));
    }

    if (((grCursorY) < VGAX_HEIGHT) && ((grCursorX+2) < VGAX_WIDTH))
    {
        vga.putpixel(grCursorX+2,grCursorY,inverse(vga.getpixel(grCursorX+2,grCursorY)));
    }

    if (((grCursorY+1) < VGAX_HEIGHT) && ((grCursorX+1) < VGAX_WIDTH))
    {
        vga.putpixel(grCursorX+1,grCursorY+1,inverse(vga.getpixel(grCursorX+1,grCursorY+1)));
    }


    if (((grCursorY+2) < VGAX_HEIGHT) && ((grCursorX+2) < VGAX_WIDTH))
    {
        vga.putpixel(grCursorX+2,grCursorY+2,inverse(vga.getpixel(grCursorX+2,grCursorY+2)));
    }

    if ((flags & IS_GR_CURSOR_VISIBLE) == IS_GR_CURSOR_VISIBLE) {
        flags = flags & NOT_IS_GR_CURSOR_VISIBLE;
    } else {
        flags = flags | IS_GR_CURSOR_VISIBLE;
    }
}

void TextScreen::clearGrCursor()
{
    if ((flags & IS_GR_CURSOR_ON) == 0)
    {
        return;
    }

    if ((flags & IS_GR_CURSOR_VISIBLE) == IS_GR_CURSOR_VISIBLE) {
        renderGrCursor();
        flags = flags & NOT_IS_GR_CURSOR_VISIBLE;
    }
}


void TextScreen::drawTextCursor()
{
    byte screenX = textXToScreenX(cursorX);
    byte screenY = textYToScreenY(cursorY);
    if ((flags & IS_TEXT_CURSOR_LARGE) == IS_TEXT_CURSOR_LARGE)
    {
        inverse4(screenX, screenY++);
        inverse4(screenX, screenY++);
        inverse4(screenX, screenY++);
        inverse4(screenX, screenY++);
        inverse4(screenX, screenY++);
        inverse4(screenX, screenY);
    } 
    else
    {
        inverse4(screenX, screenY + 5);
    }
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

void TextScreen::print(String s)
{
    clearTextCursor();
    for (byte i = 0; i < s.length(); i++)
    {
        if (cursorX < windowW)
        {
            printChar(cursorX, cursorY, s.charAt(i));
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
    vgaClear();
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
            printChar(curX, curY, s.charAt(i));
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

void TextScreen::renderTextCursorUsingTick()
{
    counter++;
    if (counter == SHOW_CURSOR_COUNT)
    {
        renderTextCursor();
    }
    if (counter == HIDE_CURSOR_COUNT)
    {
        counter = 0;
        clearTextCursor();
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

void TextScreen::grCopyScreenArea(byte srcX, byte srcY, byte w, byte h, byte targetX, byte targetY)
{
    byte x;
    byte y;
    byte lastX = srcX + w;
    byte lastY = srcY + h;
    byte tx;
    byte ty;
    for (y = srcY, ty = targetY; y < lastY; y++, ty++)
    {
        for (x = srcX, tx = targetX; x < lastX; x++, tx++)
        {
            vga.putpixel(tx, ty, vga.getpixel(x, y));
        }
    }
}


void TextScreen::scrollUp()
{
    clearTextCursor();
    clearGrCursor();

    grCopyScreenArea(
        screenTargetX, 
        screenTargetY + FNT_NANOFONT_HEIGHT, 
        windowW * FNT_NANOFONT_WIDTH, 
        FNT_NANOFONT_HEIGHT * (windowH-1), 
        screenTargetX, 
        screenTargetY);

    byte x, y;
    y = textYToScreenY(cursorY - 1);
    for (x = 0; x < windowW; x++)
    {
        grClearChar(textXToScreenX(x), y);
    }

    cursorX = 0;
    drawTextCursor();
}

void TextScreen::returnCaret() {
  cursorX = 0;  
}

void TextScreen::grClearChar(byte grX, byte grY)
{
    byte x;
    byte y;
    for (y = grY; y < grY + FNT_NANOFONT_HEIGHT; y++)
    {
        for (x = grX; x < grX + FNT_NANOFONT_WIDTH; x++)
        {
            vga.putpixel(x, y, bgColor);
        }
    }
}



void TextScreen::backspace() {
    if (cursorX > 0) {
        cursorX--;
        bgColor = COLOR_1;
        grClearChar(textXToScreenX(cursorX), textYToScreenY(cursorY));
    }
}

void TextScreen::screenTargetXY(byte x, byte y) 
{
    if ((x < VGAX_WIDTH) && (y < VGAX_HEIGHT)) {
        screenTargetX = x;
        screenTargetY = y;
    }
}

void TextScreen::windowWH(byte w, byte h)
{
    windowW = w;
    windowH = h;
}

void TextScreen::disableTextCursor()
{
    flags = flags & NOT_IS_TEXT_CURSOR_ON;
}

void TextScreen::enableTextCursor()
{
    flags = flags | IS_TEXT_CURSOR_ON;
}

void TextScreen::disableInversedCursor()
{
    flags = flags & NOT_IS_TEXT_CURSOR_INVERSED;
}

void TextScreen::enableInversedCursor()
{
    flags = flags | IS_TEXT_CURSOR_INVERSED;
}

void TextScreen::disableLargeCursor()
{
    flags = flags & NOT_IS_TEXT_CURSOR_LARGE;
}

void TextScreen::enableLargeCursor()
{
    flags = flags | IS_TEXT_CURSOR_LARGE;
}

void TextScreen::disableGrCursor()
{
    clearGrCursor();
    flags = flags & NOT_IS_GR_CURSOR_ON;
}

void TextScreen::enableGrCursor()
{
    flags = flags | IS_GR_CURSOR_ON;
    if ((flags & IS_GR_CURSOR_VISIBLE) == IS_GR_CURSOR_VISIBLE) {
        renderGrCursor();    
    }
    renderGrCursor();    
}

void TextScreen::moveGrCursorTo(byte x, byte y)
{
    clearGrCursor();
    grCursorX = x;
    grCursorY = y;
    renderGrCursor();
}
