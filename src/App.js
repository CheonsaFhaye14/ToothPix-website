import React from 'react';
import Page1 from './pages/page1';  // Correct the import to refer to Login component
import './index.css'; // Or './App.css' depending on where you put it
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <Page1 />  {/* Render the Login component */}
    </div>
  );
}

export default App;
