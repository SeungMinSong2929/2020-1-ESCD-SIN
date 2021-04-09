
# This is used to dump the models into an object
import pickle
import datetime
import os, random                                               # For creating directories
import shutil       
# from collections import defaultdict
import base64
import matplotlib.pyplot as plt
import numpy
import scipy.cluster
import scipy.io.wavfile
# For the speech detection alogrithms
import speech_recognition
# For the fuzzy matching algorithms
from fuzzywuzzy import fuzz
# For using the MFCC feature selection
from python_speech_features import mfcc
# For generating random words
from random_words import RandomWords
from sklearn import preprocessing
# For using the Gausian Mixture Models
from sklearn.mixture import GaussianMixture

from watson_developer_cloud import SpeechToTextV1

from flask_cors import CORS
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from Crypto import Random
# Note: Is there a better way to do this?
# This is the file where the credentials are stored
import config
import db

from dotenv import load_dotenv
load_dotenv()

speech_to_text = SpeechToTextV1(
    iam_apikey=config.APIKEY,
    url=config.URL
)

import re
from flask import Flask, render_template, request, jsonify, url_for, redirect, abort, session, json
from numpy.compat import long

PORT = 5000

# Global Variables
random_words = []
random_string = ""
username = ""
user_directory = "Users/Test"
filename = ""
filename_wav = ""

app = Flask(__name__)
CORS(app)

@app.route('/test', methods=["GET", "POST"])
def home():
    return "Server testing..."


# 파일 암하화
def encrypt(key, filename):
        chunksize = 64 * 1024
        temp_filename = filename.split("/")
        if(len(temp_filename) == 2):
            outputFile = temp_filename[0] + "/encode" + temp_filename[1]
        else:
            outputFile = temp_filename[0] + "/" + temp_filename[1] + "/encode" + temp_filename[2]
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
# 파일 비암호화
def decrypt(key, filename):
        chunksize = 64*1024
        temp_filename = filename.split("/")
        if(len(temp_filename) == 2):
            outputFile = temp_filename[0] + "/decode" + temp_filename[1].replace('encode',"")
        else:
            outputFile = temp_filename[0] + "/" + temp_filename[1] +  "/decode" + temp_filename[2].replace('encode',"")
        print(filename)
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

def removeSpecialChars(str):
    result = re.sub('[^a-zA-Z0-9 \n\.]', '', str)
    return result
def encoded_password(pwd):
    cipher = AES.new(os.getenv("PASSWORD_ECD").encode('utf-8'),AES.MODE_ECB) # never use ECB in strong systems obviously
    encoded_password = base64.b64encode(cipher.encrypt(pwd.encode('utf-8').rjust(32)))
    return encoded_password
        
@app.route('/joinnoVoice', methods=["GET", "POST"])
def enroll_no_voice():
    if request.method  == 'POST':
        data = request.get_json()

        username = data['username']
        email = data['email']
        password = data['password']
        bankName = data['bankName']

        user = db.sqlSelect("SELECT * FROM users where user_id = %s",(username))
        if(len(user) == 0):
            password = encoded_password(password)
            db.sql("INSERT INTO users (user_id, password, email, bank) VALUES (%s, %s, %s, %s)",(username, password, email, bankName))
            print("new user join request pass")
            return "pass"
        else:
            print("user already exists")
            return "fail"
    else:
        return "no method for request"
