
"use client"

import { useState, useEffect, useRef, useCallback } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

interface UseScrambleTextOptions {
  text: string;
  scrambleSpeed?: number;
  revealSpeed?: number;
  onFinished?: () => void;
}

export const useScrambleText = ({
  text,
  scrambleSpeed = 30,
  revealSpeed = 70,
  onFinished,
}: UseScrambleTextOptions) => {
  const [currentText, setCurrentText] = useState(text.replace(/./g, ' '));
  const intervalRef = useRef<any>();
  const timeoutRef = useRef<any>();
  const onFinishedRef = useRef(onFinished);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  const scramble = useCallback(() => {
    let revealIndex = 0;

    const stop = () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
      setCurrentText(text);
      if (onFinishedRef.current) {
        onFinishedRef.current();
      }
    };

    const reveal = () => {
      revealIndex++;
      if (revealIndex > text.length) {
        stop();
        return;
      }
      timeoutRef.current = setTimeout(reveal, revealSpeed);
    };

    intervalRef.current = setInterval(() => {
      let scrambled = '';
      for (let i = 0; i < text.length; i++) {
        if (i < revealIndex) {
          scrambled += text[i];
        } else {
          const randomIndex = Math.floor(Math.random() * CHARS.length);
          scrambled += CHARS[randomIndex];
        }
      }
      setCurrentText(scrambled);
    }, scrambleSpeed);

    reveal();

    return stop;
  }, [text, scrambleSpeed, revealSpeed]);

  useEffect(() => {
    const stop = scramble();
    return stop;
  }, [scramble]);

  return currentText;
};
