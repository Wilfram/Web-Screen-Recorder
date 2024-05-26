document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton");
  const modal = document.createElement("div");
  const configButton = document.getElementById("configButton");
  const configModal = document.getElementById("configModal");
  const closeBtn = document.getElementsByClassName("close")[0];
  const saveConfigButton = document.getElementById("saveConfig");
  const cancelConfigButton = document.getElementById("cancelConfig");
  const recordedVideo = document.createElement("video");
  recordedVideo.id = "recordedVideo";
  recordedVideo.controls = true;
  recordedVideo.style.display = "none";
  recordedVideo.style.width = "100%";
  recordedVideo.style.maxWidth = "640px";
  document.body.appendChild(recordedVideo);

  let mediaRecorder;
  let isPaused = false;

  let frames = 30;
  let width = 1280;
  let height = 720;
  let tasa = 128000;
  let frequency = 44100;
  let canal = 2;
  let eco = true;
  let supresion = true;
  let ganancia = true;
  let relacion = { ideal: 16 / 9 };
  let resize = "none";

  startButton.addEventListener("click", async () => {
    modal.classList.add("modal-grabacion");
    modal.innerHTML = `
        <button id="pauseResumeButton" onclick="pauseResume()"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M9 7C9 6.44772 8.55228 6 8 6C7.44772 6 7 6.44772 7 7V17C7 17.5523 7.44772 18 8 18C8.55228 18 9 17.5523 9 17V7ZM17 7C17 6.44772 16.5523 6 16 6C15.4477 6 15 6.44772 15 7V17C15 17.5523 15.4477 18 16 18C16.5523 18 17 17.5523 17 17V7Z" fill="#5b95cb"></path> </g></svg> Pausar</button>
        <button onclick="stop()">⯀ Detener</button>
      `;
    document.body.appendChild(modal);

    let media, audioVideo;
    try {
      media = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: frames },
          width: { ideal: width },
          height: { ideal: height },
          aspectRatio: relacion,
          resizeMode: { ideal: resize },
        },
      });

      audioVideo = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: frequency,
          channelCount: canal,
          bitrate: tasa,
          echoCancellation: { ideal: eco }, // Cancelación de eco
          noiseSuppression: { ideal: supresion }, // Supresión de ruido
          autoGainControl: { ideal: ganancia }, // Control automático de ganancia
          latency: { ideal: 0.01 }, // En segundos
        },
      });

      const combinedStream = new MediaStream([
        ...media.getTracks(),
        ...(audioVideo ? audioVideo.getTracks() : []), // Agregar audio solo si está disponible
      ]);

      mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp8,opus",
      });

      mediaRecorder.start();

      const [video] = media.getVideoTracks();
      video.addEventListener("ended", () => {
        mediaRecorder.stop();
      });

      let recordedChunks = [];
      mediaRecorder.addEventListener("dataavailable", (e) => {
        recordedChunks.push(e.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const name = document.getElementById("nombre").value;
        recordedVideo.src = url;
        recordedVideo.style.display = "block";

        const link = document.createElement("a");
        link.href = url;
        link.download = `${name !== "" ? name : "captura"}.webm`;
        link.click();
        document.body.removeChild(modal);
      });
    } catch (error) {
      document.body.removeChild(modal);
    }
  });

  window.pauseResume = () => {
    const pauseResumeButton = document.getElementById("pauseResumeButton");
    if (!isPaused) {
      mediaRecorder.pause();
      pauseResumeButton.textContent = "► Reanudar";
      isPaused = true;
    } else {
      mediaRecorder.resume();
      pauseResumeButton.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M9 7C9 6.44772 8.55228 6 8 6C7.44772 6 7 6.44772 7 7V17C7 17.5523 7.44772 18 8 18C8.55228 18 9 17.5523 9 17V7ZM17 7C17 6.44772 16.5523 6 16 6C15.4477 6 15 6.44772 15 7V17C15 17.5523 15.4477 18 16 18C16.5523 18 17 17.5523 17 17V7Z" fill="#5b95cb"></path> </g></svg> Pausar';
      isPaused = false;
    }
  };

  window.stop = () => {
    mediaRecorder.stop();
    stopMediaTracks(combinedStream);
  };

  const stopMediaTracks = (stream) => {
    stream.getTracks().forEach((track) => track.stop());
  };

  configButton.addEventListener("click", () => {
    configModal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    configModal.style.display = "none";
  });

  cancelConfigButton.addEventListener("click", () => {
    configModal.style.display = "none";
  });

  saveConfigButton.addEventListener("click", () => {
    const videoQuality = document.getElementById("videoQuality").value;
    const selectFrames = document.getElementById("frames").value;
    const selectFrecuncy = document.getElementById("frecuencia").value;
    const selectCanal = document.getElementById("canal").value;
    const selectTasa = document.getElementById("tasa").value;
    const resizeMode = document.getElementById("resizeMode").value;
    const aspectRatio = document.getElementById("aspectRatio").value;
    const echoCancellation = document.getElementById("echoCancellation").value;
    const autoGainControl = document.getElementById("autoGainControl").value;
    const noiseSuppression = document.getElementById("noiseSuppression").value;

    // Configurar la calidad de video
    if (videoQuality === "low") {
      width = 640;
      height = 360;
    } else if (videoQuality === "medium") {
      width = 1280;
      height = 720;
    } else if (videoQuality === "high") {
      width = 1920;
      height = 1080;
    } else {
      width = 3840;
      height = 2160;
    }

    if (aspectRatio === "16/9") {
      relacion = { ideal: 16 / 9 };
    } else if (aspectRatio === "4/3") {
      relacion = { ideal: 4 / 3 };
    } else {
      relacion = { ideal: 1 };
    }

    if (echoCancellation === "activo") {
      eco = true;
    } else {
      eco = false;
    }

    if (autoGainControl === "activo") {
      ganancia = true;
    } else {
      ganancia = false;
    }

    if (noiseSuppression === "activo") {
      supresion = true;
    } else {
      supresion = false;
    }

    resize = resizeMode;
    tasa = selectTasa;
    frequency = selectFrecuncy;
    canal = selectCanal;

    // Configurar los FPS
    frames = selectFrames;

    configModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === configModal) {
      configModal.style.display = "none";
    }
  });
});
