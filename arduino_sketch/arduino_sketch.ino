/*
  // Legend: A - 8 bit of address; D - 8 bit data value
  'r'    Read single byte, format:                          rAA
  'w'    Write single byte, format:                         wAAD
  'c'    Get checksum, between addresses range (included):  cAAAA
  'R'    Read between addresses range (included):           RAAAA
  'W'    Write from starting address, format:               WAANNDDD... (there must be NN (as 16 bit binary number) data byte)
  'C'    Clear (write 0xff) addresses range, format:        CAAAA
*/

#define DATA_PIN_BEGIN 2
#define DATA_PIN_END 9


#define ADDRESS_SERIAL_DATA 13
#define ADDRESS_SERIAL_CLOCK 12
#define ADDRESS_RCLK A2

#define EEPROM_OUTPUT_ENABLE 11
#define EEPROM_WRITE_ENABLE 10

#define READ_DELAY 5                // us
#define WRITE_DELAY 5               // us
#define DELAY_AFTER_WRITE 10        // ms

#define LEN 15

#include "registers_definition.h"


uint16_t address, n_addresses;
uint8_t data, command, page[64];

void setup() {
  pinMode(ADDRESS_SERIAL_DATA, OUTPUT);
  pinMode(ADDRESS_SERIAL_CLOCK, OUTPUT);
  pinMode(ADDRESS_RCLK, OUTPUT);
  pinMode(EEPROM_OUTPUT_ENABLE, OUTPUT);
  pinMode(EEPROM_WRITE_ENABLE, OUTPUT);

  digitalWrite(ADDRESS_SERIAL_DATA, LOW);
  digitalWrite(ADDRESS_SERIAL_CLOCK, LOW);
  digitalWrite(ADDRESS_RCLK, LOW);
  digitalWrite(EEPROM_OUTPUT_ENABLE, LOW);
  digitalWrite(EEPROM_WRITE_ENABLE, HIGH);

  Serial.begin(115200);

  /*
  delay(100);

  data = 0xff;
  for (int i = 0; i < 40; i++){
  if (i == 20)
    data = 0xaa;  
    page[i] = data;
//    writeData(i, data);
  }
  writePage(0, 40, page);
  for (int i = 0; i < 40; i++){
    Serial.print(readData(i), HEX);
    Serial.print(" ");
  }
  Serial.println();
  data = 0x00;
  for (int i = 0; i < 40; i++){
    if (i == 20){
      data = 0x11;
    }
    page[i] = data;
//    writeData(i, data);
  }
  writePage(0, 40, page);
  for (int i = 0; i < 40; i++){
    Serial.print(readData(i), HEX);
    Serial.print(" ");
  }
  Serial.println();
  
  delay(100000);
*/
  while (!Serial.available()) {
    Serial.println("More informations at https://github.com/francesco-scar/Parallel_EEPROM_programmer_arduino");
  }

  delay(500);

  while (Serial.read() != -1);     // Flush buffer
}

void loop() {
  if (Serial.available()) {
    command = Serial.read();
    delay(2);
    

    // Legend: A - 8 bit of address; D - 8 bit data value, NN - 2 byte int number
    if (command == 'r') {              // Read single byte, format:                            rAA
      address = Serial.read();
      address = (address << 8) + Serial.read();
      data = readData(address);
      Serial.write(data);
    } else if (command == 'w') {              // Write single byte, format:                           wAAD
      address = Serial.read();
      address = (address << 8) + Serial.read();
      data = Serial.read();
      writeData(address, data);
    } else if (address == 'c') {              // Get checksum of NN addresses range from start addr:  cAANN
      address = Serial.read();
      address = (address << 8) + Serial.read();
      n_addresses = Serial.read();
      n_addresses = (n_addresses << 8) + Serial.read();
      char checksum = 0;
      for (uint32_t i = 0; i <= n_addresses; i++) {
        checksum = checksum ^ readData(address + i);  // XOR checksum with read byte
      }
      Serial.write(checksum);
    } else if (command == 'R') {              // Read NN addresses range from start address:          RAANN
      address = Serial.read();
      address = (address << 8) + Serial.read();
      n_addresses = Serial.read();
      n_addresses = (n_addresses << 8 )+ Serial.read();
      for (uint32_t i = 0; i <= n_addresses; i++) {
        Serial.write(readData(address + i));
      }
    } else if (command == 'W') {              // Write from starting address, format:                 WAANNDDD... (there must be NN (as 16 bit binary number) data byte)
      address = Serial.read();
      address = (address << 8) + Serial.read();
      n_addresses = Serial.read();
      n_addresses = (n_addresses << 8) + Serial.read();
      uint8_t nElement = 0;
      for (uint32_t i = 0; i <= n_addresses; i++) {
        while (!Serial.available());
        page[nElement] = Serial.read();
        nElement++;
        if ((((address + i) & 0b1111111111000000) != ((address + i + 1) & 0b1111111111000000)) || (i == n_addresses)){
          writePage(address + i - nElement + 1, nElement, page);
          nElement = 0;
        }
        /*
        data = Serial.read();
        writeData(address + i, data);
        */
//        Serial.print(data);
      }
      Serial.print('K');
    } else if (command == 'C') {              // Clear (write 0xff) NN addresses from start address:  CAANN
      // TODO
    }
  }
}

