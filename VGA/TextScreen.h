#include "VGAX.h"

#define TXT_SCREEN_W 24
#if defined(ATMEGA2560_HIGHRES)
    #define TXT_SCREEN_H 13
#elif defined(VGAX_2BPP_SERIAL_API)
    #define TXT_SCREEN_H 6
#else
    #define TXT_SCREEN_H 10
#endif

#define COLOR_BLACK 0
#define COLOR_1 1
#define COLOR_2 2
#define COLOR_3 3

#define RED COLOR_2
#define GREEN COLOR_1
#define YELLOW COLOR_3
#define BLACK COLOR_BLACK

void vgaPrintAscii(byte number, byte x, byte y, byte color);
extern VGAX vga;


class TextScreen
{
public:
    static void renderTextCursor();
    static void printChar(byte textX, byte textY, byte ch);
    static void clearTextCursor();
    static void clearChar(byte textX, byte textY, byte ch);
    static void dump();
    static byte getCharAt(byte x, byte y);
    static void setCharAt(byte x, byte y, byte ch);
    static void print(String s);
    static void println(String s);
    static void moveCursorTo(byte x, byte y);
    static void newLine();
    static void cls();
    static void clearAt(byte textX, byte textY);
    static void printAt(byte x, byte y, String s);
    static void renderTextCursorUsingTick();
    static void setColor(byte color);
    static void setBgColor(byte color);
    static void scrollUp();
    static void returnCaret();
    static void backspace();
    static byte textXToScreenX(byte textX);
    static byte textYToScreenY(byte textY);
    static void screenTargetXY(byte x, byte y);
    static void drawTextCursor();
    static void windowWH(byte w, byte h);
    static void disableTextCursor();
    static void enableTextCursor();
    static void disableInversedCursor();
    static void enableInversedCursor();
    static void disableLargeCursor();
    static void enableLargeCursor();

    static inline byte inverse(byte val) 
    {
        switch (val)
        {
            case 0:
                return 3;
            case 1:
                return 2;
            case 2:
                return 1;
            case 3:
                return 0;
    
            default:
                return 0;
        }
    }

    static inline void inverse4(byte x, byte y)
    {
        vga.putpixel(x,y,inverse(vga.getpixel(x,y)));
        x++;
        vga.putpixel(x,y,inverse(vga.getpixel(x,y)));
        x++;
        vga.putpixel(x,y,inverse(vga.getpixel(x,y)));
        x++;
        vga.putpixel(x,y,inverse(vga.getpixel(x,y)));
        return;
    }

    static byte windowW;
    static byte windowH;
    static byte cursorX;
    static byte cursorY;
    static byte screenTargetX;
    static byte screenTargetY;
    static byte colorMain;
    static byte bgColor;
    static byte flags;

private:
    static void clearBuffer();
};
