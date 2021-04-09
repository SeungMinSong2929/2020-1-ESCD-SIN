

import Promise from 'es6-promise'
import Http from '../component/Http';

const LOGIN_PENDING = 'LOGIN_PENDING';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_ERROR = 'LOGIN_ERROR';

function setLoginPending(isLoginPending){
    return {
        type: LOGIN_PENDING,
        isLoginPending
    };
}

function setLoginSuccess(isLoginSuccess){
    return{
        type: LOGIN_SUCCESS,
        isLoginSuccess
    };
}

function setLoginError(loginError){
    return{
        type: LOGIN_ERROR,
        loginError
    };
}

export function login(id, password){
    return dispatch => {
        dispatch(setLoginPending(true));
        dispatch(setLoginSuccess(false));
        dispatch(setLoginError(null));

        sendLoginRequest(id , password).then(success => {
            dispatch(setLoginPending(false))
            dispatch(setLoginSuccess(true))
        }).catch(err =>{
            dispatch(setLoginPending(false));
            dispatch(setLoginError(err))
        })
    }
}

export default function reducer(initstate = {
    isLoginPending: false,
    isLoginSuccess: false,
    loginError: null
},action){
    switch (action.type) {
        case LOGIN_SUCCESS:
            return{
                ...initstate,
                isLoginSuccess: action.isLoginSuccess
            }
        case LOGIN_PENDING:
            return{
                ...initstate,
                isLoginPending: action.isLoginPending
            }
        case LOGIN_ERROR:
            return{
                ...initstate,
                loginError: action.loginError
            }
        default:
            return initstate;
    }
}
function sendLoginRequest( id, password){
    return new Promise((resolve, reject) => {
        if(id && password){
                Http.post({
                    path: '/loginwithnovoice',
                    payload: {
                        'username': id, password
                    }
                }).then(({data}) => {
                    const { message } = data;
                    if(message === 'fail')
                    {
                        return reject(new Error("아이디 틀렸습니다"));
                    }else{
                        const { id, user_id,email, isvoice, money } = data.user;
                        const user = {id, user_id, email, isvoice, money};
                        localStorage.setItem("user", JSON.stringify(user))
                        // this.props.history.push(`/service`);
                        // alert("로그인 성공했습니다");
                    }
                    return resolve(true);
                }).catch(err =>
                    {
                        //! 서버 연결 실패
                        alert("서버 연결 실패합니다");
                        console.log(err)    
                    }
                )
            }else{
                return reject(new Error("아이디 틀렸습니다"));
            }
    });
}