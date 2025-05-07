import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { GenerativeArt } from "./views";
import { useArtworkStore } from "./stores/artworkStore";
import { useTutorialStore } from "./stores/tutorialStore";

const App: React.FC = () => {
  // Initialize stores when app mounts
  const { customAlgorithms } = useArtworkStore();
  const { availableTutorials } = useTutorialStore();

  useEffect(() => {
    // This hook ensures stores are initialized
    console.log("App mounted, stores initialized");
    console.log(`Loaded ${customAlgorithms.length} custom algorithms`);
    console.log(`Loaded ${availableTutorials.length} tutorials`);
  }, [customAlgorithms.length, availableTutorials.length]);

  return (
    <Routes>
      <Route path="/art" element={<GenerativeArt />} />
      <Route path="/art/create" element={<GenerativeArt />} />
      <Route
        path="/art/gallery"
        element={<GenerativeArt showTutorial={false} />}
      />
      {/* Default route */}
      <Route path="*" element={<Navigate to="/art" replace />} />
    </Routes>
  );
};

export default App;
