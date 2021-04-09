import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ToggleButton from 'react-toggle-button'
import './Register.scss'
import WaveSurferContainer from '../../../../component/WaveSurferContainer/WaveSurferContainer'
import Http from '../../../../component/Http'
export default class Register extends Component {
    static propTypes = {
        prop: PropTypes
    }
    constructor(props){
        super(props)
        this.state = {
            checkVoice: false,

            id: "",
            email: "",
            password: "",
            confirmPassword: "",
            bankName: "신한 은행",
            blob: {},
            words: [],
            
            checkNoise: false,
            checkWordVoice: false,
            finishVoice: false
        }
    }
    handleCheck = ( event ) => {
        const { name, value} = event.target;
        this.setState({
            [name] : value
        })
    }
    subMit = () =>{
        const { checkVoice, finishVoice } = this.state;
        if(!checkVoice){ //음성 없이 회원가입
            const {id, email, password, confirmPassword, bankName} = this.state;
            if(id && email && password && confirmPassword){
                Http.post({
                    path: 'joinnoVoice',
                    payload: {username: id, email, password, bankName}
                }).then(res => {
                    const { data } = res;
                    if(data === "pass"){
                        alert("회원가입에 성공하였습니다")
                        this.props.history.push('/')
                    }
                    else
                        alert("이미 존재하는 사용자입니다. 정보를 다시 입력해주세요.")
                }).catch(err => {
                    console.log(err)
                })
            }else{
                alert("빈 값을 입력헀습니다. 다시 확인해주세요.")
            }
        }else{
            if(finishVoice){
                alert("회원가입에 성공하였습니다")
                this.props.history.push('/')
            }else{
                alert("음성 인식의 각 단계를 먼저 진행해주세요.")
            }
        }
    }
    hanleChangeVoice = (blob) => {
        const { checkNoise, checkWordVoice, id, email, password, confirmPassword, finishVoice, bankName } = this.state;
        //처음에는 CheckNoise 함수를 들어감
        if(!checkNoise)
        {
            if(id && email && password && confirmPassword){
                if(password !== confirmPassword){
                    alert("입력된 비밀번호를 확인 해주세요.")
                    return;
                }
                //입력한 정보를 각 User 저장할 파일을 경로를 만듦
                Http.post({
                    path: '/enroll',
                    payload: {username: id, email: email,  password: password, bankName: bankName}
                }).then((res) => {
                    const { data } = res;
                    if(data === 'created user'){
                        
                        //입력한 사용자를 만들고 나서 Noise파일을 보내고
                        const data = new FormData();
                        data.append('file',blob)
                        Http.post({
                            path: '/vad',
                            headers: {
                                'Content-Type': `multipart/form-data`,
                            },
                            payload: data
                        }).then((res) => {
                            const { data } = res;
                            const words = data.split(" ");
                            this.setState({
                                words,
                                checkNoise: !checkNoise,
                                checkWordVoice: !checkWordVoice
                            })
                        }).catch((err) => {
                            console.log(err)
                        })
                    }else{
                        alert("사용자가 이미 존재합니다. 다시 입력해주세요")
                    }
                }).catch((err) => {
                    console.log(err)
                })   
            }else{
                alert("음성 인식을 하기 위해서 먼저 위에 정보를 입력해주세요");
            }
            return;
        }else{
            if(!finishVoice)
            {
                //노이즈 체크한 단계를 넘어서 단어를 5개를 받아서 2간계를 넘
                //받은 5개 단어를 받아서 음성을 보냄
                const data = new FormData();
                const { words } = this.state;
                data.append('file',blob);
                data.append('words',JSON.stringify(words))
                Http.post({
                    path: '/voice',
                    headers: {
                        'Content-Type': `multipart/form-data`,
                    },
                    payload: data
                }).then((res) => {
                    const { data } = res;
                    if(data === "pass"){
                        this.setState({
                            finishVoice: !this.state.finishVoice
                        })
                    }else{
                        alert("음성 인식 단어가 일치하지 않습니다. 다시 해주세요")
                    }
                }).catch((err) => {
                    console.log(err)
                })
            }else{ //단어를 음석을 한 다음에 GMM 파일 만들기 위해서 API 호줄
                Http.get({
                    path: '/biometrics'
                }).then(res => {
                    const { data } = res
                    if(data === "User has been successfully enrolled ...!!")
                    {
                        alert("음성 인식 인증 기능이 추가되었습니다.")
                    }
                }).catch((err) => {
                    console.log(err)
                })
            }
        }
    }
    render() {
        const { checkVoice, id, email, password, confirmPassword, words,checkWordVoice, checkNoise, finishVoice, bankName} = this.state;
        return (
            <div className="container-fluid">
                <div className="row justify-content-center">
                    <div className="col-md-3 col-sm-6 col-xs-12 row-container">
                        <form method="post" onClick = {(e) => e.preventDefault()}>
                            <h1 className="text-center">Register</h1>
                            <div className="form-group">
                                <label for="id">ID</label>
                                <input type="text" name="id" id="id" onChange= {this.handleCheck} className="form-control" placeholder="Id" value= {id}/>
                            </div>
                            <div className="form-group">
                                <label for="id">Email</label>
                                <input type="text" name="email" id="email" onChange= {this.handleCheck} className="form-control" placeholder="Email..." value= {email}/>
                            </div>
                            <div className="form-group">
                                <label for="id">Password</label>
                                <input type="password" name="password" id="password" onChange= {this.handleCheck} className="form-control" placeholder="Password..." value= {password}/>
                            </div>
                            <div className="form-group">
                                <label for="id">Confirm Password</label>
                                <input type="password" name="confirmPassword" id="id" onChange= {this.handleCheck} className="form-control" placeholder="Password..." value= {confirmPassword}/>
                                {
                                    confirmPassword &&
                                        password !== confirmPassword ?
                                            <p style={{color: "red"}}>비밀번호가 동일하지 않습니다</p>
                                        : ""
                                }
                            </div>
                            <div className="form-group">
                                <label for="id">Bank Name</label>
                                <div className="input-group">
                                    <select className="form-control" name ="bankName" value = {bankName} onChange = {this.handleCheck} >
                                        <option value = "신한 은행">신한 은행</option>
                                        <option value = "우리 은행">우리 은행</option>
                                        <option value = "농합 은행">농합 은행</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label for="id">Voice Authentication</label>
                                <div className = "checkVoice">
                                    <ToggleButton
                                        value={this.state.checkVoice || false}
                                            onToggle={(value) => {
                                            this.setState({
                                                checkVoice: !value,
                                            })
                                    }} />
                                </div>
                                {
                                    checkWordVoice && 
                                        <p style = {{textAlign: "center"}}>
                                            {
                                                words.map(item => (
                                                    item + " "
                                                ))
                                            }
                                        </p>
                                    }
                                {
                                    checkVoice &&  
                                    <>
                                        {
                                            !checkNoise && 
                                            "노이즈 체크 단계입니다"
                                        }
                                        <WaveSurferContainer
                                            hanleChangeVoice = {this.hanleChangeVoice}
                                        />
                                        {
                                            finishVoice && 
                                                <p className="text-center">마지막으로 버튼을 한번 눌러주세요</p>
                                        }
                                    </>
                                }
                            </div>
                            <button type="submit" className="btn btn-block" onClick = {this.subMit}>등록</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}