# 음석을 인식 기능을 클릭하는 시에 
# 서버에서 해당하는 Id과 비밀번호를 받아서 저장한다
# 전달되는 아이디를 중복하는 경우에는 어떻게?
@app.route('/enroll', methods=["GET", "POST"])
def enroll():
    global username
    global user_directory

    if request.method == 'POST':
        data = request.get_json()

        username = data['username']
        email = data['email']
        password = data['password'] 
        bank = data['bankName'] 

        # 해당하는 User에서 username 기준으로 비밀번호 암호화
        cipher = AES.new(os.getenv("PASSWORD_ECD").encode('utf-8'),AES.MODE_ECB) # never use ECB in strong systems obviously
        encoded_password = base64.b64encode(cipher.encrypt(password.encode('utf-8').rjust(32)))
        
        # 서버에서 파일을 저장하는 경로를 암호화
        encoded_path = base64.b64encode(cipher.encrypt(username.encode('utf-8').rjust(32))).decode('utf-8')
        user_path = removeSpecialChars(encoded_path)
    
        user_directory = "Users/" + user_path + "/"

        if not os.path.exists(user_directory):
            try:
                os.makedirs(user_directory)
                db.sql("INSERT INTO users (user_id, password, email, pathvoice, isvoice, bank) VALUES (%s, %s, %s, %s, %s, %s)",(username, encoded_password, email, user_path, 1, bank))
                print("[ * ] Directory ", username,  " Created ...")
                return "created user"
                pass
            except ValueError as error:
                print(error)
                return "fail create user"
        else:
            # print("[ * ] Directory ", username,  " already exists ...")
            # print("[ * ] Overwriting existing directory ...")
            # shutil.rmtree(user_directory, ignore_errors=False, onerror=None)
            # os.makedirs(user_directory)
            # print("[ * ] Directory ", username,  " Created ...")
            return "user already exists"

    else:
        return "fail"

# 아아디 체크함
@app.route('/auth', methods=['POST', 'GET'])
def auth():
    global username
    global user_directory
    global filename

    user_exist = False

    if request.method == 'POST':

        # Clien부터 보낸 username과 password를 받아
        data = request.get_json()

        # Model 저장하는 경로
        # user_directory = 'Models/wav/'
        username = data['username']
        user = db.sqlSelect("SELECT * FROM users where user_id = %s and isvoice = 1",(username))


        if(len(user) == 0):
            print("[ * ] The user profile does not exists ...")
            return "Doesn't exist"
        else :
            print(type(user[0]))
            user_directory = 'Users/' + user[0][5] + '/' 
            print("[ DEBUG ] : What is the user directory at auth : ", user_directory)
            print("[ * ] The user profile exists ...")
            return "User exist"

    else:
        print('its coming here')
# 아아디 체크함
@app.route('/loginwithnovoice', methods=['POST', 'GET'])
def loginwithnovoice():

    if request.method == 'POST':

        # Clien부터 보낸 username과 password를 받아
        data = request.get_json()

        # Model 저장하는 경로
        # user_directory = 'Models/wav/'
        username = data['username']
        password = data['password']
        cipher = AES.new(os.getenv("PASSWORD_ECD").encode('utf-8'),AES.MODE_ECB) # never use ECB in strong systems obviously
        encoded_password = base64.b64encode(cipher.encrypt(password.encode('utf-8').rjust(32)))

        user = db.sqlSelect("SELECT * FROM users where user_id = %s",(username))
        print(user)
        # 입력한 사용자를 존재하지 않음
        if(len(user) == 0):
            auth_message = {
                "message": "fail"
            }
        else :
            # 비밀번호 체크함
            password = user[0][2]
            print(encoded_password)
            if(password == encoded_password.decode('utf-8')) :
                user = user[0]
                auth_message = {
                    "user": {
                        "id": user[0],
                        "user_id": user[1],
                        "email": user[3],
                        "isvoice": user[7],
                        "money": user[8]
                    },
                    "message": "pass"
                }
            else : 
                auth_message = {
                    "message": "fail"
                }
        return auth_message
    else:
        print('its coming here')
# 이 API를 voice api이다
# Check Background_noise
@app.route('/vad', methods=['GET', 'POST'])
def vad():
    if request.method == 'POST':
        f = open('./static/audio/background_noise.wav', 'wb') # 쓰기만

        # client 보내주는 blob 파일 저장해줘
        f.write(request.files['file'].read())
        f.close()

        background_noise = speech_recognition.AudioFile(
            './static/audio/background_noise.wav')

        # noise 파일 읽음
        # Adjusts the energy threshold dynamically using audio from source (an AudioSource instance) 
        # to account for ambient noise.
        with background_noise as source:
            speech_recognition.Recognizer().adjust_for_ambient_noise(source, duration=5)

        # Check voice activity 인가? 모르겟네요 ㅋㅋ
        print("Voice activity detection complete ...")

        #random_words = RandomWords().random_words(count=5)
        #print(random_words)
        random_words = random_hangeul()
        print("randoms global", random_words)
        return " ".join(random_words)
    else:
        # !! 안씀
        background_noise = speech_recognition.AudioFile(
            './static/audio/background_noise.wav')
        with background_noise as source:
            speech_recognition.Recognizer().adjust_for_ambient_noise(source, duration=5)

        print("Voice activity detection complete ...")

        # random words 다시 보낸다.
        random_words = RandomWords().random_words(count=5)
        random_words = random_hangeul()
        print(random_words)
        return "  ".join(random_words)


