// src/components/FaceFilter.jsx
import { useEffect, useRef } from "react";
// import JeelizThreeGlassesCreator from "../JeelizThreeGlassesCreator";

// let THREECAMERA = null;

const FaceFilter = ({model}) => {
    useEffect(() => {
        let THREECAMERA = null

        function detect_callback(faceIndex, isDetected) {
            console.log(`INFO: Face ${isDetected ? 'DETECTED' : 'LOST'}`)
        }

        function init_threeScene(spec) {
            const threeStuffs = JeelizThreeHelper.init(spec, detect_callback)

            threeStuffs.renderer.toneMapping = THREE.ACESFilmicToneMapping
            threeStuffs.renderer.outputEncoding = THREE.sRGBEncoding

            const r = JeelizThreeGlassesCreator({
                envMapURL: "envMap.jpg",
                frameMeshURL: `models3D/${model.glassesFrames}`,
                lensesMeshURL: `models3D/${model.glassesLenses}`,
                occluderURL: "models3D/face.json"
            })

            const dy = 0.07

            r.occluder.rotation.set(0.3, 0, 0)
            r.occluder.position.set(0, 0.03 + dy, -0.04)
            r.occluder.scale.multiplyScalar(0.0084)
            threeStuffs.faceObject.add(r.occluder)

            const threeGlasses = r.glasses
            threeGlasses.position.set(0, dy, 0.6)
            threeGlasses.scale.multiplyScalar(0.006)
            threeStuffs.faceObject.add(threeGlasses)

            THREECAMERA = JeelizThreeHelper.create_camera()
        }

        function init_faceFilter(videoSettings) {
            JEELIZFACEFILTER.init({
            followZRot: true,
            canvasId: "jeeFaceFilterCanvas",
            NNCPath: "neuralNets/",
            maxFacesDetected: 1,
            callbackReady: function (errCode, spec) {
                if (errCode) {
                console.error("ERROR in callbackReady:", errCode)
                return
                }
                console.log("INFO: JEELIZFACEFILTER IS READY")
                init_threeScene(spec)
            },
            callbackTrack: function (detectState) {
                JeelizThreeHelper.render(detectState, THREECAMERA)
            }
            })
        }

        function main() {
            JeelizResizer.size_canvas({
            canvasId: "jeeFaceFilterCanvas",
            callback: function (isError, bestVideoSettings) {
                init_faceFilter(bestVideoSettings)
            }
            })
        }

        main()

        return () => {
            
        }
    }, [model])
  return (
    <canvas
      width="600"
      height="600"
      id="jeeFaceFilterCanvas"
    ></canvas>
  );
};

export default FaceFilter;
