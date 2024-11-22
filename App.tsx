import { Button, StyleSheet, View } from 'react-native';
import { Configuration, ForceTrimMode, VESDK, VideoCodec } from 'react-native-videoeditorsdk';
import React, {useRef, useState, useCallback, useEffect} from 'react';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as FileSystem from 'expo-file-system';

const getVESDKConfig = (): Configuration => {
  const options: Configuration = {
    composition: {
      personalVideoClips: true,
    },
    trim: {
      maximumDuration: 120.0,
      forceMode: ForceTrimMode.IF_NEEDED,
    },
    export: {

      video: {
        codec: VideoCodec.HEVC,
        quality: 0.8,
      },
      filename:
        FileSystem.cacheDirectory + `export${new Date().getTime()}`,
    },
  };

  return options;
};

export default function App() {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const [recording, setRecording] = useState(false);

  const onPress = useCallback(() => {
    if (!recording) {
      setRecording(true);
      cameraRef.current?.startRecording({
        onRecordingFinished: async (video) => {
          setRecording(false);
          // do less than 120 seconds
          console.log('Video duration:', video.duration);
          console.log('Video path:', video.path);
          try {
            const videoClips = [
              {
                identifier: 0,
                videoURI: video?.path,
              }
            ]
            const vesdkConfig = getVESDKConfig();

            // Open the video editor with the recorded video and just export it with no modifications
            const result = await VESDK.openEditor(
              videoClips,
              vesdkConfig
            );

            // a new video was created even if there was no changes
            console.log('result video open editor:', result.video); 
          } catch (error) {
            console.log('Error:', error);
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

  if (!hasPermission || !device) return <View />;

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
          backgroundColor: recording ? 'red' : 'blue',
          position: 'absolute',
          bottom: 50,
          width: 500,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button title={recording ? 'Stop Recording' : 'Start Recording'} onPress={onPress} />


      </View>
    </>
  );
}