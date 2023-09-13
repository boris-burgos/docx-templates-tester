import React, {MouseEventHandler, useState} from 'react'

import processTemplate from "../process-template";

type Props = {
    onClick?: MouseEventHandler,
    text: string,
}


type TemplateState = {
    file?: FileList | null,
    json: string,
}

const actionButton = (state: TemplateState) => {

    if(state.file && state.file.length > 0) {
        //window.alert(state.file[0] || "No hay archivo")
    } else {
        window.alert("No hay FileList")
    }




    if(state.file && state.file.length > 0 && state.file[0]) {
        pruebaTemplate(state.file[0])
    }


}

const pruebaTemplate = async (file: File) => {

    window.alert(await processTemplate(file))


}






const Controls = ({ text }: Props) => {

    const templateState: TemplateState = {json: text}

    const [state, setState] = useState(templateState);


    return (
        <>
            <input
                type='file'
                id='template'
                name='template'
                accept='*'
                onChange={e => setState({...state, file: e.target.files})}
            />
            <textarea
                name="textValue"
                value={state["json"]}
                onChange={e => setState({...state, json: e.target.value})}
            />
            <button onClick={() => actionButton(state)}>
                Aplicar
            </button>
        </>)


}

export default Controls