# 받은 5개 단어를 말해서 다시 보내서 이 API를 체크함
@app.route('/voice', methods=['GET', 'POST'])
def voice():
    global user_directory
    global filename_wav

    print("[ DEBUG ] : User directory at voice : ", user_directory)

    if request.method == 'POST':
        import json
        #    global random_string
        global random_words
        global username

        # 읽어는 단어
        result = request.form.to_dict(flat=False)
        words = json.loads(result["words"][0])
        print(words)


        #보내는 파일 저장함
        filename_wav = user_directory + username + '.wav' # 파일 경로
        f = open(filename_wav, 'wb') # 보내는 파일 저장한
        f.write(request.files['file'].read())
        f.close()

        
        print(filename_wav)
        if os.path.exists(filename_wav):
            encrypt(getKey(os.getenv("PASSWORD_ECD")), filename_wav)
        # 파일 읽어옴
        # with open(filename_wav, 'rb') as audio_file:
        #     recognised_words = speech_to_text.recognize(audio_file, content_type='audio/wav').get_result()
        try:
            # code block
            naver_words = naver_STT(filename_wav)
            print("Naver Sppeech to Text thinks you said: " + " ".join(naver_words) + "\n")

            #recognised_words = str(recognised_words['results'][0]['alternatives'][0]['transcript'])

            #print("IBM Speech to Text thinks you said : " + recognised_words)
            #print("IBM Fuzzy partial score : " + str(fuzz.partial_ratio(words, recognised_words)))
            #print("IBM Fuzzy score : " + str(fuzz.ratio(words, recognised_words)))       

            # google_words = run_quickstart(filename_wav)
            # print("Google Sppeech to Text thinks you said: " + " ".join(google_words) + "\n")

            # 단어를 5개를 말해서 음석을 받아서 체크함
            # 만약에 5개를 맞게 말하면 pass 또한 5개를 인식을 못하는거나 정확성을 낮지 않으면  ㅋㅋㅋ 

            # total_words = naver_words + google_words

            if(checkList(words, naver_words)) : 
                os.remove(filename_wav)
                return "pass"
            else :
                print("\nThe words you have spoken aren't entirely correct. Please try again ...")
                os.remove(filename_wav)
                return "fail"
        except ValueError as Error:
            print(Error)
    else:
        return "Oh no no"


