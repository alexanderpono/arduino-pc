#include "SerialAPIController.h"

SerialAPIController serialAPICtrl;

void setup() {
  Serial.begin(9600); 

}

void loop() {
  serialAPICtrl.processSerialInputsUsingTick();
}
