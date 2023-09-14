import './App.css';
import Controls from "./components/Controls";

function App() {
  const inputJson = {
    project: {
        summary: {
            title: 'Titulo',
            text: 'Appleseed',
            footer: 'Fooooooter'
        },
    }
}

  return (
    <div className='App' style={{ height: '100vh' }}>
      <Controls text={JSON.stringify(inputJson)} />
      <div>
        Sistema de plantillas: <a href="https://github.com/guigrpa/docx-templates#writing-templates">https://github.com/guigrpa/docx-templates#writing-templates</a>
      </div>
      <div>El separador es <span style={{fontWeight: 'bold'}}>{'{{'}</span> y <span style={{fontWeight: 'bold'}}>{'}}'}</span>. 
      Por ejemplo: {'{{ project.summary.title }}'}</div>
    </div>
  );
}

export default App;