# 아 만약에 위에 API를 성곡하면 이거 시작한다.
@app.route('/biometrics', methods=['GET', 'POST'])
def biometrics():
    global user_directory
    global username
    print("[ DEBUG ] : User directory is : ", user_directory)

    if request.method == 'POST':
        pass
    else:
        # MFCC
        print("Into the biometrics route.")

        # 사용자 저장한 파일 읽어
        directory = os.fsencode(user_directory)
        features = numpy.asarray(())

        # 저장되어 있는 wav 파일 사용자의 이름 맞게를 출력함
        for file in os.listdir(directory):
            filename_wav = os.fsdecode(file)
            if filename_wav.endswith(".wav"):
                decrypt(getKey(os.getenv("PASSWORD_ECD")), user_directory + filename_wav)
                filename_wav = "decode" + username + ".wav"
                print("[biometrics] : Reading audio files for processing ...",user_directory + filename_wav)
                (rate, signal) = scipy.io.wavfile.read(user_directory + filename_wav)
                extracted_features = extract_features(rate, signal)

                if features.size == 0:
                    features = extracted_features
                else:
                    features = numpy.vstack((features, extracted_features))

            else:
                continue

        # GaussianMixture Model 만듦
        print("[ * ] Building Gaussian Mixture Model ...")

        gmm = GaussianMixture(n_components=16,
                            max_iter=200,
                            covariance_type='diag',
                            n_init=3)

        gmm.fit(features)
        print("[ * ] Modeling completed for user :" + username +
            " with data point = " + str(features.shape))

        # dumping the trained gaussian model
        # picklefile = path.split("-")[0]+".gmm"
        print("[ * ] Saving model object ...")
        pickle.dump(gmm, open("Models/" + str(username) + ".gmm", "wb"), protocol=None)
        print("[ * ] Object has been successfully written to Models/" +
            username + ".gmm ...")
            

        features = numpy.asarray(())

        # 파일 이름 암호화
        cipher = AES.new(os.getenv("GMM_ECD").encode('utf-8'),AES.MODE_ECB) # never use ECB in strong systems obviously
        encoded_path = base64.b64encode(cipher.encrypt(username.encode('utf-8').rjust(32))).decode('utf-8')
        user_gmm_path = removeSpecialChars(encoded_path)


        try:
            # 파일을 암호화해서 이름을 바뀜
            # encrypt(getKey(os.getenv("GMM_ECD")),"Models/" + str(username) + ".gmm")
            os.rename("Models/" + str(username) + ".gmm","Models/" + str(user_gmm_path) + ".gmm") 

            db.sql("UPDATE users SET pathgmm = %s WHERE user_id = %s",(user_gmm_path + ".gmm", username))
            print("\n\n[ * ] User has been successfully enrolled ...")
        except ValueError as Error:
            return ("Encode GMM error", Error)
        return "User has been successfully enrolled ...!!"

@app.route("/getmoney/<id>", methods=['GET'])
def getmony(id=None):
    if request.method == 'GET':
        user_money = db.sqlSelect("SELECT money FROM users where id = %s",(id))[0]
        auth_money = {
            'message': 'pass',
            'data': user_money[0]
        }
        return auth_money
    else:
        pass

@app.route("/history/<id>", methods=['GET'])
def gethistory(id=None):
    if request.method == 'GET':
        history_sender = db.sqlSelect("SELECT * FROM history where send_user = %s",(id))
        history_receive = db.sqlSelect("SELECT * FROM history where receive_user = %s",(id))
        try:
            auth_history = {
                'message': 'pass',
                'data': {
                    'send': history_sender,
                    'receive': history_receive
                }
            }
            return auth_history
        except ValueError as Error:
            print(Error)
            auth_history = {
                'message': 'Error',
                'data': {
                    'send': [],
                    'receive': []
                }
            }
            return auth_history

    else:
        pass

@app.route("/checkuser", methods=['POST'])
def checkuser():
    if request.method == 'POST':
        data = request.get_json()
        user = db.sqlSelect("SELECT * FROM users where user_id = %s",(data['receiveUser']))
        if(len(user) == 0):
            auth_state = {
                'message': 'not exists',
            }
        else :
            bank = user[0][9]
            print(data['bankName'])
            if(bank == data['bankName']):
                auth_state = {
                    'message': 'exists',
                }
            else:
                auth_state = {
                    'message': 'not exists',
                }
        return auth_state
    else:
        pass

@app.route("/sendmoney", methods=['POST'])
def sendmoney():
    if request.method == 'POST':
        data = request.get_json()
        send_user = data['sendUser']
        receive_user = data['receiveUser']
        send_money = data['money']
        receive_bank = data['receiveUserBank'] #receive bak

        send_user_object = db.sqlSelect("SELECT * FROM users where user_id = %s",(send_user))[0] #get send bank
        try:
            #insert to history
            db.sql("INSERT INTO history (send_user, receive_user, money, receive_bank,send_bank) VALUES (%s, %s, %s, %s, %s)",(send_user, receive_user, send_money, receive_bank,send_user_object[9]))
            user = db.sqlSelect("SELECT * FROM users where user_id = %s",(receive_user))

            #updata money for receiver
            money = float(user[0][8]) + float(send_money)
            db.sql("UPDATE users SET money = %s WHERE user_id = %s",(money, receive_user))

            #updata money for sender
            money = float(send_user_object[8]) - float(send_money)
            db.sql("UPDATE users SET money = %s WHERE user_id = %s",(money, send_user))
            return "pass"
        except ValueError as error:
            return "fail"
    else:
        pass
