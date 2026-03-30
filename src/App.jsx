import AuthComponent from "./AuthComponent";

function App() {
  const handleAuth = (data) => {
    console.log("Auth success:", data);
    // data.token is available here
    // redirect or update app state
  };

  return <AuthComponent onAuthSuccess={handleAuth} />;
}

export default App;