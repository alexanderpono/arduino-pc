#include <PS2MouseHandler.h>
#define MOUSE_DATA 5
#define MOUSE_CLOCK 6

#include "SerialAPIController.h"

#define BT_LEFT 1
#define BT_MIDDLE 2
#define BT_RIGHT 3


PS2MouseHandler mouse(MOUSE_CLOCK, MOUSE_DATA, PS2_MOUSE_REMOTE);
uint8_t id; // device id
uint8_t st; // Status Byte
int16_t xmove; // X Movement Data
int16_t ymove; // Y Movement Data
int16_t zmove; // Z Movement Data - scroll wheel
bool bt0; // get status of left mouse button
bool bt1; // get status of middle mouse button
bool bt2; // get status of right mouse button
bool isBt0Clicked; // has left button been clicked this update?
bool isBt1Clicked; // has middle button been clicked this update?
bool isBt2Clicked; // has right button been clicked this update?

uint8_t old_id;
uint8_t old_st;
int16_t old_xmove;
int16_t old_ymove;
int16_t old_zmove;
bool old_bt0;
bool old_bt1;
bool old_bt2;
bool old_isBt0Clicked;
bool old_isBt1Clicked;
bool old_isBt2Clicked;

void copyCurToPrev()
{
    old_id = id;
    old_st = st;
    old_xmove = xmove;
    old_ymove = ymove;
    old_zmove = zmove;
    old_bt0 = bt0;
    old_bt1 = bt1;
    old_bt2 = bt2;
    old_isBt0Clicked = isBt0Clicked;
    old_isBt1Clicked = isBt1Clicked;
    old_isBt2Clicked = isBt2Clicked;
}

void readCurData()
{
    mouse.get_data();
    id = mouse.device_id(); // device id
    st = mouse.status(); // Status Byte
    xmove = mouse.x_movement(); // X Movement Data
    ymove = mouse.y_movement(); // Y Movement Data
    zmove = mouse.z_movement(); // Z Movement Data - scroll wheel
    bt0 = mouse.button(0); // get status of left mouse button
    bt1 = mouse.button(1); // get status of middle mouse button
    bt2 = mouse.button(2); // get status of right mouse button
    isBt0Clicked = mouse.clicked(0); // has left button been clicked this update?
    isBt1Clicked = mouse.clicked(1); // has middle button been clicked this update?
    isBt2Clicked = mouse.clicked(2); // has right button been clicked this update?
}

SerialAPIController serialAPICtrl;

void setup() {
    Serial.begin(9600);
    if(mouse.initialise() != 0){
        Serial.println("mouse error");
    };

    readCurData();
    copyCurToPrev();
}

void checkBtStatus(bool now, bool old, byte btIndex)
{
    if (now != old)
    {
        if (now == 1)
        {
            Serial.print("DOWN,");
        } else {
            Serial.print("UP,");
        }
        switch (btIndex)
        {
            case BT_LEFT:
              Serial.print("L");
              break;
            case BT_MIDDLE:
              Serial.print("M");
              break;
            default:
              Serial.print("R");
              break;
        }
        Serial.println();
    }
    
}

unsigned long last_run = millis();

void loop()
{
    serialAPICtrl.processSerialInputsUsingTick();

    if (millis() - last_run > 200) {
        last_run = millis();

        readCurData();
        checkBtStatus(bt0, old_bt0, BT_LEFT);
        checkBtStatus(bt1, old_bt1, BT_MIDDLE);
        checkBtStatus(bt2, old_bt2, BT_RIGHT);
        
        if ((xmove != old_xmove) || (ymove != old_ymove) || (zmove != old_zmove))
        {
            if ((xmove != 0) || (ymove != 0) || (zmove != 0))
            {
                Serial.print("MOVE,");
                Serial.print(xmove);
                Serial.print(",");
                Serial.print(ymove);
                Serial.print(";");
                Serial.println();
            }
        }
        
        copyCurToPrev();
    }
}
