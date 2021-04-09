import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Http from '../../../component/Http'
export default class SendMoney extends Component {
    constructor(props) {
        super(props)
        this.state = {
            receiveUser: "",
            sendMoney: "",
            bankName: "신한 은행",

            checkLoading: false,
            resultCheck: [],
            enableUser: false,
        }
    }
    handleChange = (e) =>{
        const { name, value } = e.target;
        this.setState({
            [name] : value
        })
    }
    handleChangeCheck = (e) => {
        e.preventDefault();
        const { receiveUser, bankName} = this.state
        const user = JSON.parse(localStorage.getItem('user'));
        
        if(user.user_id === receiveUser)
        {
            
            alert("자기 계죄를 입금할 수 없습니다.")
            return;
        }
        
        this.setState({checkLoading : !this.state.checkLoading})
        Http.post({
            path: `/checkuser`,
            payload: {
                receiveUser,
                bankName
            }
        }).then(({data}) => {
            const { message } = data;
            console.log(message)
            if(message === 'exists')
            {
                let resultCheck = {
                    name: this.state.receiveUser,
                    money: this.state.sendMoney
                }
                this.setState({
                    checkLoading : !this.state.checkLoading,
                    resultCheck: [resultCheck],
                    enableUser: !this.state.enableUser
                })
            }else{
                this.setState({
                    checkLoading : !this.state.checkLoading,
                })
            }
        }).catch(err => {
            console.log(err)
        })
    }
    handleSend = (e) => {
        e.preventDefault();
        const { receiveUser, sendMoney} = this.state;
        const user = JSON.parse(localStorage.getItem('user'));
        console.log(user, receiveUser)
        

        if(user.id === receiveUser)
        {
            alert("자기 계죄를 입금할 수 없습니다.")
            return;
        }
        Http.post({
            path: `/sendmoney`,
            payload: {
                sendUser: user.user_id,
                receiveUser,
                money: sendMoney,
                receiveUserBank: this.state.bankName,
            }
        }).then(({data}) => {
            if(data === 'pass'){
                this.setState({
                    receiveUser: "",
                    sendMoney: "",
                    enableUser: !this.state.enableUser,
                    resultCheck: []
                })
                const { sendMoneyChange, loadHistory } = this.props
                sendMoneyChange(sendMoney);
                loadHistory();
                alert("돈을 보냈습니다");
            }
        }).catch(err => {
            console.log(err)
        })
    }
    render() {
        const { checkLoading, resultCheck, enableUser, receiveUser, sendMoney } = this.state
        return (
                <SendMoneyDiv id="bank" className="col-md-6">
                    <div className="panel panel-default">
                    <div className="panel-heading text-center lead">Bank Account:</div>
                        <div className="panel-body">
                            <form id="add-account"onSubmit ={e => this.handleChangeCheck(e)} >
                                <div className="form-group">
                                    <label htmlFor="initial-deposit">Send Id Account</label>
                                    <div className="input-group">
                                        <div className="input-group-addon">ID</div>
                                        <input type="text" min="0" name="receiveUser" id="initial-deposit" value = {receiveUser} className="form-control" autoFocus required  onChange = {e => this.handleChange(e)}/>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="initial-deposit">Bank Name</label>
                                    <div className="input-group">
                                        <div className="input-group-addon">Name</div>
                                        <select className="form-control" name ="bankName" value = {this.state.bankName} onChange = {e => this.handleChange(e)} >
                                            <option value = "신한 은행">신한 은행</option>
                                            <option value = "우리 은행">우리 은행</option>
                                            <option value = "농합 은행">농합 은행</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="initial-deposit">Initial deposit</label>
                                    <div className="input-group">
                                        <div className="input-group-addon">WON</div>
                                        <input type="number" min="0" name="sendMoney" id="initial-deposit" className="form-control" value = {sendMoney} autoFocus required onChange = {e => this.handleChange(e)} />
                                        <div className="input-group-addon">.00</div>
                                    </div>
                                </div>
                                
                                {
                                    enableUser ?
                                    <button type="submit" className="btn btn-primary" onClick = {e => this.handleSend(e)}>보내기</button> :
                                    <button type="submit" className="btn btn-primary" onClick = {e => this.handleChangeCheck(e)}>확인</button>
                                }
                                {
                                    checkLoading && 
                                        <div className ="spinner-border text-primary d-flex" style = {{margin: '0 auto'}}></div>
                                }   
                                {
                                    resultCheck.length !== 0 &&
                                        <AccountCheckDiv className = "infor">
                                            <label>받은 사람 성명 : </label>
                                                <p>{resultCheck[0].name}</p>
                                            <label>보내는 돈 :</label>
                                                <p>{resultCheck[0].money}</p>
                                        </AccountCheckDiv>
                                }
                            </form>
                        </div>
                    </div>
            </SendMoneyDiv>
        )
    }
}

const SendMoneyDiv = styled.div`
`
const AccountCheckDiv = styled.div`
    margin-top: 2rem
`