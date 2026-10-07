#ifdef ARDUINO
#include <Arduino.h>
#endif
#include <avr/pgmspace.h>


class SerialAPIController {
    public:
        static void processSerialInputsUsingTick();

    protected:
        static byte state;
};
