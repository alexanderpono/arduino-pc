#define VGAX_BPP2_H30

#include "VGAX.h"
#include "VGAXUtils.h"
#include "TextScreen.h"
#include "SerialAPIController.h"

VGAX vga;
TextScreen screen;
VGAXUtils graph;
SerialAPIController serialAPICtrl;

void setup() {
  Serial.begin(9600); 

  vga.begin();
//  vga.copy((byte*)img_guyelaine_data);
//  graph.draw_rect(0,0,17,10,YELLOW,GREEN);
//  graph.draw_rect(0,0,66,37,YELLOW,GREEN);
//  screen.screenTargetXY(1,1);
//  screen.windowWH(13,5);
  screen.setColor(RED);
//  String topLine    = "0000000000000";
//  String middleLine = "0           0";
//  String line3      = "1234567890123";
//  screen.print("A");
//  screen.moveCursorTo(0,0);
//  screen.print(topLine);
//  screen.print(middleLine);
  screen.dump();
//  graph.draw_line(1,6,5,6,RED);

//  screen.setColor(GREEN);
//  screen.print(line3);
//  screen.print(line3);
//  screen.dump();
//
//  screen.setColor(RED);
//  screen.setBgColor(BLACK);
//  screen.print("123456789");
//  screen.dump();
//
//  screen.println("1234");
//  screen.dump();

  screen.renderGrCursor();
}
void loop() {
  screen.renderTextCursorUsingTick();
  serialAPICtrl.processSerialInputsUsingTick();

}
