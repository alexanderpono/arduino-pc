#include "VGAX.h"
#include "SerialAPIController.h"
#include "TextScreen.h"

#define KB_ENTER 13
#define KB_ESC 27
#define KB_SPACE 32
#define KB_AND 38
#define KB_DEL 127

boolean isReadingFromSerial = false;
byte myNumber;
extern TextScreen screen;
int tickReading;
#define MAX_TICK_READING 10000

#define WORKING 1
#define BACK_SLASH 2
#define BACK_SLASH_COLOR 3
#define BACK_SLASH_B 4
#define BACK_SLASH_WIN 5
#define BACK_SLASH_WIN_POSX 6
#define BACK_SLASH_WIN_POSY 7
#define BACK_SLASH_DEVICE 8

#define NUMBER_9 2
#define NUMBER_2 3
#define NUMBER_9N 4
#define NUMBER_2N 5
#define NUMBER_2NN 6
#define PARSE_ERROR 255
#define PARSE_IN_PROGRESS 0
#define PARSE_SUCCESS 1

byte SerialAPIController::state = WORKING;
byte numberParseState = WORKING;
byte numberParseResult = 0;
byte numberParseGoodFinish = ',';
byte param1 = 0;

static const unsigned char UNSUPPORTED_COMMAND[]            PROGMEM = "unsupported command: '\\";

void prepareParseNumber(byte goodFinish) {
    numberParseState = WORKING;
    numberParseResult = 0;
    numberParseGoodFinish = goodFinish;
}
byte parseNumber() {
    if (numberParseState == WORKING) {
        switch (myNumber)
        {
        case '0':
        case '1':
        case '2':
            numberParseState = NUMBER_2;
            numberParseResult = numberParseResult * 10 + (myNumber - '0');
            break;

        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            numberParseState = NUMBER_9;
            numberParseResult = numberParseResult * 10 + (myNumber - '0');
            break;

        default:
            numberParseState = WORKING;
            return PARSE_ERROR;
            break;
        }
    } else if (numberParseState == NUMBER_2) {
        if (myNumber == numberParseGoodFinish) {
            numberParseState = WORKING;
            return PARSE_SUCCESS;
        }
        switch (myNumber)
        {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            numberParseState = NUMBER_2N;
            numberParseResult = numberParseResult * 10 + (myNumber - '0');
            break;
        default:
            numberParseState = WORKING;
            return PARSE_ERROR;
            break;
        }
    } else if (numberParseState == NUMBER_9) {
        if (myNumber == numberParseGoodFinish) {
            numberParseState = WORKING;
            return PARSE_SUCCESS;
        }
        switch (myNumber)
        {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            numberParseState = NUMBER_9N;
            numberParseResult = numberParseResult * 10 + (myNumber - '0');
            break;
        default:
            numberParseState = WORKING;
            return PARSE_ERROR;
            break;
        }
    } else if (numberParseState == NUMBER_2N) {
        if (myNumber == numberParseGoodFinish) {
            numberParseState = WORKING;
            return PARSE_SUCCESS;
        }
        switch (myNumber)
        {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            numberParseState = NUMBER_2NN;
            numberParseResult = numberParseResult * 10 + (myNumber - '0');
            break;
        default:
            numberParseState = WORKING;
            return PARSE_ERROR;
            break;
        }
    } else if (numberParseState == NUMBER_2NN) {
        if (myNumber == numberParseGoodFinish) {
            numberParseState = WORKING;
            return PARSE_SUCCESS;
        }
        switch (myNumber)
        {
        default:
            numberParseState = WORKING;
            return PARSE_ERROR;
            break;
        }
    } else if (numberParseState == NUMBER_9N) {
        if (myNumber == numberParseGoodFinish) {
            numberParseState = WORKING;
            return PARSE_SUCCESS;
        }
        switch (myNumber)
        {
        default:
            numberParseState = WORKING;
            return PARSE_ERROR;
            break;
        }
    }

    return PARSE_IN_PROGRESS;
}

void printmsg(const unsigned char *msg) {
  while (pgm_read_byte(msg) != 0) {
      Serial.print(pgm_read_byte(msg++));
  }
}

