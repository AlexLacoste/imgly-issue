Try it on a real **IOS device**. Not with a simulator, because since it uses the same storage space as a Mac, there's no problem with a simulator.

Record a video, stop recording, this will open the editor. In the editor, select video at bottom left, click on '+' to add a video from your gallery. Save and export the video.

Click on 'open editor again', you won't be able to do this again. If you check the logs in the terminal, you'll see that the 2nd video in the segment has a videoURI tmp. If we try to access this videoURI with expo-file-system, it tells us `{“exists”: false, “isDirectory”: false}`.

Videos added directly in the editor should be accessible in segments.

Translated with DeepL.com (free version)

Demo:



https://github.com/user-attachments/assets/c90eb470-e38b-4905-ab65-0ae3d539b2b6

