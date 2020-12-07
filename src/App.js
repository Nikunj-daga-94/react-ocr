import React,{Component} from 'react';
import { createWorker } from 'tesseract.js';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import 'filepond/dist/filepond.min.css';
import './App.css';

registerPlugin(FilePondPluginImagePreview);

class App extends Component {
    constructor(props){
        super(props)
        this.state = {
            isProcessing : false,
            ocrText : '',
            pctg : '0.00',
            dob:"",
            pan:""
        }
        this.pond = React.createRef();
        this.worker = React.createRef();
        // this.updateProgressAndLog = this.updateProgressAndLog.bind(this);
    }


     async OCRtemplate( file) {
        this.setState({
            isProcessing : true,
            ocrText : '',
            pctg : '0.00'
        })
       
        await this.worker.load();
     
        await this.worker.loadLanguage('eng');
        await this.worker.initialize('eng');
    
        const dataOCR = await this.worker.recognize(file.file);
        // let panNum,DOBirth;
        const panNumber=/[A-z]{5}[0-9]{4}[A-Z]{1}/,
        DOB=/^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
        const patterns = dataOCR.data.lines.map(val => val.text.trim());
        // let patterns = dataOCR.data.text.match(pattern);
        const DOBirth=patterns.filter(val=>val.match(DOB)),
        panNum=patterns.filter(val=>val.match(panNumber));
        
        const confidence=dataOCR.data.confidence;
        if(confidence>=70){
        this.setState({
            isProcessing : false,
            ocrText : dataOCR.data.text,
            dob:DOBirth,
            pan:panNum
        })
    }
    else{
        this.setState({
            isProcessing : false,
            ocrText : "Image is not clear.please upload a clear image ."
        })
    }
    };
    updateProgressAndLog=(m)=>{

    
        let max_perctg = 1 ;
        let decimal = 2 ;

        if(m.status === "recognizing text"){
            const pctg = (m.progress / max_perctg) * 100
            this.setState({
                pctg : pctg.toFixed(decimal)
            })

        }
    }
    componentDidMount(){

        this.worker = createWorker({
            logger: m => this.updateProgressAndLog(m),
        });

    }
    render() {
        return (
            <div className="App">
                <div className="container">
                    <div style={{marginTop : "10%"}} className="row">
                        
                        <div className="col-md-4">
                            <FilePond ref={ref => this.pond = ref}
                                onaddfile={(err,file) =>{
                                    this.OCRtemplate(file);

                                }}
                                onremovefile={(err,fiile) =>{
                                    this.setState({
                                        ocrText : ''
                                    })
                                }}
                                />
                        </div>
                        
                    </div>
                    <div className="">
                        <h5 className="">
                            <div style={{margin : "1%", textAlign: "left"}} className="row">
                                <div className="col-md-12">
                                    <i className={"fas fa-sync fa-2x " + (this.state.isProcessing ? "fa-spin" : "")}></i> <span className="status-text">{this.state.isProcessing ? `Processing Image ( ${this.state.pctg} % )` : "Parsed Text"} </span>
                                </div>

                            </div>

                        </h5>
                        <div className="">
                            <p >{(this.state.isProcessing) ?
                                    '...........'
                                    : this.state.ocrText.length === 0 ? "No Valid Text Found / Upload Image to Parse Text From Image" : 
                                   <div> 
                                       <div className="">{this.state.ocrText }</div>
                                    <div> {"DOB:" +this.state.dob}</div>
                                    <div> {"PAN: "+this.state.pan}</div>
                                    </div>
                                    }</p>
                            </div>
                        </div>


                       
                    </div>

                </div>
            );}
        }

        export default App;