void setAddress (uint16_t address) {
  for (int8_t i = LEN - 1; i >= 0; i--) {
    //GET_PORT(TEST) |= GET_BIT_MASK(TEST);
    //digitalWrite(ADDRESS_SERIAL_DATA, (bool)(address & (1 << i)));
    if (address & (1 << i)){
      GET_PORT(ADDRESS_SERIAL_DATA) |= GET_BIT_MASK(ADDRESS_SERIAL_DATA);
    } else {
      GET_PORT(ADDRESS_SERIAL_DATA) &= ~GET_BIT_MASK(ADDRESS_SERIAL_DATA);
    }
    GET_PORT(ADDRESS_SERIAL_CLOCK) &= ~GET_BIT_MASK(ADDRESS_SERIAL_CLOCK);
    GET_PORT(ADDRESS_SERIAL_CLOCK) |= GET_BIT_MASK(ADDRESS_SERIAL_CLOCK);
    GET_PORT(ADDRESS_SERIAL_CLOCK) &= ~GET_BIT_MASK(ADDRESS_SERIAL_CLOCK);
  }

  GET_PORT(ADDRESS_RCLK) &= ~GET_BIT_MASK(ADDRESS_RCLK);
//  delayMicroseconds(ADDRESS_DELAY);
  GET_PORT(ADDRESS_RCLK) |= GET_BIT_MASK(ADDRESS_RCLK);
//  delayMicroseconds(ADDRESS_DELAY);
  GET_PORT(ADDRESS_RCLK) &= ~GET_BIT_MASK(ADDRESS_RCLK);
}





uint8_t readData (uint16_t address) {
  setAddress(address);

  //digitalWrite(EEPROM_OUTPUT_ENABLE, LOW);
  GET_PORT(EEPROM_OUTPUT_ENABLE) &= ~GET_BIT_MASK(EEPROM_OUTPUT_ENABLE);

  for (int i = DATA_PIN_BEGIN; i <= DATA_PIN_END; i++) {
//    pinMode(i, INPUT);
    GET_DDR(i) &= ~GET_BIT_MASK(i);
  }

  delayMicroseconds(READ_DELAY);

  uint8_t result = 0;
  for (int8_t i = DATA_PIN_BEGIN; i <= DATA_PIN_END; i++) {
//    result += (digitalRead(i) << (i - DATA_PIN_BEGIN));
    result += (((bool)(GET_PIN(i) & GET_BIT_MASK(i))) << (i - DATA_PIN_BEGIN));
  }
  return result;
}




void writeData(uint16_t address, char data) {
  GET_PORT(EEPROM_OUTPUT_ENABLE) |= GET_BIT_MASK(EEPROM_OUTPUT_ENABLE);

  for (int i = DATA_PIN_BEGIN; i <= DATA_PIN_END; i++) {
    pinMode(i, OUTPUT);
  }

  setAddress(address);

  for (int i = DATA_PIN_BEGIN; i <= DATA_PIN_END; i++) {
    digitalWrite(i, data & (1 << (i - DATA_PIN_BEGIN)));
  }

  digitalWrite(EEPROM_WRITE_ENABLE, HIGH);
  delayMicroseconds(WRITE_DELAY);
  digitalWrite(EEPROM_WRITE_ENABLE, LOW);
  delayMicroseconds(WRITE_DELAY);
  digitalWrite(EEPROM_WRITE_ENABLE, HIGH);
  delayMicroseconds(WRITE_DELAY);

  digitalWrite(EEPROM_OUTPUT_ENABLE, LOW);

  delay(DELAY_AFTER_WRITE);
}


void writePage(uint16_t address, uint8_t nElements, uint8_t *page) {
  GET_PORT(EEPROM_OUTPUT_ENABLE) |= GET_BIT_MASK(EEPROM_OUTPUT_ENABLE);

  for (int i = DATA_PIN_BEGIN; i <= DATA_PIN_END; i++) {
//    pinMode(i, OUTPUT);
    GET_DDR(i) |= GET_BIT_MASK(i);
  }

  for (uint8_t nElement = 0; nElement < nElements; nElement++){
    setAddress(address + nElement);
  
    for (int i = DATA_PIN_BEGIN; i <= DATA_PIN_END; i++) {
      if (page[nElement] & (1 << (i - DATA_PIN_BEGIN))){
        GET_PORT(i) |= GET_BIT_MASK(i);
      } else {
        GET_PORT(i) &= ~GET_BIT_MASK(i);
      }
    }
  
    GET_PORT(EEPROM_WRITE_ENABLE) |= GET_BIT_MASK(EEPROM_WRITE_ENABLE);
    GET_PORT(EEPROM_WRITE_ENABLE) &= ~GET_BIT_MASK(EEPROM_WRITE_ENABLE);
    GET_PORT(EEPROM_WRITE_ENABLE) |= GET_BIT_MASK(EEPROM_WRITE_ENABLE);
  }
  delay(DELAY_AFTER_WRITE);
  GET_PORT(EEPROM_OUTPUT_ENABLE) &= ~GET_BIT_MASK(EEPROM_OUTPUT_ENABLE);
}