# 다음부터 사용자를 인증합니다.
@app.route("/verify", methods=['GET'])
def verify():
    global username
    global filename
    global user_directory
    global filename_wav

    print("[ DEBUG ] : user directory : " , user_directory)
    print("[ DEBUG ] : filename_wav : " , filename_wav)
    decrypt(getKey(os.getenv("PASSWORD_ECD")), user_directory + "encode" + username + ".wav")

    filename_wav = user_directory + "decode" + username + ".wav"
    print("[ DEBUG ] : filename_wav : " , filename_wav)
    # ------------------------------------------------------------------------------------------------------------------------------------#
    #                                                                LTSD and MFCC                                                     #
    # ------------------------------------------------------------------------------------------------------------------------------------#

    # (rate, signal) = scipy.io.wavfile.read(audio.get_wav_data())
    (rate, signal) = scipy.io.wavfile.read(filename_wav)

    extracted_features = extract_features(rate, signal)
    # ------------------------------------------------------------------------------------------------------------------------------------#
    #                                                          Loading the Gaussian Models                                                #
    # ------------------------------------------------------------------------------------------------------------------------------------#

    cipher = AES.new(os.getenv("GMM_ECD").encode('utf-8'),AES.MODE_ECB) # never use ECB in strong systems obviously
    encoded_path = base64.b64encode(cipher.encrypt(username.encode('utf-8').rjust(32))).decode('utf-8')
    user_gmm_path = removeSpecialChars(encoded_path)


    gmm_models = [os.path.join('Models/', user)
                for user in os.listdir('Models/')
                if user.endswith('.gmm')]
                
    # decrypt(getKey(os.getenv("PASSWORD_ECD")), gmm_models)
    # gmm 리스트 파일 노드
    print("Load with GMM file: " + str(gmm_models))
    
    print("GMM Models : " + str(gmm_models))

    # Load the Gaussian user Models
    models = [pickle.load(open(user, 'rb')) for user in gmm_models]

    user_list = [user.split("/")[-1].split(".gmm")[0]
                for user in gmm_models]
    print("User List"+str(user_list))

    log_likelihood = numpy.zeros(len(models))

    for i in range(len(models)):
        gmm = models[i]  # checking with each model one by one
        scores = numpy.array(gmm.score(extracted_features))
        log_likelihood[i] = scores.sum()

    print("Log liklihood : " + str(log_likelihood))

    identified_user = numpy.argmax(log_likelihood)

    print("[ * ] Identified User : " + str(identified_user) +
            " - " + user_list[identified_user])

    auth_message = ""

    # 파일 이름 암호화
    cipher = AES.new(os.getenv("GMM_ECD").encode('utf-8'),AES.MODE_ECB) # never use ECB in strong systems obviously
    encoded_path = base64.b64encode(cipher.encrypt(username.encode('utf-8').rjust(32))).decode('utf-8')
    user_gmm_path = removeSpecialChars(encoded_path)
    print(user_gmm_path)
    if user_list[identified_user] == user_gmm_path:
        print("[ * ] You have been authenticated!")
        user = db.sqlSelect("SELECT * FROM users where pathgmm = %s",(user_gmm_path + ".gmm"))[0]
        auth_message = {
            "user": {
                "id": user[0],
                "user_id": user[1],
                "email": user[3],
                "isvoice": user[7],
                "money": user[8]
            },
            "message": "pass"
        }
    else:
        print("[ * ] Sorry you have not been authenticated")
        auth_message = "fail"

    return auth_message


def calculate_delta(array):
    """Calculate and returns the delta of given feature vector matrix
    (https://appliedmachinelearning.blog/2017/11/14/spoken-speaker-identification-based-on-gaussian-mixture-models-python-implementation/)"""

    print("[Delta] : Calculating delta")

    rows, cols = array.shape
    deltas = numpy.zeros((rows, 20))
    N = 2
    for i in range(rows):
        index = []
        j = 1
        while j <= N:
            if i-j < 0:
                first = 0
            else:
                first = i-j
            if i+j > rows - 1:
                second = rows - 1
            else:
                second = i+j
            index.append((second, first))
            j += 1
        deltas[i] = (array[index[0][0]]-array[index[0][1]] +
                     (2 * (array[index[1][0]]-array[index[1][1]]))) / 10
    return deltas


