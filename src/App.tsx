import React, {ChangeEventHandler, MouseEventHandler} from 'react'


import logo from './logo.svg';
import './App.css';
import Button from "./components/Button";
import TextArea from "./components/JSON-Textarea";
import TemplateInput from "./components/TemplateInput";
import Controls from "./components/Controls";

const onActionButtonClick: MouseEventHandler = () => {
window.alert("eeee");
};


const onChangeTextarea: ChangeEventHandler = () => {
    window.alert("cccc");
};



const buttonText = "Aplicar template"

function App() {
  return (
    <div className="App">

<Controls text={"holi"}/>


    </div>
  );
}

export default App;
