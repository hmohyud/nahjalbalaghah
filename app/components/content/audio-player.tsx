'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

interface AudioPlayerProps {
    tracks?: {
        arabic?: string;
        english?: string;
    };
}

export default function AudioPlayer({ tracks }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [selectedTrack, setSelectedTrack] = useState<'arabic' | 'english'>(() => tracks?.arabic ? 'arabic' : 'english');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentUrl = selectedTrack === 'arabic' ? tracks?.arabic : tracks?.english;

    useEffect(() => {
        if (tracks?.arabic) setSelectedTrack('arabic');
        else if (tracks?.english) setSelectedTrack('english');
    }, [tracks?.arabic, tracks?.english]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
        }
    }, [currentUrl]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => console.error("Audio playback failed:", err));
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        const newMutedState = !isMuted;
        audioRef.current.muted = newMutedState;
        setIsMuted(newMutedState);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!tracks?.arabic && !tracks?.english) return null;

    return (
        <div className="audio-player">
            {(tracks?.arabic || tracks?.english) && (
                <div className="audio-player__tracks">
                    <span className="audio-player__label">Listen</span>
                    {tracks?.arabic && (
                        <button
                            onClick={() => setSelectedTrack('arabic')}
                            className={`audio-player__track ${selectedTrack === 'arabic' ? 'audio-player__track--active' : ''}`}
                        >
                            Arabic
                        </button>
                    )}
                    {tracks?.english && (
                        <button
                            onClick={() => setSelectedTrack('english')}
                            className={`audio-player__track ${selectedTrack === 'english' ? 'audio-player__track--active' : ''}`}
                        >
                            English
                        </button>
                    )}
                </div>
            )}
            <div className="audio-player__row">
                <audio
                    ref={audioRef}
                    src={currentUrl || ''}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                />
                <div className="audio-player__controls">
                    <button
                        onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 10; }}
                        className="audio-player__icon-btn"
                        aria-label="Back 10 seconds"
                    >
                        <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                        onClick={togglePlay}
                        className="audio-player__play"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                        ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                    </button>
                    <button
                        onClick={() => { if (audioRef.current) audioRef.current.currentTime += 10; }}
                        className="audio-player__icon-btn"
                        aria-label="Forward 10 seconds"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>
                </div>
                <div className="audio-player__timeline">
                    <div className="audio-player__times">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                    <div
                        className="audio-player__progress"
                        onClick={(e) => {
                            if (!audioRef.current || duration === 0) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const clickedValue = (x / rect.width) * duration;
                            audioRef.current.currentTime = clickedValue;
                            setCurrentTime(clickedValue);
                        }}
                    >
                        <div
                            className="audio-player__progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
                <button
                    onClick={toggleMute}
                    className="audio-player__icon-btn"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                    ) : (
                        <Volume2 className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
}
