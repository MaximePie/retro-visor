import {useCallback, useEffect, useRef, useState} from "react";
import { rouletteChoices as data} from "../roulette.ts";
import {useSocket} from "../contexts/socket.tsx";

/**
 * 6 choices : 60 deg each
 * Start at 0 deg
 * Turns for a random amount of time between 1 and 5 seconds
 * Then stops on a random choice
 * The current degree determines the choice
 */

/**
 * Has all the logic for the roulette
 */
export function useRoulette() {
  const { currentSpinner, receivedDuration } = useSocket();

  const interval = 0;
  const timeout = 0;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  /** In degrees */
  const [currentRouletteRotation, setCurrentRouletteRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const currentRouletteRotationRef = useRef(currentRouletteRotation);
  const intervalRef = useRef(interval);
  const timeoutRef = useRef(timeout);

  // Update the rotation ref when the rotation changes
  useEffect(() => {
    currentRouletteRotationRef.current = currentRouletteRotation;
  }, [currentRouletteRotation]);

  // Each time the current Spinner changes, spin
  useEffect(() => {
    if (receivedDuration) {
      spin(receivedDuration ?? Math.floor(Math.random() * 4000) + 1000);
    }
  }, [currentSpinner, receivedDuration]);

  const spin = useCallback((duration: number) => {
    let remainingTime = duration;
    const intervalValue = 10;

    setIsSpinning(true)

    // Start spinning
    intervalRef.current = setInterval(() => {
      const newRotation = currentRouletteRotationRef.current + (remainingTime/200);
      remainingTime -= intervalValue;
      setCurrentRouletteRotation(newRotation);
    }, intervalValue);

    // Stop spinning after a random amount of time
    timeoutRef.current = setTimeout(() => {
      // Clear interval
      clearInterval(intervalRef.current);
      intervalRef.current = 0;

      // Reset rotation
      setCurrentRouletteRotation(0);

      // Check which option is selected based on the current rotation
      const selectedOptionIndex = calculateSelectedOption(currentRouletteRotationRef.current);
      const selectedOption = data[selectedOptionIndex].option;
      setSelectedOption(selectedOption);

      setIsSpinning(false)
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    selectedOption,
    rotation: currentRouletteRotationRef.current,
    isSpinning,
  }
  /**
   * Calculates the selected option based on the current rotation
   * stop : 331 deg 0, 1 to 30 deg
   * start: 31 deg to 90 deg
   * libre: 91 deg to 150 deg
   * continue: 151 deg to 210 deg
   * change: 211 deg to 270 deg
   * libre: 271 deg to 330 deg
   * @param rotation
   * @returns {string}
   */
  function calculateSelectedOption(rotation: number) {
    const stop = 331;
    const start = 31;
    const libre = 91;
    const continue_ = 151;
    const change = 211;
    const libre2 = 271;

    const rotationModulo = rotation % 360;
    if (rotationModulo <= start || rotationModulo > stop) {
      return 0;
    }
    if (rotationModulo <= libre) {
      return 1;
    }
    if (rotationModulo <= continue_) {
      return 2;
    }
    if (rotationModulo <= change) {
      return 3;
    }
    if (rotationModulo <= libre2) {
      return 4;
    }
    return 5;
  }
}
