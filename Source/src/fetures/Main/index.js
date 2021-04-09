import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route, useRouteMatch } from 'react-router-dom'
import MainPage from './pages/MainPage';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Default from '../../component/Default';
import ServiceMain from '../Service/pages/Service';
import FuturePlans from '../FuturePlans/FuturePlans';
import Description from '../Description/Description';
import AboutUs from '../AboutUs/AboutUs';
function Main(props) {
    const match = useRouteMatch();
    return (
        <Switch>
            <Route exact path={match.url} component ={MainPage} />
            <Route path={`${match.url}login`} component ={Login} />
            <Route path={`${match.url}join`} component ={Register} />
            <Route path="/service" component={ServiceMain} />
            <Route path="/description" component={Description} />
            <Route path="/futureplans" component={FuturePlans} />
            <Route path="/about" component={AboutUs} />

            <Route component = {Default}/>
        </Switch>
    )
}

Main.propTypes = {

}

export default Main