void SerialAPIController::processSerialInputsUsingTick()
{
    if (Serial.available() > 0)
    {
        isReadingFromSerial = true;
        tickReading = 0;

        myNumber = Serial.read();
        screen.clearCursor();

        if (state == WORKING) {
            switch (myNumber)
            {
            case KB_SPACE:
                screen.print(" ");
                break;
    
            case '\\':
                state = BACK_SLASH;
                break;
    
            default:
                unsigned char c = (char)myNumber;
    //            Serial.println(c);
                if (c != 10)
                {
                    screen.print(String((char)(myNumber)));
                }
                break;
            }

        } else if (state == BACK_SLASH) {
            switch (myNumber)
            {
            case 'r':
                screen.returnCaret();
                state = WORKING;
                break;

            case 'n':
                screen.newLine();
                state = WORKING;
                break;

            case '\\':
                screen.print("\\");
                state = WORKING;
                break;

            case 'c':
                state = BACK_SLASH_COLOR;
                break;

            case 'b':
                state = BACK_SLASH_B;
                break;

            case 'd':
                state = BACK_SLASH_DEVICE;
                break;

            case 'h':
                Serial.println(F("\\h - this help"));
                Serial.println(F("\\r - send return caret"));
                Serial.println(F("\\n - send new line"));
                Serial.println(F("\\\\ - send \\"));
                Serial.println(F("\\bs - send backspace"));
                Serial.println(F("\\c[0..3] - set text color 0/1/2/3. Example: \\c0"));
                Serial.println(F("\\b[0..3] - set bg color 0/1/2/3. Example: \\b0"));
                Serial.println(F("\\cl - clear screen"));
                Serial.println(F("\\wp255,255; - set text window position at pixels (x 0..159, y 0..40)"));
                Serial.println(F("\\dt - get device type"));
                Serial.println(F("\\di - get device ID"));
                Serial.println(F("\\dv - get device version"));
                Serial.println(F("\\dc - get device capabilities"));
                state = WORKING;
                break;

            case 'w':
                state = BACK_SLASH_WIN;
                break;
                
            default:
                Serial.print(F("unsupported command: '\\"));
                Serial.print(String((char)myNumber));
                Serial.println("'");
                state = WORKING;

                break;
            }

        } else if (state == BACK_SLASH_COLOR) {
            switch (myNumber)
            {
            case '1':
                screen.dump();
                screen.setColor(COLOR_1);
                state = WORKING;
                break;

            case '2':
                screen.dump();
                screen.setColor(COLOR_2);
                state = WORKING;
                break;

            case '3':
                screen.dump();
                screen.setColor(COLOR_3);
                state = WORKING;
                break;

            case '0':
                screen.dump();
                screen.setColor(COLOR_BLACK);
                state = WORKING;
                break;

            case 'l':
                screen.cls();
                state = WORKING;
                break;

            default:
                Serial.print(F("unsupported command: '\\c"));
                Serial.print(String((char)myNumber));
                Serial.println("'");
                state = WORKING;

                break;
            }

        } else if (state == BACK_SLASH_B) {
            switch (myNumber)
            {
            case '1':
                screen.dump();
                screen.setBgColor(COLOR_1);
                state = WORKING;
                break;

            case '2':
                screen.dump();
                screen.setBgColor(COLOR_2);
                state = WORKING;
                break;

            case '3':
                screen.dump();
                screen.setBgColor(COLOR_3);
                state = WORKING;
                break;

            case '0':
                screen.dump();
                screen.setBgColor(COLOR_BLACK);
                state = WORKING;
                break;

            case 's':
                screen.backspace();
                state = WORKING;
                break;

            default:
                Serial.print(F("unsupported command: '\\b"));
                Serial.print(String((char)myNumber));
                Serial.println("'");
                state = WORKING;

                break;
            }

        } else if (state == BACK_SLASH_WIN) {
            switch (myNumber)
            {
            case 'p':
                state = BACK_SLASH_WIN_POSX;
                prepareParseNumber(',');
                break;

            default:
                Serial.print(F("unsupported command: '\\w"));
                Serial.print(String((char)myNumber));
                Serial.println("'");
                state = WORKING;
                break;
            }
        } else if (state == BACK_SLASH_WIN_POSX) {
            byte parseCode = parseNumber();
            if (parseCode == PARSE_SUCCESS) {
                state = BACK_SLASH_WIN_POSY;
                param1 = numberParseResult;
                prepareParseNumber(';');
            }
            if (parseCode == PARSE_ERROR) {
                Serial.print(F("syntax error: '\\wp"));
                Serial.print(String(numberParseResult));
                Serial.print(String((char)myNumber));
                Serial.println("'");
                state = WORKING;
            }
        } else if (state == BACK_SLASH_WIN_POSY) {
            byte parseCode = parseNumber();
            if (parseCode == PARSE_SUCCESS) {
                state = WORKING;
                screen.screenTargetXY(param1, numberParseResult);
            }
            if (parseCode == PARSE_ERROR) {
                Serial.print(F("syntax error: '\\wp"));
                Serial.print(String(param1));
                Serial.print(",");
                Serial.print(String(numberParseResult));
                Serial.print(String((char)myNumber));
                Serial.println("'");
                state = WORKING;
            }
        } else if (state == BACK_SLASH_DEVICE) {
            switch (myNumber)
            {
            case 't':
                Serial.println(F("VGA"));
                state = WORKING;
                break;

            case 'i':
                Serial.println(F("001"));
                state = WORKING;
                break;

            case 'v':
                Serial.print(F("VGAX."));
                Serial.print(F(VGAX_VERSION));
                Serial.println(F(".Serial.0.1.0"));
                state = WORKING;
                break;

            case 'c':
                Serial.print(F("w:"));
                Serial.print(String(VGAX_WIDTH));
                Serial.print(F(",h:"));
                Serial.print(String(VGAX_HEIGHT));
                Serial.print(F(",bpp:"));
                Serial.print(String(2));
                Serial.print(F(",tw:"));
                Serial.print(String(TXT_SCREEN_W));
                Serial.print(F(",th:"));
                Serial.print(String(TXT_SCREEN_H));
                Serial.println(F(""));
                state = WORKING;
                break;

            default:
                Serial.print(F("unsupported command: '\\d"));
                Serial.print(String((char)myNumber));
                Serial.println("'");
                state = WORKING;
                break;
            }
        }
    }
    else
    {
        if (isReadingFromSerial)
        {
            tickReading++;

            if (tickReading >= MAX_TICK_READING) {
              tickReading = 0;
              isReadingFromSerial = false;
              screen.dump();
            }
        }
    }
}
