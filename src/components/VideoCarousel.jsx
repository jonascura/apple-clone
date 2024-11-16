import gsap from "gsap";
import React, { useRef, useState, useEffect } from 'react';
import { hightlightsSlides } from '../constants';
import { ScrollTrigger } from "gsap/all";
import { useGSAP } from '@gsap/react';
import { pauseImg, playImg, replayImg } from "../utils";

gsap.registerPlugin(ScrollTrigger);

const VideoCarousel = () => {

  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);
  const [loadedData, setLoadedData] = useState([]);

  // video state
  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  // destructure video item
  const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

  useGSAP(() => {
    // video animaton when in view
    gsap.to("#video", {
      scrollTrigger: {
        trigger: "#video",
        toggleActions: "restart none none none", // needs to be changed when adding video click function 
      },
      onComplete: () => {
        setVideo((pre) => ({
          ...pre,
          startPlay: true,
          isPlaying: true,
        }));
      }
    });

    // next video slider animation
    gsap.to("#slider", {
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: "power2.inOut", // show visualizer https://gsap.com/docs/v3/Eases
    });

  }, [isEnd, videoId])

  // handle video play
  useEffect (() => {
    if (loadedData.length > 3) {
      // if not playing
      if(!isPlaying) {
        videoRef.current[videoId].pause();
      } else {
        startPlay && videoRef.current[videoId].play();
      }
    }
  }, [startPlay, videoId, isPlaying, loadedData])

  // handle slide tracker
  useEffect (() => {
    let currentProgress = 0;
    let span = videoSpanRef.current;

    if (span[videoId]) {
      // animate progress of video (slider and dots)
      
      let animation = gsap.to(span[videoId], {
        onUpdate: () => {
          // get video progress
          const progress = Math.ceil(animation.progress() * 100);

          if (progress !== currentProgress) {
            currentProgress = progress;

            // set width of progress bar
            gsap.to(videoDivRef.current[videoId], {
              width:
                window.innerwidth < 760
                ? "10vw" // mobile
                : window.innerWidth < 1200
                ? "10vw" // tablet
                : "4vw", // laptop
            });
  
            // set bg color on video progress bar
            gsap.to(span[videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          };

        },

        // minimize prgress bar on video end
        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoDivRef.current[videoId], {
              width:"8px",
            });

            gsap.to(span[videoId], {
              backgroundColor: "#afafaf"
            });
          }
        }
      });

      if (videoId == 0) {
        animation.restart();
      }

      // update progress bar to real video duration
      const animationUpdate = () => {
        animation.progress(videoRef.current[videoId].currentTime / hightlightsSlides[videoId].videoDuration);
      }

      if (isPlaying) {
        // ticker to update progress bar
        gsap.ticker.add(animationUpdate);
      } else {
        // remove ticker when video paused
        gsap.ticker.remove(animationUpdate);
      }
    }

  }, [videoId, startPlay])


  const handleProcess = (type, i) => {
    switch (type) {
      // auto play next video
      case "video-end":
        setVideo((pre) => ({ ...pre, isEnd: true, videoId: i + 1 }));
        break;
      
      // set last video in carousel
      case "video-last":
        setVideo((pre) => ({ ...pre, isLastVideo: true }));
        break;

      // replay button clicked
      case "video-reset":
        setVideo((pre) => ({ ...pre, videoId: 0, isLastVideo: false }));
        break;

      // pause button clicked
      case "pause":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;

      // play button clicked
      case "play":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;

      // specific video clicked
      case "video-clicked":
        // reset all videos
        // set clicked index to current index
        // animate all slider dots to full intil it reaches index clicked
        break;

      default:
        return video;
    }
  };
  
  // set state for video play
  const handleLoadedMetaData = (i, e) => setLoadedData((pre) => [...pre, e]);

  return (
    <>
      <div className='flex items-center'>
        {hightlightsSlides.map((list, i) => (
          <div key={list.id} id="slider" className="sm:pr-6 pr-6">
            <div className='video-carousel_container'>
              <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                <video
                   id="video"
                   className={`${list.id === 2 && "translate-x-44"} pointer-evetns-none`}
                   playsInline={true}
                   preload='auto'
                   muted
                   ref={(element) => (videoRef.current[i] = element)}
                   onPlay={() => {
                    setVideo((prevVideo) => ({...prevVideo, isPlaying:true}))
                   }}
                   onLoadedMetadata={(e) => handleLoadedMetaData(i, e)}
                   onEnded={() => i !== 3 ? handleProcess("video-end", i) : handleProcess("video-last")}
                >
                  <source src={list.video} type="video/mp4" />
                </video>
              </div>

              <div className="absolute top-12 left-[5%] z-10">
                {list.textLists.map((text, i) => (
                  <p key={i} className="md:text-2xl text-xl font-medium">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='relative flex-center mt-10'>
        {/* play pause */}
        <button className="control-btn">
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
            onClick={
              isLastVideo
                ? () => handleProcess("video-reset")
                : !isPlaying
                ? () => handleProcess("play")
                : () => handleProcess("pause")
            }
          />
        </button>
        {/* exterior pill */}
        <div className="flex-center py-6 px-7 bg-gray-300 backdrop-blur rounded-full">
          {videoRef.current.map((_, i) => (
            // video slider dots
            <span key={i} className="mx-2 w-2 h-2 bg-gray-200 rounded-full relative cursor-pointer" ref={(el) => (videoDivRef.current[i] = el)}>
              <span className='absolute h-full w-full rounded-full' ref={(el) => (videoSpanRef.current[i] = el)}/>
            </span>
          ))}
        </div>
      </div>
    </>
  )
}

export default VideoCarousel