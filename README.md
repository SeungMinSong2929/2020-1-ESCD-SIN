# 2020-1-ESCD-SIN
기업사회맞춤형프로젝트1 SIN팀.

#### 프로젝트 주제
사용자 음성을 활용한 서비스 사용자 인증 및 접근 제어 시스템 개발

## 1.목차

* 사용자 음성 인식 웹 페이지
* API 서버

---
## 2.사용자 음 인식 웹 페이지
### 2.1 개발 환경
* Node.js
* React.js 16.4 

### 2.2 실행 방법

1. Clone the repository. 

    ```
    https://github.com/CSID-DGU/2020-1-ESCD-SIN.git
    ```
    
1. Move into the project directory. 

    ```
    cd 2020-1-ESCD-SIN/Source
    ```
	
1. Install all the required libraries Reactjs

    ```
    npm install 
    ```

1. Copy p5 folder from modules to node_modules

1. Run the application.

    ```
    npm start
    ```
    
1. Go to `http://localhost:3000`

---
## 3.API 서버
### 3.1 개발 환경
* Python 3 

### 3.2 실행 방법

1. Move into the project directory. 

    ```
    cd server
    ```
	
1. Install all the required libraries, by installing the requirements.txt file.

    ```
    pip install -r requirements.txt
    ```

1. Create env file.

    ```
    PASSWORD_ECD=1234567890123456
    GMM_ECD=1234567890123555
    ```
    
1. Run the application.

    ```
    python app.py
    ```
    
1. Go to `http://localhost:5000`

## 4. 데모

### 시작 화면
사이트를 접속하면 처음에 사용자에게 먼저 보이는 페이지입니다. 
![MainPage](https://user-images.githubusercontent.com/48276512/84485873-8d7dcf00-acd7-11ea-9953-d2af0a2d506f.PNG)

### 회원가입 페이지 
사용자는 기초 페이지에서 Join 클릭하면 회원가입 페이지를 이용합니다.
<img width="1269" alt="JoinPage" src="https://user-images.githubusercontent.com/48276512/84486290-2dd3f380-acd8-11ea-9b08-c6d42ab3cf18.PNG">

### 회원가입 가입 성공 페이지
회원가입 페이지에서 정보를 맞게 다 입력한 다음에 음성 인식 기능 추가하면 안내대로 각 단계를 성공적으로 완성한 다음에, 기능이 추가되었다고 
사용자에게 알려줍니다.
<p align="center">
  <img width="460" height="300" src="https://user-images.githubusercontent.com/48276512/84488630-7345f000-acdb-11ea-94b8-9717de8c4ff7.gif">
</p>

### 로그인 페이지
사용자는 시작 화면에서 Login 클릭하면 회원가입 페이지를 이용합니다. 여기서 아이디 및 비밀번호로 로그인을 할 수 있고 아이디 및 음성 인식을 
이용해서 로그인을 할 수 있습니다.
![LoginWithMicrom](https://user-images.githubusercontent.com/48276512/84489915-60ccb600-acdd-11ea-926f-fc597ac1147b.PNG)

### 로그인을 성공해서 마이 페이지를 이동합니다
서비스 페이지
<img width="1279" alt="Service page" src="https://user-images.githubusercontent.com/48276512/84490178-bbfea880-acdd-11ea-9b07-f5758cf67735.PNG">

<br><br>


## 프로젝트 설계 발표 링크
https://www.youtube.com/watch?v=4gKVdE_yVrc

## 팀원 
2014112081 정세인
2017112153 응웬딩 흐엉
2018112013 이서연
2018112042 송승민

