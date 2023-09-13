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
    <div className="App">

<Controls text={JSON.stringify(inputJson)}/>


    </div>
  );
}

export default App;
