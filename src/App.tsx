import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { GenerativeArt } from "./views";
//import { useArtworkStore } from "./stores/artworkStore";
//import { useTutorialStore } from "./stores/tutorialStore";

const App: React.FC = () => {
  // Initialize stores when app mounts
  useEffect(() => {}, []);

  return (
    <Routes>
      <Route path="/art" element={<GenerativeArt />} />
      <Route path="/art/create" element={<GenerativeArt />} />
      <Route path="/art/gallery" element={<GenerativeArt />} />
    </Routes>
  );
};

export default App;
