import React from 'react';
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.min.js';
import "p5/lib/addons/p5.sound.min";
import p5 from "p5";
import './WaveSurgerContainer.scss'


class WaveSurferContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playing: false,
        }
        this.mic = new p5.AudioIn();
        this.recorder = new p5.SoundRecorder();
        this.recorder.setInput(this.mic);

        this.soundFile = new p5.SoundFile();

    }

    componentDidMount(){
            let waveform = WaveSurfer.create({
            container: "#waveform",
            waveColor: "#01BAB6",
            interact: false,
            cursorWidth: 0,
            barGap: 2,
            barHeight: 10,
            height: 100,
            progressColor: '#2D5BFF',
            fillParent: true,
            forceDecode: true,
            plugins: [ MicrophonePlugin.create() ],
            responsive: true,
        });

        waveform.microphone.on('deviceReady', function (stream) {
            console.info('Device ready!', stream);
        });
        waveform.microphone.on('deviceError', function(code) {
            if(code){
                alert('Device cannot find')
                console.warn('Device error: ' + code);
            }
        })
        let microphone = waveform.microphone; // you had the case wrong!
        microphone.start(); 

    
    }

    handlePlay = () => {
        this.setState({
            playing: !this.state.playing,
        })
        let { playing } = this.state;
        //녹화중
        if(!playing){
            this.mic.start();
            this.recorder.record(this.soundFile)
        }else{ //녹화 끝
            try {
                this.mic.stop();
                this.recorder.stop();
            } catch (error) {
                alert('Micro 연결 오류 발생합니다. 다시 새로 고침됩니다.')
                window.location.reload();
                console.log(error)
            }
        }
    };

    handleCheckVoice = () => {
        this.soundFile.play();
        var blodFile = this.soundFile.getBlob();
        const { hanleChangeVoice } = this.props;
        hanleChangeVoice(blodFile);
    }

    render() {

        return (
            <div className="wavesurfer">        
                <div id="waveform"  style={{background: '#ccc'}}/>
                    <button onClick={() => this.handlePlay()}>
                        {this.state.playing ? <i className="microphone icon"></i> :  <i className="microphone slash icon"></i>}
                    </button>
                    <button className="btn btn-primary" onClick={() => this.handleCheckVoice()}>음성 데이터 보내기</button>
            </div>
        );
    }
}
export default WaveSurferContainer;