"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import React, { useMemo, useState, useEffect } from "react";
import { Prompt } from "@/components/Prompt";
import { MultiSectionVideo } from "../remotion/MyComp/MultiSectionVideo";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import NonFamous from "../components/NonFamous";

import {
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  defaultMyCompProps,
} from "../types/constants";
import { RenderControls } from "../components/RenderControls";
import { Spacing } from "../components/Spacing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Home: NextPage = () => {
  const [text, setText] = useState<string>(defaultMyCompProps.title);
  const [audioUrls, setAudioUrls] = useState<string[]>(defaultMyCompProps.audioUrls);
  const [imageSections, setImageSections] = useState<string[][]>(defaultMyCompProps.imageSections);
  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  const [totalDuration, setTotalDuration] = useState<number>(defaultMyCompProps.durationInFrames);
  const [activeTab, setActiveTab] = useState<string>("prompt");

  const inputProps = useMemo(() => ({
    audioUrls,
    imageSections,
    titles: imageSections.map((_, index) => `Section ${index + 1}`),
    title: text,
    durationInFrames: totalDuration || 1,
  }), [text, audioUrls, imageSections, totalDuration]);

  useEffect(() => {
    const calculateTotalDuration = async () => {
      let duration = 0;
      try {
        for (const audioUrl of audioUrls) {
          const audioDuration = await getAudioDurationInSeconds(audioUrl);
          duration += Math.max(1, Math.round(audioDuration * VIDEO_FPS));
        }
        setTotalDuration(duration);
        console.log("total duration", duration);
      } catch (error) {
        console.error("Error calculating duration:", error);
      }
    };

    if (audioUrls.length > 0) {
      calculateTotalDuration();
    }
  }, [audioUrls]);

  const handleScriptGenerated = (
    generatedScript: string,
    newAudioUrls: string[],
    newImageSections: string[][]
  ) => {
    setText(generatedScript);
    setAudioUrls(newAudioUrls);
    setImageSections(newImageSections);
  };

  useEffect(() => {
    setIsDataReady(audioUrls.length > 0 && imageSections.length > 0 && totalDuration > 0);
  }, [audioUrls, imageSections, totalDuration]);

  return (
    <div className="max-w-screen-md m-auto mb-5">

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4 mt-10 text-black">
          <TabsTrigger value="prompt">Famous Person</TabsTrigger>
          <TabsTrigger value="nonfamous">Custom</TabsTrigger>
        </TabsList>
        <TabsContent value="prompt">
          <Prompt onScriptGenerated={handleScriptGenerated} />

          {isDataReady &&(
            <div className="mt-8">
              <Player
                component={MultiSectionVideo}
                inputProps={inputProps}
                durationInFrames={totalDuration}
                fps={VIDEO_FPS}
                compositionHeight={VIDEO_HEIGHT}
                compositionWidth={VIDEO_WIDTH}
                style={{
                  width: "100%",
                }}
                controls
                autoPlay
                loop
              />
              <RenderControls
              text={text}
              setText={setText}
              inputProps={inputProps}
                        />
            </div>)
          }
          <Spacing />
        </TabsContent>
        <TabsContent value="nonfamous">
          <NonFamous />
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default Home;