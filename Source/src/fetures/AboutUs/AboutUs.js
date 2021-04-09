import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

function AboutUs(props) {
    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="panel panel-default" id="page-header">
                        <div className="panel-body" id="page-title">
                            <TitleSystem className="text-center" id="title">팀 소개</TitleSystem>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
const TitleSystem = styled.div`
    font-size: 40px;
    box-shadow: 0px 10px #2a2a72;
`

AboutUs.propTypes = {

}
export default AboutUs
