import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Http from '../../../component/Http';

function AccountHistory(props) {
    const [sended, setSended] = useState([]);
    const [receive, setReceived] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const { user_id } = user;
        Http.get({
            path: `/history/${user_id}`
        }).then(({data}) => {
            const { send, receive } = data.data;
            if(send != null)
            {
                setSended(send)
            }
            if(receive === null)
            {
                setReceived(receive)
            }
        }).catch(err => {
            console.log(err)
        })
    }, [props.loadAccoutHistory])
    return (
        <AccountHistoryDiv className="panel panel-info" id="history-panel">
            <div className="panel-heading text-center lead" id="history-header">Account History</div>
            {
                sended.length !== 0 &&<>
                <h3 style = {{textAlign:'center'}}>이체</h3>
                <table className="table table-striped" id="history">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>이체 계좌</th>
                                <th>이체 금액</th>
                                <th>은행</th>
                                <th>날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                                {
                                    sended.map((item,index) => {
                                        return (
                                            <tr key = {index}>
                                                <th>{index + 1}</th>
                                                <th>{item[2]}</th>
                                                <th>{parseInt(item[5]).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</th>
                                                <th>{item[4]}</th>
                                                <th>{item[6]}</th>
                                            </tr>
                                        )
                                    })
                                }
                        </tbody>
                    </table>
                </>
            }
            {
                receive.length !== 0 && <>
                    <h3 style = {{textAlign:'center'}}>입금</h3>
                    <table className="table table-striped" id="history">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>입금 계좌</th>
                                <th>입금 금액</th>
                                <th>은행</th>
                                <th>날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                                {
                                    receive.map((item,index) => {
                                        return (
                                            <tr key = {index}>
                                                <th>{index + 1}</th>
                                                <th>{item[1]}</th>
                                                <th>{parseInt(item[5]).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</th>
                                                <th>{item[3]}</th>
                                                <th>{item[6]}</th>
                                            </tr>
                                        )
                                    })
                                }
                        </tbody>
                    </table>
                </>
            }
            
    </AccountHistoryDiv>
    )
}
const AccountHistoryDiv = styled.div`
    margin-bottom: 5rem
`
AccountHistory.propTypes = {

}

export default AccountHistory

