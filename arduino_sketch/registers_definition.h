// Until pin 7 it's port D, from 8 to 13 it's port B; and analog pins from 14 to 19 (A0 to A5) are in port C
#define GET_DDR(pin) ((pin < 8) ? (DDRD) : ((pin < 14) ? (DDRB) : (DDRC)))
#define GET_PORT(pin) ((pin < 8) ? (PORTD) : ((pin < 14) ? (PORTB) : (PORTC)))
#define GET_PIN(pin) ((pin < 8) ? (PIND) : ((pin < 14) ? (PINB) : (PINC)))

// Get a bit mask for each port pin (refer to pinout below)
#define GET_BIT_MASK(pin) ((pin < 8) ? (1 << pin) : ((pin < 14) ? (1 << (pin-8)) : (1 << (pin-14))))

//                  +-\/-+
//            PC6  1|    |28  PC5 (AI 5)
//      (D 0) PD0  2|    |27  PC4 (AI 4)
//      (D 1) PD1  3|    |26  PC3 (AI 3)
//      (D 2) PD2  4|    |25  PC2 (AI 2)
// PWM+ (D 3) PD3  5|    |24  PC1 (AI 1)
//      (D 4) PD4  6|    |23  PC0 (AI 0)
//            VCC  7|    |22  GND
//            GND  8|    |21  AREF
//            PB6  9|    |20  AVCC
//            PB7 10|    |19  PB5 (D 13)
// PWM+ (D 5) PD5 11|    |18  PB4 (D 12)
// PWM+ (D 6) PD6 12|    |17  PB3 (D 11) PWM
//      (D 7) PD7 13|    |16  PB2 (D 10) PWM
//      (D 8) PB0 14|    |15  PB1 (D 9)  PWM
//                  +----+

// ASCII image of ATmega328 from https://github.com/arduino/Arduino/blob/cd798abd1b78cd1c8c629a0fba7a616498d05955/hardware/arduino/avr/variants/standard/pins_arduino.h#L89
// It is licensed under their therms (I think)
