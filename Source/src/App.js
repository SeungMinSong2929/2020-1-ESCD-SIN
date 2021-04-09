import React, { Suspense } from 'react';
import { Switch, Route, BrowserRouter} from 'react-router-dom'
import './App.scss'
import './scss/semantic.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Header from './component/Header/Header';
import Footer from './component/Footer/Footer';
import Default from './component/Default';
import Loading from './component/Loading';
// import Main from './component/Main';

const Main = React.lazy(() => import('./fetures/Main'));
function App() {
  return (
    <div className="voice-app">
      <Suspense fallback={<Loading type = "bars" color = "#fff"/>}>
        <BrowserRouter>
          <Header/>
            <Switch>
              <Route path="/" component={Main} />
              <Route component={Default}/>
            </Switch>
          <Footer/>
        </BrowserRouter>
      </Suspense>
    </div>
  );
}

export default App;
