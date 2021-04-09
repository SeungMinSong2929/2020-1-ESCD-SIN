import axios from 'axios';
import cookie from 'js-cookie'

class Http{
    //!Default path
    constructor() {
        this.service = axios.create({ //Create custom instace default
            baseURL: `http://210.94.194.70:5000/` //procces.env.PYTHON_API_SERVER
        })
        this.service.interceptors.response.use(res => res, this.errorHandler);
    }
    //Global axios defaults
    authorization(){
        this.service.defaults.headers.common["Access-Control-Allow-Origin"] = `*`;
        this.service.defaults.headers.common['Access-Control-Allow-Credentials'] = true;
    }

    errorHandler = (error) => {
        if(error.response){
            let status = error.response.status;
            if(status === 400 ||  status === 401 || status === 402 || status === 500)
                document.location = '/'
        }
        return Promise.reject(error);
    }

    httpRun(method, {path,  headers, params, payload}){
        this.authorization();
        return new Promise((resolve, reject) => {
            this.service.request(path, {
                method, headers, params, data: payload
            }).then(value => {
                resolve(value);
            }).catch(errror => {
                console.log(errror)
                reject(errror)
            })
        })
    }
    get(props){
        return this.httpRun("GET", props)
    }
    post(props){
        return this.httpRun("POST", props)
    }
    put(props){
        return this.httpRun("PUT", props)
    }
}

export default new Http();