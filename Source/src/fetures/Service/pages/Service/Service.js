import React, { Component } from 'react'
import './Service.scss'
import SendMoney from '../../components/SendMoney'
import AccountHistory from '../../components/AccountHistory'
import Http from '../../../../component/Http'
import styled from 'styled-components'

export default class Service extends Component {
    constructor(props) {
        super(props)
        this.state = {
            id: "",
            myMoney: "",
            sendAccount : "",
            sendMoney : "",
        }
    }
    handleChange = (e) => {
        
    }
    componentDidMount(){
        const user = JSON.parse(localStorage.getItem('user'));
        const { id, user_id } = user;
        Http.get({
            path: `/getmoney/${id}`,
        }).then(({data}) => {
            this.setState({
                myMoney: data.data.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'),
                id: user_id
            })
        }).catch(err => {
            alert("서버 연결에 실패했습니다. 다시 확인해주세요.")
            console.log(err)
        })
    }
    sendMoney = (money) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const { id, user_id } = user;
        Http.get({
            path: `/getmoney/${id}`,
        }).then(({data}) => {
            this.setState({
                myMoney: data.data.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'),
            })
        }).catch(err => {
            alert("서버 연결에 실패했습니다. 다시 확인해주세요.")
            console.log(err)
        })
    }
 
    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="panel panel-default" id="page-header">
                            <div className="panel-body" id="page-title">
                                <TitleSystem className="text-center" id="title">WelCome SIN Bank System !</TitleSystem>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <SendMoney 
                        sendMoneyChange = {(money) => this.sendMoney(money)}
                    />
                    <div id="account" className="col-md-6">
                        <div className="panel panel-default">
                            <div className="panel-heading text-center lead">Your Account</div>
                            <div className="panel-body">
                                <div className="form-group">
                                    <label htmlFor="initial-deposit">My ID</label>
                                        <div className="input-group">
                                            {this.state.id}
                                        </div>
                                    <label htmlFor="initial-deposit">잔액</label>
                                    <div className="input-group">
                                        <div className="input-group-addon">WON</div>
                                        <input type="text" min="0" name="initial-deposit" id="initial-deposit" className="form-control" autoFocus required  value = {this.state.myMoney}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="account" className="row">
                    <div className="col-md-12">
                        <AccountHistory
                            loadAccoutHistory = {this.state.myMoney}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
const TitleSystem = styled.div`
    font-size: 40px;
    box-shadow: 0px 10px #2a2a72;
`