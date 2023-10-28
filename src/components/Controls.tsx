import {MouseEventHandler, useState} from 'react'
import processTemplate from "../process-template";

type Props = {
    onClick?: MouseEventHandler,
    text: string,
}

type TemplateState = {
    file?: FileList | null,
    json: string,
    url?: string | null,
    tz?: string
}

const pruebaTemplate = async (file: File, data: string, url: string, tz?: string) => {
    await processTemplate(file, data, url, tz)
}

const Controls = ({ text }: Props) => {
    const templateState: TemplateState = {json: text}
    const [state, setState] = useState(templateState)
    const [error, setError] = useState(false)

    const actionButton = (state: TemplateState) => {
        try {
            JSON.parse(state.json)
            setError(false)

            if(state.file && state.file.length > 0) {
                //window.alert(state.file[0] || "No hay archivo")
            } else {
                window.alert("No se ha seleccionado un archivo")
            }
        
            if(state.file && state.file.length > 0 && state.file[0] && state.url) {
                pruebaTemplate(state.file[0], state.json, state.url, state.tz)
            }
        } catch {
            setError(true)
        }    
    }

    return (
        <>
            <div style={{ height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexFlow: 'column', gap: 10 }}>
                    <input
                        type='file'
                        id='template'
                        name='template'
                        accept='*'
                        onChange={e => setState({...state, file: e.target.files})}
                    />
                    <div>
                        <span style={{ marginRight: 4 }}>URL de la api</span>
                    <input
                        type='text'
                        id='url'
                        name='url'
                        accept='*'
                        onChange={e => setState({...state, url: e.target.value})}
                    />
                    </div>
                    <div>
                        <span style={{ marginRight: 4 }}>TimeZone</span>
                    <input
                        type='text'
                        id='tz'
                        name='tz'
                        accept='*'
                        onChange={e => setState({...state, tz: e.target.value})}
                    />
                    </div>
                </div>
                <textarea
                    name="textValue"
                    value={state["json"]}
                    onChange={e => setState({...state, json: e.target.value})}
                    style={{ height: '60%', width: '50%', marginTop: 20, marginLeft: 50, marginRight: 50}}
                />
                <button onClick={() => actionButton(state)}>
                    Aplicar
                </button>
            </div>
            {error && <div style={{ color: 'red' }}>JSON no válido. <a href="https://jsonformatter.curiousconcept.com/">https://jsonformatter.curiousconcept.com/</a></div>}
        </>
    )
}

export default Controls
