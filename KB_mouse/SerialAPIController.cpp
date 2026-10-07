#include "SerialAPIController.h"

boolean isReadingFromSerial = false;
byte myNumber;
int tickReading;
#define MAX_TICK_READING 10000

#define WORKING 1
#define BACK_SLASH 2
#define BACK_SLASH_DEVICE 3

byte SerialAPIController::state = WORKING;

void SerialAPIController::processSerialInputsUsingTick()
{
    if (Serial.available() > 0)
    {
        isReadingFromSerial = true;
        tickReading = 0;

        myNumber = Serial.read();

        if (state == WORKING) {
            switch (myNumber)
            {
            case '\\':
                state = BACK_SLASH;
                break;

            case 10:
                break;
    
            default:
                unsigned char c = (char)myNumber;
                Serial.println(c);
                break;
            }

        } else if (state == BACK_SLASH) {
            switch (myNumber)
            {
            case 'd':
                state = BACK_SLASH_DEVICE;
                break;

            case 'h':
                Serial.println(F("\\h - this help"));
                Serial.println(F("\\dt - get device type"));
                Serial.println(F("\\di - get device ID"));
                Serial.println(F("\\dv - get device version"));
                Serial.println(F("\\dc - get device capabilities"));
                state = WORKING;
                break;

                
            default:
                Serial.print(F("unsupported command: '\\"));
                Serial.print(String((char)myNumber));
                Serial.println("'");
                state = WORKING;

                break;
            }
        } else if (state == BACK_SLASH_DEVICE) {
            switch (myNumber)
            {
            case 't':
                Serial.println(F("COMPOSITE:KB,MOUSE"));
                state = WORKING;
                break;

            case 'i':
                Serial.println(F("COMPOSITE:002,004"));
                state = WORKING;
                break;

            case 'v':
                Serial.println(F("COMPOSITE:KB.Serial.0.1.0,MOUSE.Serial.0.1.0"));
                state = WORKING;
                break;

            case 'c':
                Serial.println(F("COMPOSITE:-,-"));
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
            }
        }
    }
}
