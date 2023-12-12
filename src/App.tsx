import "./App.css";
import Camera from "./components/Camera/Camera";

function App() {
  return (
    <>
      <Camera setResult={(url) => setTimeout(() => alert(url), 1000)} />
    </>
  );
}

export default App;
