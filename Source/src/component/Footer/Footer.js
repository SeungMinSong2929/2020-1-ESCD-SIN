import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

function Footer(props) {
    return (
        <FooterWarapper className="container-fluid">
            <div className="row">
                <p className="text-white text-center display-5">
                    Developed By SIN Team 2020 - 01
                </p>
            </div>
        </FooterWarapper>
    )
}
const FooterWarapper = styled.div`
    background: var(--mainBlue);
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    bottom: 0px;
    padding: 10px 0px;
    z-index: 99;
    p{
        margin-bottom: 0px;
    }
`
Footer.propTypes = {
}

export default Footer

