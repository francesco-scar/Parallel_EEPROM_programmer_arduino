import time
import sys
import os
from comunication_functions import *


BAUD_RATE = 115200

#arduino.write(payload.encode())

arg_parser = create_arg_parser()
parsed_args = arg_parser.parse_args(sys.argv[1:])



programmer = Programmer(BAUD_RATE)
port = programmer.get_port_name()
programmer.connect_to_arduino()


start_address = 0
if parsed_args.a:
    start_address = int(parsed_args.a, 16)              # The address is given in hexadecimal (base 16)

read_size = 2**16 - start_address                       # Default value is the entire memory size
if parsed_args.s:
    read_size = int(parsed_args.s, 0)                   # Try guess base of the string number
    if read_size > 2**16 - start_address:
        print('\033[93mWARN\033[0m: starting from address', hex(start_address), 'read size of', read_size, 'will exceed memory size. Read size will be resized to', 2**16 - start_address, 'bytes (from', hex(start_address), ' to end of memory)')
        read_size = 2**16 - start_address




if parsed_args.i and not(parsed_args.o) and not(parsed_args.t) and not(parsed_args.p) and not(parsed_args.b):
    if parsed_args.s:
        print('\033[93mWARN\033[0m: -s parameter is valid only with -o and -p options. It will be ignored in this case.')
    if not(os.path.exists(parsed_args.i)):
        exit('Input file ' + str(parsed_args.i) + ' does not exists, input file must be a valid file. If you want to read EEPROM memory use -o parameter.')
    input_file = open(parsed_args.i, 'rb')
    if not(parsed_args.force):
        print('Writing', len(input_file.read()), 'bytes from address', hex(start_address), '. Continue? [Y/n]')
        if input() != 'Y':
            exit('Aborted.\n')
    programmer.write(input_file.read(), begin=start_address)
    input_file.close()
    
elif parsed_args.o and not(parsed_args.i) and not(parsed_args.t) and not(parsed_args.p) and not(parsed_args.b):
    if os.path.exists(parsed_args.o) and not(parsed_args.force):
        print('File', parsed_args.o, 'already exists, are you sure you want to override it (previous data in that file will be lost forever)? [Y/n]')
        if input() != 'Y':
            exit('Aborted.\n')
    print('Reading', read_size, 'bytes from address', hex(start_address))
    read_bytes = programmer.read(begin=start_address, length=(read_size-1))
    output_file = open(parsed_args.o, 'wb')
    output_file.write(read_bytes)
    output_file.close()

elif parsed_args.p and not(parsed_args.t) and not(parsed_args.i) and not(parsed_args.o) and not(parsed_args.b):
    print('Reading', read_size, 'bytes from address', hex(start_address), 'and printing output on stdout')
    read_bytes = programmer.read(begin=start_address, length=(read_size-1))
    print(str(read_bytes)[2:-1])             # Crop b' and ' from string
    
elif parsed_args.t and not(parsed_args.i) and not(parsed_args.o) and not(parsed_args.p) and not(parsed_args.b):
    text = parsed_args.t
    if parsed_args.s:
        print('\033[93mWARN\033[0m: -s parameter is valid only with -o and -p options. It will be ignored in this case.')
    if len(text) > 2**16-start_address:
        print('\033[93mWARN\033[0m: text too long starting at address', hex(start_address), '. It will be cropped to the size of', 2**16-start_address, 'bytes.')
        text = text[:(2**16-start_address)]
    print('Writing text:\n' + text + '\n\n['+str(len(text)) + ' bytes from address ' + str(hex(start_address)) + ']')
    try:
        programmer.write(text.encode('ascii'), begin=start_address)
    except UnicodeEncodeError:
        exit('\033[91mFATAL ERROR\033[0m: found non-ascii char, all text is converted in ascii, if you need other encodings use an external hex editor and use -i option.')
elif parsed_args.b and not(parsed_args.t) and not(parsed_args.i) and not(parsed_args.o) and not(parsed_args.p):
    if parsed_args.s:
        print('\033[93mWARN\033[0m: -s parameter is valid only with -o and -p options. It will be ignored in this case.')
    print('Starting full memory benchmark.')
    programmer.benchmark()
    
elif not(parsed_args.t) and not(parsed_args.i) and not(parsed_args.o) and not(parsed_args.p) and not(parsed_args.b):
    exit('Exactly one of the parameters -t, -i, -o, -p, -b must be given. No valid argument found.')
else:
    exit('Only one of the parameters -t, -i, -o, -p, -b must be given. Too many found.')
