import "./App.css";
// import AnotherCamera from "./components/Camera/AnotherCamera";
import Camera from "./components/Camera/Camera";

function App() {
  return (
    <>
      <Camera setResult={(url) => setTimeout(() => alert(url), 1000)} />
      {/* <AnotherCamera setResult={(url) => setTimeout(() => alert(url), 1000)} /> */}
    </>
  );
}

export default App;
