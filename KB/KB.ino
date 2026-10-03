#include "SerialAPIController.h"
#include <PS2Keyboard.h>
const int DataPin = 8;
const int IRQpin =  3;
PS2Keyboard keyboard;

SerialAPIController serialAPICtrl;

void setup() {
  Serial.begin(9600); 
  keyboard.begin(DataPin, IRQpin);

}

void loop() {
  serialAPICtrl.processSerialInputsUsingTick();

  if (keyboard.available()) {
      // read the next key
      char c = keyboard.read();
      switch (c) {
          case PS2_ESC:
              Serial.println("[ESC]");
          break;

          case PS2_ENTER:
              Serial.println("[ENTER]");
          break;

          case PS2_BACKSPACE:
              Serial.println("[BACKSPACE]");
          break;

          case PS2_TAB:
              Serial.println("[TAB]");
          break;

          case PS2_PAGEUP:
              Serial.println("[PAGEUP]");
          break;

          case PS2_PAGEDOWN:
              Serial.println("[PAGEDOWN]");
          break;

          case PS2_UPARROW:
              Serial.println("[UPARROW]");
          break;

          case PS2_LEFTARROW:
              Serial.println("[LEFTARROW]");
          break;

          case PS2_DOWNARROW:
              Serial.println("[DOWNARROW]");
          break;

          case PS2_RIGHTARROW:
              Serial.println("[RIGHTARROW]");
          break;

          case ' ':
              Serial.println("[SPACE]");
          break;

          default:
              Serial.println(c);
          
      }
      return c; 
  }
  
}
