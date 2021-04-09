import React, { useState, Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { login } from '../../redux/reducer'
class Header extends Component {
    constructor(props){
        super(props)
    }

    logOut = () =>{
        window.location.replace("http://localhost:3000");
        localStorage.clear();
    }
    render() {
        return(
            <HeaderWarapper className="navbar navbar-expand-lg px-sm-5">
            <Link to="/">
                <img src="https://media-exp1.licdn.com/dms/image/C4E0BAQHMfiIlfjYpkQ/company-logo_200_200/0?e=2159024400&v=beta&t=rNdA57yGa_S9fw81aTbRbLMdvmVOcTfdwQ4aeKfVL2c" 
                />
            </Link>
            <ul className="navbar-nav align-items-center">
                <li className="nav-item ml-5">
                    <Link to="/description" >
                        How it Works
                    </Link>
                </li>
                <li className="nav-item ml-5">
                    <Link to="/futureplans">
                        Future Plans
                    </Link>
                </li>
                <li className="nav-item ml-5">
                    <Link to="/about">
                        About Us
                    </Link>
                </li>
                <li className="nav-item ml-5">
                    <a  href="https://github.com/CSID-DGU/2020-1-ESCD-SIN" target = "_blank">
                        Github
                    </a>
                </li>
            </ul>
            <div className="ml-auto">
                {
                    !localStorage.getItem('user') ?
                        <Link to = "/login" className="ml-2" style = {{
                            padding: "10px",
                            paddingLeft: "20px",
                            paddingRight: "20px",
                        }} >
                                <span className="mr-2">
                                    <i className="fa fa-user"/>
                                </span>
                                로그인
                        </Link>
                    :   
                    <>
                        <spann style = {{color:"white"}}> Welcome {JSON.parse(localStorage.getItem('user')).user_id}</spann>
                        <Link onClick = {this.logOut}
                            style = {{
                                padding: "10px",
                                paddingLeft: "20px",
                                paddingRight: "20px",
                            }}
                        >로그아웃</Link>
                        </>

                }
                <Link to = "/join" className="" style = {{
                    background: "orange",
                    padding: "10px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    color: "black"
                }}>
                        <span className="mr-2">
                            <i className="fa fa-registered"/>
                        </span>
                        회원 가입
                </Link>
            </div>
        </HeaderWarapper>
        )    
    }
}

const HeaderWarapper = styled.div`
    background: var(--mainBlue);
    height: 150px;
    img{
        width: 150px;
        height: 150px;
    }
    a{
        color: var(--mainWhite)
    }
`
const mapStateToProps = (state) => {
    return {
        isLoginPending: state.isLoginPending,
        isLoginSuccess: state.isLoginSuccess,
        loginError: state.loginError
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        login: (id, password) => dispatch(login(id, password))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Header);
