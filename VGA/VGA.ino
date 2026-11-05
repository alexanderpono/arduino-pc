#define VGAX_BPP2_H30

#include "VGAX.h"
#include "VGAXUtils.h"
#include "TextScreen.h"
#include "SerialAPIController.h"
#include "VGAx-utils.h"
#include "pictures.h"

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
//  screen.setBgColor(GREEN);
//  String topLine    = "0000000000000";
//  String middleLine = "0           0";
//  String line3      = "1234567890123";
//  screen.print(F("333"));
//  screen.backspace();
//  screen.println(F("3"));
//  screen.println(F("10 PRINT A"));
//  screen.println(F("20 PRINT B"));
//  screen.println(F("30 PRINT C"));
//  screen.setColor(YELLOW);
//  screen.println(F("40 PRINT D"));
//  screen.print(F("50 PRINT E"));
//  screen.moveCursorTo(0,0);
//  screen.print(topLine);
//  screen.print(middleLine);
//  screen.setBgColor(YELLOW);

//  screen.grCopyScreenArea(screen.screenTargetX, screen.screenTargetY + FNT_NANOFONT_HEIGHT, 13*FNT_NANOFONT_WIDTH, FNT_NANOFONT_HEIGHT * (5-1), screen.screenTargetX, screen.screenTargetY);
//  graph.draw_line(1,6,5,6,RED);

//  screen.setColor(GREEN);
//  screen.print(line3);
//  screen.print(line3);
//
//  screen.setColor(RED);
//  screen.setBgColor(BLACK);
//  screen.print("123456789");
//
//  screen.println("1234");

  screen.renderGrCursor();
}
void loop() {
  screen.renderTextCursorUsingTick();
  serialAPICtrl.processSerialInputsUsingTick();

}
