import React, { Component } from 'react'
import WaveSurferContainer from '../../../../component/WaveSurferContainer/WaveSurferContainer'
import Http from '../../../../component/Http'

export default class LoginWithVoice extends Component {
    constructor(props) {
        super(props)
        this.state = {
            
            id: "",

            checkId: true,
            checkNoise: false,
            checkWordVoice: false,
            finishVoice: false,
        }
    }
    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({[name] :  value}) 
    }
    handleCickChangeLv1 = () =>{
        const { id } =  this.state;
        if(!id)
        {
            alert("ID를 입력해주세요");
            return;
        }
        Http.post({
            path: '/auth',
            payload: {
                username : this.state.id
            }
        }).then((res) => {
            const { data } = res;
            if(data === 'User exist')
                this.setState({checkId: false})
            else{
                alert("입력한 사용자가 존재하지 않 또는 로그인 인신 기능을 추가하지 않습니다. 다시 확인해주세요")
            }
        }).catch((err) => {
            console.log(err)
        })
    }
    hanleChangeVoice = (blob) => {
        const { checkNoise, checkWordVoice, finishVoice } = this.state;

        //먼저를 환경의 노이즈를  API를 보내서 5개 단어를 다시 받음
        if(!checkNoise) //Noise check 
        {
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
                    checkWordVoice : !checkWordVoice,
                    checkNoise: !checkNoise
                })
            }).catch((err) => {
                console.log(err)
            })
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
                            finishVoice: !finishVoice
                        })
                    }else{
                        alert("단어 음성 인식을 실패했습니다. 다시 해주세요.")
                    }
                }).catch((err) => {
                    console.log(err)
                })
            }else{ //단어를 음석을 한 다음에 GMM 파일 만들기 위해서 API 호줄
                Http.get({
                    path: '/verify'
                }).then(res => {
                    const { data } = res;
                    console.log(res)
                    const { handleCheckSuccess } = this.props;
                    if(data.message === "pass")
                    {
                        const { id, user_id,email, isvoice, money } = data.user;
                        const user = {id, user_id, email, isvoice, money};
                        localStorage.setItem("user", JSON.stringify(user))
                        alert("음성 인식 인증 기능을 확인했습니다")
                        handleCheckSuccess(true);
                    }else{
                        alert("사용자 인식에 실패하였습니다.")
                        handleCheckSuccess(false);
                    }
                }).catch((err) => {
                    console.log(err)
                })
            }
        }
    }
    render() {
        const { checkId, checkWordVoice, checkNoise, words, finishVoice } = this.state;
        return (
            <div>
                {
                    checkId &&
                    <>
                        <div className="form-group">
                            <label htmlFor="id">Id</label>
                            <input type="text" name="id" id="id" className="form-control" placeholder="Id..." onChange = {this.handleChange}/>
                        </div>
                        <button className ="btn btn-primary d-block" style = {{margin: "0 auto"}}
                            onClick = {this.handleCickChangeLv1}
                        >아이디 체크</button>
                    </>
                }
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
                    !checkId && 
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
        )
    }
}
