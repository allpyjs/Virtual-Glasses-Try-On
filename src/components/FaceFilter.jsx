// src/components/FaceFilter.jsx
import { useEffect, useRef, useState } from "react";

import faceLineSvg from "/faceline.svg";

// import JeelizThreeGlassesCreator from "../JeelizThreeGlassesCreator";

let THREECAMERA = null;

const FaceFilter = ({ model, canvasRef, distance }) => {
  const threeStuffsRef = useRef(null)
  const initialFaceObjectRef = useRef(null)
  const [isFaceDetected, setIsFaceDetected]= useState(false)

  function detect_callback(faceIndex, isDetected) {
    setIsFaceDetected(isDetected)
    console.log(
      `INFO in detect_callback(): ${isDetected ? "DETECTED" : "LOST"}`
    );
  }

  function init_threeScene(spec) {
    const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);
    threeStuffs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    threeStuffs.renderer.outputEncoding = THREE.sRGBEncoding;

    threeStuffsRef.current = threeStuffs

    load_glasses_model()

    THREECAMERA = JeelizThreeHelper.create_camera();
  }

  function load_glasses_model() {
    if (!threeStuffsRef.current) return

    const r = JeelizThreeGlassesCreator({
      envMapURL: "envMap.jpg",
      frameMeshURL: `models3D/${model.glassessFrames}`,
      lensesMeshURL: `models3D/${model.glassessLenses}`,
      occluderURL: "models3D/face.json",
    });

    threeStuffsRef.current.faceObject.children = []

    const dy = 0.07;

    r.occluder.rotation.set(0.3, 0, 0);
    r.occluder.position.set(0, 0.03 + dy, -0.04);
    r.occluder.scale.multiplyScalar(0.0084);
    threeStuffsRef.current.faceObject.add(r.occluder);

    const threeGlasses = r.glasses;
    threeGlasses.position.set(0, dy, 0.5 + (distance - 60) / 150);
    threeGlasses.scale.multiplyScalar(0.006);
    threeStuffsRef.current.faceObject.add(threeGlasses);
  }

  function init_faceFilter(videoSettings) {
    JEELIZFACEFILTER.init({
      followZRot: true,
      canvasId: "jeeFaceFilterCanvas",
      NNCPath: "neuralNets/",
      maxFacesDetected: 1,
      callbackReady: (errCode, spec) => {
        if (errCode) {
          // console.error("AN ERROR HAPPENS. ERR =", errCode);
          return;
        }
        // console.log("INFO: JEELIZFACEFILTER IS READY");
        init_threeScene(spec);
      },
      callbackTrack: function (detectState) {
        JeelizThreeHelper.render(detectState, THREECAMERA);
      },
    });
  }

  function loader() {
    JeelizResizer.size_canvas({
      canvasId: "jeeFaceFilterCanvas",
      callback: function (isError, bestVideoSettings) {
        if (isError) {
          // console.error("JeelizResizer failed:", isError);
          return;
        }
        // console.log("Video settings:", bestVideoSettings);
        init_faceFilter(bestVideoSettings);
      },
    });
  }

  function destroy() {
    if (!threeStuffsRef.current) return
  }

  useEffect(() => {
    loader()
  }, [])

  useEffect(() => {
    load_glasses_model()
  }, [model, distance])

  return (
    <>
      <canvas
        id="jeeFaceFilterCanvas"
        className="w-[800px] h-[600px]"
        ref={canvasRef}
      />
      {!isFaceDetected && (
        <div className="absolute top-0 left-0 right-0 bottom-0 text-center overflow-hidden">
          <img src={faceLineSvg} alt="" className="scale-150 mt-20" />
        </div>
      )}
    </>
  );
};

export default FaceFilter;
