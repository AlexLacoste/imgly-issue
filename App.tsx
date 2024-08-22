import { Button, StyleSheet, View } from 'react-native';
import { Configuration, ForceTrimMode, SerializationExportType, VESDK } from 'react-native-videoeditorsdk';
import React, {useRef, useState, useCallback, useEffect} from 'react';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as FileSystem from 'expo-file-system';


const getVESDKCongif =  (): Configuration => {
  const options: Configuration = {
    composition: {
      personalVideoClips: true,
    },
    trim: {
      maximumDuration: 120.0,
      forceMode: ForceTrimMode.IF_NEEDED,
    },
    export: {
      serialization: {
        enabled: true,
        exportType: SerializationExportType.OBJECT,
      },
      video: {
        segments: true,
      },
      filename: FileSystem.cacheDirectory +
      `export${new Date().getTime()}`,
    },
  };

  return options;
};


export default function App() {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const [recording, setRecording] = useState(false);
  const [segments, setSegments] = useState(null);
  const [serialization, setSerialization] = useState(undefined);

  const openAgainEditor = useCallback(async () => {
    const vesdkConfig =  getVESDKCongif();

    // Since the 2nd segment is deleted, we are unable to open the editor again
    await VESDK.openEditor(segments, vesdkConfig, serialization);
  }, [serialization, segments]);

  const onPress = useCallback(() => {
    if (!recording) {
      setRecording(true);
      cameraRef.current?.startRecording({
        onRecordingFinished: async (video) => {
          const videos = [video];
          setRecording(false);
          try {
            if (!Array.isArray(videos))
              throw new Error("ERROR: videos should be an array");
            if (!videos?.length)
              throw new Error(
                "ERROR: videos array should not be empty"
              );
            const videoClips = videos.map(
              (video: any, index: number) => {
                return {
                  identifier: index.toString(),
                  videoURI: video?.sourceURL ?? video?.path,
                };
              }
            );
            const vesdkConfig =  getVESDKCongif();


            // Open the video editor with a record, after in the editor add a new video from your gallery and export the video, we should get 2 segments

            const result = await VESDK.openEditor(
              videoClips,
              vesdkConfig
            );

            if (result) {
              // The 2 segment's uri is already inexistent or deleted
              console.log("segments", result?.segments);
              setSegments( result?.segments);
              setSerialization(result?.serialization);

              const is2ndSegmentAvailable = await FileSystem.getInfoAsync(
                // @ts-ignore
                result.segments[1].videoURI.toString()
              );
              // The second segment doesn't exist
              console.log("second segment info", is2ndSegmentAvailable);
            }
          } catch (error) {
            console.log('error',error);
          }
        },
        onRecordingError: (error) => console.error(error),
      });
    } else {
      cameraRef.current?.stopRecording();
    }
  }, [recording]);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  if (!hasPermission || !device) return <View/>;

  return (
    <>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        video
      />
      <View
        style={{
          backgroundColor: recording ? "red" : "blue",
          position: "absolute",
          bottom: 50,
          width: 500,
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          title="record"
          onPress={onPress}
        />

        {segments && serialization && (
          <Button title="open again editor" onPress={openAgainEditor} />
        )}
      </View>
    </>
  );
}

