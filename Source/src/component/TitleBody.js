import React from 'react'
import PropTypes from 'prop-types'

function TitleBody(props) {
    return (
        <div className="row justify-content-center">
            <div className="col-auto text-center">
                <p className="display-4 font-weight-bold">Voice Biometrics for User Authentication</p>
                <img  id="maintenance-gif" class="banner-graphic animation" src="images/maintenance-animation-trim.gif"></img>
            </div>
        </div>
    )
}

TitleBody.propTypes = {

}

export default TitleBody

