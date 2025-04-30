import React, { useEffect, useRef } from 'react';
// import modelPlayer from 'js-3d-model-viewer';

const opts = {
  grid: false,
  trackball: false,
//   background: 'rgb(100, 100, 100)'
};

const LiveViewer = ({ model }) => {
  const viewerRef = useRef(null);
  const sceneRef = useRef(null); // Store scene instance


  useEffect(() => {
    if (!viewerRef.current || !model?.path) return;

    if (viewerRef.current) {
        viewerRef.current.innerHTML = '';
    }


    const scene = Js3dModelViewer.prepareScene(viewerRef.current, opts);
    sceneRef.current = scene;

    // Detect file type to choose the loader
    const ext = model.path.split('.').pop().toLowerCase();
    if (ext === 'obj') {
        Js3dModelViewer.loadObject(scene, model.path);
    } else if (ext === 'glb' || ext === 'gltf') {
        Js3dModelViewer.loadGlb(scene, model.path);
    }
    return () => {
        if (viewerRef.current) {
            viewerRef.current.innerHTML = '';
        }
    };
  }, [model]);

  return (
    <div className={`cursor-pointer`}>
      <h1>{model.name}</h1>
      <div
        id="viewer"
        ref={viewerRef}
        style={{ width: '500px', height: '400px' }}
      ></div>
    </div>
  );
};

export default LiveViewer;
