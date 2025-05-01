import React, { useEffect, useRef, useLayoutEffect } from "react";
// import modelPlayer from 'js-3d-model-viewer';

const opts = {
  grid: false,
  trackball: false,
  background: "#d4d4d4",
};

const LiveViewer = ({ model }) => {
  const viewerRef = useRef(null);
  const sceneRef = useRef(null); // Store scene instance

  useEffect(() => {
    if (!viewerRef.current || !model?.path) return;

    const fetchData = async () => {
      const display = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const settings = display.getVideoTracks()[0].getSettings();

      const screenWidth = window.screen.availWidth;
      const width = screenWidth > 1024 ? 600 : screenWidth;
      const aspectRatio = settings.aspectRatio || 1.333;

      viewerRef.current.innerHTML = "";
      viewerRef.current.style.height = `${width / aspectRatio}px`;
      const scene = Js3dModelViewer.prepareScene(viewerRef.current, opts);
      sceneRef.current = scene;

      // Detect file type to choose the loader
      const ext = model.path.split(".").pop().toLowerCase();
      if (ext === "obj") {
        Js3dModelViewer.loadObject(scene, model.path);
      } else if (ext === "glb" || ext === "gltf") {
        Js3dModelViewer.loadGlb(scene, model.path);
      }
    };
    fetchData();
    window.addEventListener("resize", fetchData);
    return () => {
      if (viewerRef.current) {
        viewerRef.current.innerHTML = "";
      }
      window.removeEventListener("resize", fetchData);
    };
  }, [model, viewerRef.current]);

  return (
    <div className="cursor-grab relative flex w-full h-full">
      <div
        id="viewer"
        ref={viewerRef}
        className="w-full h-full lg:w-3/4 lg:h-3/4 m-auto"
      />
      <div className="absolute bg-gradient-to-b from-neutral-600/50 to-transparent top-0 left-0 w-full h-10" />
      <div className="absolute bg-gradient-to-b from-transparent to-neutral-600/50 bottom-0 left-0 w-full h-10" />
    </div>
  );
};

export default LiveViewer;
