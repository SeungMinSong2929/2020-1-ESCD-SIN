import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TitleBody from '../../../component/TitleBody'
export default class MainPage extends Component {
    static propTypes = {
        prop: PropTypes
    }
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div className="container">
                <TitleBody />
                <div className="row">
                    <div className = "col-lg-4">
                        <h3 className = "text-primary">문제 정의</h3>
                        <p style = {{lineHeight: '25px'}}>
                            현재 사용자 인증 및 접근에서의 음성인식이 인증 수단으로 이용되고 있음. 
                            음성인식을 통한 인증 방식은 다른 인증 수단에 비해 편리하다는 장점이 있는 반면에, 
                            사용자 음성 위조⦁변조 등 기술한계로 인해 보안에서 취약해질 수 있다는 문제점을 지님. 
                            본 설계에서는 기존 사용자 음성을 활용한 사용자 인증 및 접근제어 시스템의 보안취약점을 개선하고 보완할 방안을 제시하고 이를 구현.
                        </p>
                    </div>
                    <div className = "col-lg-4">
                        <h3 className = "text-info">설계 주제 및 목적</h3>
                        <p style = {{lineHeight: '25px'}}>
                            서비스 인증을 하기 위한 여러 방법이 제시되면서 그 중 하나로 음성 인식을 예로 들 수 있음. 음성인식 서비스를 제공하기 위해서는 각각의 사용자를 구분하며 보안을 지킬 수 있어야 함. 
                            이번 설계 주제는 이러한 보안 이슈를 해결하기 위해 사용자 음성을 사용한 서비스 사용자 인증 및 접근제어 시스템 개발을 주제로 함.
                            기존 음성인식을 통한 인증방식은 사용자 음성 위조⦁변조 등 기술한계로 인해 보안에서 취약해질 수 있다는 문제점을 지님. 이 설계에서는 사용자 인증을 통해 이를 해결하고자 함. 
                        </p>
                    </div>
                    <div className = "col-lg-4">
                        <h3 className = "text-success">기능 요구 조건</h3>
                        <p style = {{lineHeight: '25px'}}>
                            사용자 음성 활용한 서비스 사용자 인증 및 접근 제어 시스템<br/>
                            ● 사람의 목소리를 인식하는 마이크 <br/>
                            ● 사용자 계정 생성 및 인증 수단(음성 인식) 등록<br/>
                            ● 사용자 목소리 저장하는 데이터베이스<br/>
                            ● 기 등록값과 입력받은 음성을 비교하는 기능(검증)<br/>
                            ● 비교 결과에 따라 접근 권한 부여<br/>
                            ● 음성 인식된 내용을 문자 데이터로 전환 처리하는 기능<br/>
                            ● PC 또는 모바일 단말에서 운용<br/>
                            ● 예제 서비스(예 은행, 쇼핑몰 등)에서 활용<br/>
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}
