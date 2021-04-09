import os, random
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from Crypto import Random
from click._compat import raw_input
import base64
from dotenv import load_dotenv
load_dotenv()

def encrypt(key, filename):
        chunksize = 64 * 1024
        temp_filename = filename.split("/")
        outputFile = temp_filename[0] + "/encode" + temp_filename[1]
        filesize = str(os.path.getsize(filename)).zfill(16)
        IV = Random.new().read(16)

        encryptor = AES.new(key, AES.MODE_CBC, IV)

        with open(filename, 'rb') as infile:
            with open(outputFile, 'wb') as outfile:
                outfile.write(filesize.encode('utf-8'))
                outfile.write(IV)
                
                while True:
                    chunk = infile.read(chunksize)
                    if len(chunk) == 0:
                        break
                    elif len(chunk) % 16 != 0:
                        chunk += b' ' * (16 - (len(chunk) % 16))
                    outfile.write(encryptor.encrypt(chunk))

def decrypt(key, filename):
        chunksize = 64*1024
        temp_filename = filename.split("/")
        outputFile = temp_filename[0] + "/decode" + temp_filename[1].replace('encode',"")
        with open(filename, 'rb') as infile:
            filesize = int(infile.read(16))
            IV = infile.read(16)

            decryptor = AES.new(key, AES.MODE_CBC, IV)

            with open(outputFile, 'wb') as outfile:
                while True:
                    chunk = infile.read(chunksize)
                    if len(chunk) == 0:
                        break
                    outfile.write(decryptor.decrypt(chunk))
                outfile.truncate(filesize)
def getKey(password):
            hasher = SHA256.new(password.encode('utf-8'))
            return hasher.digest()

import re
def Main():
    choice = raw_input("Would you like to (E)ncrypt or (D)ecrypt?: ")
    if choice == 'E':
        filename = raw_input("File to encrypt: ")
        password = raw_input("Password: ")
        encrypt(getKey(os.getenv("PASSWORD_ECD")), filename)
        print ("Done.")
    elif choice == 'D':
        filename = raw_input("File to decrypt: ")
        password = raw_input("Password: ")
        decrypt(getKey(os.getenv("PASSWORD_ECD")), filename)
        print ("Done.",getKey(os.getenv("PASSWORD_ECD")))
    else:
        print ("No Option selected, closing...")

if __name__ == '__main__':
	Main()