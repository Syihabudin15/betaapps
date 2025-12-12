"use client";
import * as faceapi from "face-api.js";

// Inisiasi
export async function initializeFaceApi() {
  const MODEL_URL = "/models";
  console.log("Start loaded models");
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  ]);
  console.log("Models loaded successfully");
}

// Ekstrak face descriptor dari gambar
export async function extractFaceDescriptor(image: HTMLImageElement) {
  const detections = await faceapi
    .detectSingleFace(
      image,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416 })
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detections) {
    throw new Error("No face detected");
  }

  return detections.descriptor;
}

// Bandingkan dua face descriptor
export function compareFaces(
  descriptor1: Float32Array,
  descriptor2: Float32Array,
  distanceThreshold = 0.6
) {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  return distance < distanceThreshold;
}
