import clsx from "clsx";
import { useState, useRef, useEffect } from "react";
import {
  FaceMesh,
  FACEMESH_RIGHT_IRIS,
  FACEMESH_LEFT_IRIS,
} from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

import "./App.css";
import FaceFilter from "./components/FaceFilter";
import LiveViewer from "./components/LiveViewer";
import PdModal from "./components/PdModal";

// const models = [
//   '1',
//   '2',
//   '3'
// ]

const models = [
  {
    id: 1,
    name: "model 1",
    glassessFrames: "glassesFrames.json",
    glassessLenses: "glassesLenses.json",
    path: "/glassesObj/glasses.obj",
    img: "/glassesImg/1.png",
  },
  {
    id: 2,
    name: "model 2",
    glassessFrames: "gg_r_0.json",
    glassessLenses: "gg_r_1.json",
    path: "/glassesObj/SunGlasses.obj",
    img: "/glassesImg/2.png",
  },
  {
    id: 3,
    name: "model 2",
    glassessFrames: "gg_r_0.json",
    glassessLenses: "gg_r_1.json",
    path: "/glassesObj/leopard.glb",
    img: "/glassesImg/2.png",
  },
];

function App() {
  const [isLive, setIsLive] = useState(true);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  // const [imageData, setImageData] = useState();
  const [downloadLink, setDownloadLink] = useState();
  const [pd, setPd] = useState(60);
  const [showPdModal, setShowPdModal] = useState(false);

  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  function selectModel(model) {
    setSelectedModel(model);
    // console.log("first", model)
  }

  function handleTakePhoto() {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = imageData;
      link.download = "canvas-image.png";
      setDownloadLink(link);
    }
  }

  useEffect(() => {
    if (showPdModal) {
      setDownloadLink(undefined);
    }
  }, [showPdModal]);
  useEffect(() => {
    if (downloadLink) {
      setShowPdModal(false);
    }
  }, [downloadLink]);
  useEffect(() => {
    const getDistance = (p1, p2) => {
      return Math.sqrt(
        Math.pow(p1.x - p2.x, 2) +
          Math.pow(p1.y - p2.y, 2) +
          Math.pow(p1.z - p2.z, 2)
      );
    };
    const onResults = (results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
        const pupils = {
          left: {
            x:
              (results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[0][0]].x +
                results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[2][0]].x) /
              2.0,
            y:
              (results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[0][0]].y +
                results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[2][0]].y) /
              2.0,
            z:
              (results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[0][0]].z +
                results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[2][0]].z) /
              2.0,
            width: getDistance(
              results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[0][0]],
              results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[2][0]]
            ),
          },
          right: {
            x:
              (results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[0][0]].x +
                results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[2][0]].x) /
              2.0,
            y:
              (results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[0][0]].y +
                results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[2][0]].y) /
              2.0,
            z:
              (results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[0][0]].z +
                results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[2][0]].z) /
              2.0,
            width: getDistance(
              results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[0][0]],
              results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[2][0]]
            ),
          },
        };

        // Setting variables for calculation disance between pupils
        const distance = getDistance(pupils.left, pupils.right);
        const irisWidthInMM = 12.0;
        const pupilWidth = Math.min(pupils.left.width, pupils.right.width);
        const pd = (irisWidthInMM / pupilWidth) * distance;
        setPd(Number(pd.toFixed(0)) || 60);
      }
    };
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    faceMesh.onResults(onResults);
    let sendFlag = true;  // Flag for sending frame
    const flagInterval = setInterval(() => {
      sendFlag = !sendFlag; // Reset the flag
    }, 1000);
    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (sendFlag) {
            faceMesh.send({ image: videoRef.current });
            sendFlag = false; // Set flag to false not to send frame for 1 second
          }
        },
      });
      camera.start();
    }
    return () => {
      clearInterval(flagInterval);
      if (faceMesh) {
        faceMesh.close();
      }
    };
  }, []);
  useEffect(() => {
    console.log(pd);
  }, [pd]);

  return (
    <div className="relative flex flex-col items-center justify-center h-4/5 w-full lg:w-[800px] lg:h-[600px]">
      {/* <h2>Vladyslav Virtual Glasses Try On </h2> */}
      <div className="relative flex justify-center items-center h-full w-full overflow-hidden rounded-3xl">
        {isLive ? (
          <FaceFilter
            model={selectedModel}
            canvasRef={canvasRef}
            distance={pd}
          />
        ) : (
          <div className="w-full h-full bg-neutral-300 flex justify-center items-center">
            <LiveViewer model={selectedModel} />
          </div>
        )}
      </div>

      <div className="absolute right-2 top-0 h-full">
        <div className="flex flex-col h-full justify-center items-center gap-1 live-view-action-group">
          <div className="bg-black text-white rounded-full p-0.5 flex flex-col gap-1">
            <div
              className={clsx(
                "p-2 rounded-full cursor-pointer relative",
                isLive ? "bg-white text-black" : "bg-none"
              )}
              onClick={() => setIsLive(true)}
            >
              <svg
                data-v-c4e090cd=""
                width="20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path d="M256 464C141.1 464 48 370.9 48 256c0-16.3 1.9-32.2 5.4-47.4l3.9 23.3C61.2 255 81.2 272 104.7 272l78.7 0c23.5 0 43.5-17 47.3-40.1l6.6-39.9 37.3 0 6.6 39.9c3.9 23.1 23.9 40.1 47.3 40.1l78.7 0c23.5 0 43.5-17 47.3-40.1l3.9-23.3c3.6 15.2 5.4 31.1 5.4 47.4c0 114.9-93.1 208-208 208zM227.1 144c-8.7-9.8-21.4-16-35.8-16l-94.7 0c-1.6 0-3.2 .1-4.8 .2C129.9 79.4 189.3 48 256 48s126.1 31.4 164.1 80.2c-1.6-.2-3.2-.2-4.8-.2l-94.7 0c-14.4 0-27.1 6.2-35.8 16l-57.8 0zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM143.7 332.7c-9.7 9-10.4 24.2-1.4 33.9c22 23.8 60 49.4 113.6 49.4s91.7-25.5 113.6-49.4c9-9.7 8.4-24.9-1.4-33.9s-24.9-8.4-33.9 1.4C319.2 350.5 293.2 368 256 368s-63.2-17.5-78.4-33.9c-9-9.7-24.2-10.4-33.9-1.4z"></path>
              </svg>
              {isLive && (
                <div className="absolute right-full mr-3 my-auto top-0 bottom-0 text-nowrap label">
                  Live view
                </div>
              )}
            </div>
            <div
              className={clsx(
                "p-2 rounded-full cursor-pointer relative",
                !isLive ? "bg-white text-black" : "bg-none"
              )}
              onClick={() => setIsLive(false)}
            >
              <svg
                data-v-c4e090cd=""
                width="20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
              >
                <path d="M608 64a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM24 64C10.7 64 0 74.7 0 88s10.7 24 24 24l83.2 0L36 218.7c-4.9 7.4-5.4 16.8-1.2 24.6S47.1 256 56 256l32 0c30.9 0 56 25.1 56 56l0 40c0 26.5-21.5 48-48 48l-1.5 0c-16 0-31-8-39.9-21.4L44 362.7c-7.4-11-22.3-14-33.3-6.7s-14 22.3-6.7 33.3l10.6 15.9C32.5 432 62.4 448 94.5 448l1.5 0c53 0 96-43 96-96l0-40c0-53.3-40-97.2-91.6-103.3L172 101.3c4.9-7.4 5.4-16.8 1.2-24.6S160.9 64 152 64L24 64zm440 80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 224c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-224zM576 368l0-224c0-44.2-35.8-80-80-80s-80 35.8-80 80l0 224c0 44.2 35.8 80 80 80s80-35.8 80-80zM272 160c0-26.5 21.5-48 48-48c13.3 0 24-10.7 24-24s-10.7-24-24-24c-53 0-96 43-96 96l0 128 0 .2 0 79.8c0 44.2 35.8 80 80 80s80-35.8 80-80l0-96c0-44.2-35.8-80-80-80c-11.4 0-22.2 2.4-32 6.7l0-38.7zm32 80c17.7 0 32 14.3 32 32l0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96c0-17.7 14.3-32 32-32z"></path>
              </svg>
              {!isLive && (
                <div className="absolute right-full mr-3 my-auto top-0 bottom-0 text-nowrap label">
                  360° view
                </div>
              )}
            </div>
          </div>
          <div
            className="relative p-2 rounded-full cursor-pointer bg-black text-white mt-2"
            style={{ visibility: isLive ? "visible" : "hidden" }}
            onClick={handleTakePhoto}
          >
            <svg
              fill="currentColor"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path d="M199.1 32c-24.1 0-45.5 15.4-53.1 38.3l22.8 7.6-22.8-7.6L137.4 96H64C28.7 96 0 124.7 0 160V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H374.6l-8.6-25.7C358.4 47.4 337 32 312.9 32H199.1zm-7.6 53.5c1.1-3.3 4.1-5.5 7.6-5.5H312.9c3.4 0 6.5 2.2 7.6 5.5l14 42.1c3.3 9.8 12.4 16.4 22.8 16.4H448c8.8 0 16 7.2 16 16V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V160c0-8.8 7.2-16 16-16h90.7c10.3 0 19.5-6.6 22.8-16.4l14-42.1zM256 400a112 112 0 1 0 0-224 112 112 0 1 0 0 224zM192 288a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"></path>
            </svg>
            <div className="absolute right-full mr-3 my-auto top-0 bottom-0 text-nowrap label">
              Take a picture
            </div>
          </div>
          <div
            className={`relative w-9 h-9 content-center rounded-full cursor-pointer bg-black text-white`}
            onClick={() => setShowPdModal(true)}
            style={{ visibility: isLive ? "visible" : "hidden" }}
          >
            <div>PD</div>
            <div className="absolute right-full mr-3 my-auto top-0 bottom-0 text-nowrap label">
              Pupillary distance
            </div>
          </div>
        </div>
      </div>

      <div className="absolute w-full bottom-0 overflow-x-auto">
        <div className="flex items-center justify-center gap-4 p-4">
          {models.map((model) => (
            <div
              className={clsx(
                "bg-gray-200 h-8 w-12 md:h-[60px] md:w-[100px] cursor-pointer rounded-lg overflow-hidden relative"
              )}
              key={model.id}
              onClick={() => selectModel(model)}
            >
              <img src={model.img} alt={model.name} className="w-full h-full" />
              {selectedModel?.id !== model.id && (
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-black opacity-50" />
              )}
            </div>
          ))}
        </div>
      </div>
      <div
        className={clsx(
          "absolute w-full md:w-1/2 mx-auto bottom-0 left-0 right-0 rounded-t-2xl bg-white",
          { hidden: !downloadLink }
        )}
      >
        <div className="relative">
          <button
            className="absolute h-10 w-10 left-4 top-0 bottom-0 my-auto cursor-pointer flex items-center justify-center rounded-full bg-neutral-300 hover:bg-neutral-400 transition-all duration-300"
            onClick={() => setDownloadLink(undefined)}
          >
            <svg
              width="15"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 512"
              fill="currentColor"
            >
              <path d="M312.1 375c9.369 9.369 9.369 24.57 0 33.94s-24.57 9.369-33.94 0L160 289.9l-119 119c-9.369 9.369-24.57 9.369-33.94 0s-9.369-24.57 0-33.94L126.1 256L7.027 136.1c-9.369-9.369-9.369-24.57 0-33.94s24.57-9.369 33.94 0L160 222.1l119-119c9.369-9.369 24.57-9.369 33.94 0s9.369 24.57 0 33.94L193.9 256L312.1 375z"></path>
            </svg>
          </button>
          <div className="flex justify-center items-center h-[70px] text-3xl font-bold">
            Share
          </div>
        </div>
        {!!downloadLink && (
          <div className="p-4 pt-0">
            <div className="relative">
              <img
                src={downloadLink.href}
                alt="Image"
                className="w-full rounded-lg"
              />
              <button
                className="absolute bottom-4 right-4 rounded-[20px] flex gap-2 px-4 py-2 cursor-pointer text-white bg-neutral-500/50 hover:bg-neutral-700 transition-all duration-300"
                onClick={() => setDownloadLink(undefined)}
              >
                <svg
                  fill="currentColor"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path d="M94 187.1C120.8 124.1 183.3 80 256 80c39.7 0 77.8 15.8 105.9 43.9L414.1 176H360c-13.3 0-24 10.7-24 24s10.7 24 24 24H472c13.3 0 24-10.7 24-24V88c0-13.3-10.7-24-24-24s-24 10.7-24 24v54.1L395.9 89.9C358.8 52.8 308.5 32 256 32C163.4 32 83.9 88.2 49.8 168.3c-5.2 12.2 .5 26.3 12.7 31.5s26.3-.5 31.5-12.7zm368 157c5.2-12.2-.4-26.3-12.6-31.5s-26.3 .4-31.5 12.6C391 388.1 328.6 432 256 432c-39.7 0-77.8-15.8-105.9-43.9L97.9 336H152c13.3 0 24-10.7 24-24s-10.7-24-24-24H40c-13.3 0-24 10.7-24 24V424c0 13.3 10.7 24 24 24s24-10.7 24-24V369.9l52.1 52.1C153.2 459.2 203.5 480 256 480c92.5 0 171.8-56 206-135.9z"></path>
                </svg>
                Retake
              </button>
            </div>
            <div className="mt-4 flex justify-center items-center gap-6">
              <button
                className="flex flex-col items-center"
                onClick={() => downloadLink.click()}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer bg-neutral-300 hover:bg-neutral-400 transition-all duration-300">
                  <svg
                    height="20"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    fill="currentColor"
                    className="flex"
                  >
                    <path d="M360 431.1H24c-13.25 0-24 10.76-24 24.02C0 469.2 10.75 480 24 480h336c13.25 0 24-10.76 24-24.02C384 442.7 373.3 431.1 360 431.1zM302.5 207.7L216 299.7v-243.6C216 42.76 205.3 32 192 32S168 42.76 168 56.02v243.6L81.47 207.7C76.75 202.6 70.38 200.1 64 200.1c-5.906 0-11.81 2.158-16.44 6.536c-9.656 9.069-10.12 24.27-1.031 33.93l128 136.1c9.062 9.694 25.88 9.694 34.94 0l128-136.1c9.094-9.663 8.625-24.86-1.031-33.93C326.8 197.5 311.6 197.1 302.5 207.7z"></path>
                  </svg>
                </div>
                <div className="text-xs mt-2">Download</div>
              </button>
            </div>
          </div>
        )}
      </div>
      <video className="hidden" ref={videoRef} playsInline />
      <PdModal
        openModal={showPdModal}
        pd={pd}
        setOpenModal={setShowPdModal}
        setPd={setPd}
      />
    </div>
  );
}

export default App;
