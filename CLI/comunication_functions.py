import serial
import time

ADDRESS_BITS = 16


class Programmer():
    def __init__(self, BAUD_RATE):
        self.baud_rate = BAUD_RATE
        self.port = ''
        
    def get_port_name(self):
        for i in range(0, 256):                                                        # Select right port (GNU/Linux and Windows)
            for serial_name in ['/dev/ttyUSB', '/dev/ttyACM', 'COM']:
                try:
                    arduino = serial.Serial(serial_name+str(i), self.baud_rate, timeout=.1)
                    for times in range(0, 100):
                        data = arduino.readline()[:-2]
                        if data:
                            self.port = serial_name+str(i)
                            return serial_name+str(i)
                except KeyboardInterrupt:
                        self.port = 'STOP'
                        return 'STOP'
                except:
                    pass
        self.port = 'STOP'
        return 'STOP'
    
    def connect_to_arduino(self):
        if self.port == 'STOP':
            exit('Port not found!')
        elif self.port:
            print('Connecting to arduino on port', self.port)
            self.arduino = serial.Serial(self.port, self.baud_rate, timeout=0.5)
            time.sleep(3)
            self.arduino.write("OK".encode())
            time.sleep(3)
            self.arduino.flushInput()
        else:
            print('Port not selected, run get_port_name() first.')
            


    def read(self, begin = 0, length = 2**ADDRESS_BITS):
        if length == 0:
            command = 'r'.encode() 
        else:
            command = 'R'.encode()
        
        command += bytes([(begin & 0xff00) >> 8, (begin & 0xff)])        # Split upper and lower byte and append to 'r' command
        
        if length != 0:
            command += bytes([(length & 0xff00) >> 8, (length & 0xff)])        # Split upper and lower byte and append to 'r' command
        
        print(command)
        self.arduino.write(command)
        
        n_read_bytes = 0
        read_bytes = bytes()
        while n_read_bytes <= length:
            read_byte = self.arduino.read()
            if read_byte:
                read_bytes += read_byte
                n_read_bytes += 1
    #            if read_byte != b'\xff':
    #                print(read_byte)
            else:
                return read_bytes, 'READ ERROR'
        return read_bytes


    def write(self, data, begin = 0):
        length = len(data) - 1
        if length == 0:
            command = 'w'.encode() 
        else:
            command = 'W'.encode()
        
        command += bytes([(begin & 0xff00) >> 8, (begin & 0xff)])        # Split upper and lower byte and append to 'r' command
        
        if length == 0:
            command += data
            self.arduino.write(command)
            return
        
        command += bytes([(length & 0xff00) >> 8, (length & 0xff)])        # Split upper and lower byte and append to 'r' command
        
        print(command)
        self.arduino.write(command)
        
        n_wrote_bytes = 0
        while n_wrote_bytes <= length:
            self.arduino.write(data[n_wrote_bytes:n_wrote_bytes+1])            # Use slice to get a byte object
    #        print(data[n_wrote_bytes:n_wrote_bytes+1])
    #        print('Done', data[n_wrote_bytes:n_wrote_bytes+1])
            n_wrote_bytes += 1
            if (n_wrote_bytes % 64)  == 0:
                time.sleep(0.02)



    def benchmark(self, N = 16):
        print('Begin writing', 2**N, '0x00 bytes')
        start = time.time()
        self.write(b'\x00'*(2**N), begin=0)
        time_difference = time.time()-start
        print('Wrote', 2**N,'0x00 in', int(time_difference), 's', round((time_difference-int(time_difference))*1000, 2), 'ms')

        while self.arduino.read():
            pass

        start = time.time()
        read_bytes = self.read(begin=0, length=(2**N-1))
        time_difference = time.time()-start
        print('Read', 2**N, 'bytes in', int(time_difference), 's', round((time_difference-int(time_difference))*1000, 2), 'ms')
        
        errors = 0
        address = 0
        for el in read_bytes:
            if el != 0x00:
                try:
                    print('ERROR at address', hex(address),':', hex(el))
                except:
                    print('ERROR at address', hex(address),':', el)
                errors += 1
            address += 1
        print('Found errors:', errors+(2**N-address))

        time.sleep(1)

        while self.arduino.read():
            pass
        
        print('\nBegin writing', 2**N, '0xff bytes')
        start = time.time()
        self.write(b'\xff'*(2**N), begin=0)
        time_difference = time.time()-start
        print('Wrote', 2**N,'0xff in', int(time_difference), 's', round((time_difference-int(time_difference))*1000, 2), 'ms')

        while self.arduino.read():
            pass

        start = time.time()
        read_bytes = self.read(begin=0, length=(2**N-1))
        time_difference = time.time()-start
        print('Read', 2**N, 'bytes in', int(time_difference), 's', round((time_difference-int(time_difference))*1000, 2), 'ms')
        
        errors = 0
        address = 0
        for el in read_bytes:
            if el != 0xff:
                try:
                    print('ERROR at address', hex(address),':', hex(el))
                except:
                    print('ERROR at address', hex(address),':', el)
                errors += 1
            address += 1
        print('Found errors:', errors+(2**N-address))