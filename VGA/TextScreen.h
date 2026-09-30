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

void vgaPrintAscii(byte number, byte x, byte y, byte color);

class TextScreen
{
public:
    static void renderCursor();
    static void printChar(byte textX, byte textY, byte ch);
    static void clearCursor();
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
    static void renderCursorUsingTick();
    static void setColor(byte color);
    static void setBgColor(byte color);
    static void scrollUp();
    static void returnCaret();
    static void backspace();

    static byte cursorX;
    static byte cursorY;
    static boolean isInitialDraw;
    static byte colorMain;
    static byte bgColor;

private:
    static void clearBuffer();
};