def extract_features(rate, signal):
    print("[extract_features] : Exctracting featureses ...")

    mfcc_feat = mfcc(signal,
                    rate,
                    winlen=0.020,  # remove if not requred
                    preemph=0.95,
                    numcep=20,
                    nfft=1024,
                    ceplifter=15,
                    highfreq=6000,
                    nfilt=55,

                    appendEnergy=False)

    mfcc_feat = preprocessing.scale(mfcc_feat)

    delta_feat = calculate_delta(mfcc_feat)

    combined_features = numpy.hstack((mfcc_feat, delta_feat))

    return combined_features

################### 한국어 음성인식 ###################
############### 음성인식된 string return ##############
def run_quickstart(dir_location):
    # [START speech_quickstart]
    import io
    import os
    # os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="C:\\Users\\wnddk\\Downloads\\speech-to-text-api-277112-f2c7c16d8141.json"
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="./key.json"
    # Imports the Google Cloud client library
    # [START migration_import]
    from google.cloud import speech
    from google.cloud.speech import enums
    from google.cloud.speech import types
    # [END migration_import]

    # Instantiates a client
    # [START migration_client]
    client = speech.SpeechClient()
    # [END migration_client]

    # The name of the audio file to transcribe
    file_name = dir_location
    #file_name = os.path.join(
    #    os.path.dirname(__file__),
    #    '.',
    #    'file.wav')

    # Loads the audio into memory
    with io.open(file_name, 'rb') as audio_file:
        content = audio_file.read()
        audio = types.RecognitionAudio(content=content)

    config = types.RecognitionConfig(
        encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=44100,
        language_code='ko-KR',
        audio_channel_count = 2,
        )

    # Detects speech in the audio file
    response = client.recognize(config, audio)

    for result in response.results:
        #print('Transcript: {}'.format(result.alternatives[0].transcript))
        resultString = '{}'.format(result.alternatives[0].transcript)
        
    # [END speech_quickstart]
    return resultString.split(' ')


def random_hangeul():
    import random as rand

    randomText=["부채","튜브","바지","버스","보트","바나나","마스크","모래",
                "무지개","개미","하마","모자","체리","포도","배","감","사과",
                "브로콜리","완두콩","옥수수","버섯","장갑","목도리","딸기",
                "귤","키위","수박","참외","파인애플","안녕하세요","반갑습니다",
                "오징어","문어","책상","의자","기러기",
                ]
    #randomText=["모모","모모","모모","모모","모모"]
    textString = []
    for i in range (0,5):
        textString.append(randomText[rand.randint(0,len(randomText)-1)])
    
    return textString

#####################################################################
#####################################################################
def naver_STT(fileDir):
    import json
    import requests

    data = open(fileDir,'rb') # STT를 진행하고자 하는 음성 파일

    Lang = "Kor" # Kor / Jpn / Chn / Eng
    URL = "https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=" + Lang
    
    ID = "9q5chqjnfr" # 인증 정보의 Client ID
    Secret = "EPxQOfPEu1AzOjnBZByLwFXcwd2fdgGPcCFxUF9h" # 인증 정보의 Client Secret
    
    headers = {
        "Content-Type": "application/octet-stream", # Fix
        "X-NCP-APIGW-API-KEY-ID": ID,
        "X-NCP-APIGW-API-KEY": Secret,
    }
    response = requests.post(URL,  data=data, headers=headers)
    rescode = response.status_code

    if(rescode == 200):
        temp_string = " "
    else:
        print("Error : " + response.text)

    temp_string = response.text
    temp_result = temp_string.split('\"')

    return temp_result[3].split(' ')

    #return " ".join(temp_result[3].split(' '))


def checkList(random_data,recognized_data):
    
    count = 0
    for i,elem in enumerate(random_data):
        if elem in recognized_data:
            count = count + 1
    
    if count > 2:
        return True
    else :
        return False

if __name__ == '__main__':
    app.run(host='localhost', port=PORT, debug=True)
