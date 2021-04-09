import React from 'react'
import styled from 'styled-components'
import ReactLoading from 'react-loading'

function Loading({type, color}) {
    return (
        <LoadingBox>
            <ReactLoading type = {type} color = {color} height = {100} width = {100}/>
        </LoadingBox>
    )
}
const LoadingBox = styled.div`
    position: fixed;
    top: 0px;
    left: 0px;
    background: rgb(42, 42, 114, 0.5);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
`
export default Loading

