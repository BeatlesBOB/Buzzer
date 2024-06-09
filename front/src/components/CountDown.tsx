import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface CountdownCircleProps {
  duration: number;
}

const CountdownCircle: React.FC<CountdownCircleProps> = ({ duration }) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (intervalRef.current !== null) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, duration);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (timeLeft / duration) * circumference;

  return (
    <div className="flex justify-center items-center h-screen relative">
      <svg className="w-40 h-40">
        <circle
          className="text-gray-300"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
        />
        <motion.circle
          className="text-blue-500"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      </svg>
      <div className="absolute text-3xl">{timeLeft}s</div>
    </div>
  );
};

export default CountdownCircle;
