import React, { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import StockImage from '../assets/bg.jpg'; 

// Author: Pranav Pawar
// Description: aniamtion for landingpage

// Function to generate zigzag points ensuring one line reaches the top-right corner
const generateZigzagPoints = () => {
  const points = [];
  let x = 0;
  let y = 200; // Start at (x=0, y=200)
  const maxX = 300; // Width of the div
  const maxY = 200; // Height of the div
  let goingUp = true; // Toggle for zigzag direction

  // Start point
  points.push({ x, y });

  // Create zigzag points
  while (x < maxX) {
    x += Math.random() * 30 + 20; 

    if (goingUp) {
      y -= Math.random() * 30 + 50; 
      if (y < 0) y = 0; 
    } else {
      y += Math.random() * 40 + 20; 
      if (y > maxY) y = maxY; 
    }

    goingUp = !goingUp; 
    points.push({ x, y });
  }

  return points;
};

const LandingAnimation = ({ onAnimationEnd }: { onAnimationEnd: () => void }) => {
  const [pointsSet] = useState(() => [
    generateZigzagPoints(),
    generateZigzagPoints(),
    generateZigzagPoints(),
  ]);

  const gradients = [
    { id: "gradient1", start: "#ff5722", end: "#ffc107" },
    { id: "gradient2", start: "#2196f3", end: "#00e5ff" },
    { id: "gradient3", start: "#8e24aa", end: "#e040fb" },
  ];

  // Line drawing animation
  const lineProps = useSpring({
    from: { strokeDashoffset: 500 },
    to: { strokeDashoffset: 0 },
    config: { duration: 1600 },
    onRest: onAnimationEnd,
  });

  // Floating effect for the div
  const floatProps = useSpring({
    from: { transform: "translateY(0px)" },
    to: [{ transform: "translateY(-10px)" }, { transform: "translateY(0px)" }],
    config: { duration: 1500 },
    loop: true,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        position: "relative", // For absolute positioning of the floating elements
        overflow: "hidden", // Prevent scrolling
      }}
    >
      {/* Background Wrapper with Blur */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${StockImage})`, // Set the background image
          backgroundSize: "cover", // Stretch the image to cover the entire screen
          backgroundPosition: "center", // Center the background image
          backgroundAttachment: "fixed", // Optional: Keeps the background fixed when scrolling
          filter: "blur(5px)", // Apply blur effect to the background image
          opacity: 0.7, // Make the background semi-transparent
          zIndex: 0, // Ensure the background is at the bottom
        }}
      />

      {/* Overlay with transparency on top of the blurred background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black overlay
          zIndex: 0, // Ensure it sits below the title and content
        }}
      />

      {/* Landing Title */}
      <h1
        style={{
          color: "white",
          marginBottom: "20px",
          zIndex: 1, // Ensure the title appears above the background image
        }}
      >
        Welcome to Profolio
      </h1>

      {/* Animated Container with Black Transparent Background and Blurred Borders */}
      <animated.div
        style={{
          ...floatProps,
          width: "550px",
          height: "350px",
          background: "rgba(0, 0, 0, 0.5)", // Transparent black background
          position: "relative",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
          zIndex: 1, // Ensure this is above the background
        }}
      >
        {/* Pseudo-element for blurred borders */}
        <style>
          {`
            .graph-container::before {
              content: '';
              position: absolute;
              top: -10px;
              left: -10px;
              right: -10px;
              bottom: -10px;
              background: rgba(0, 0, 0, 0.3); // Transparent border effect
              filter: blur(10px);
              z-index: -1; // Make sure it's behind the content
              border-radius: 15px; // Match the border-radius of the main div
            }
          `}
        </style>

        <svg
          viewBox="0 0 300 200"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <defs>
            {gradients.map((gradient) => (
              <linearGradient
                key={gradient.id}
                id={gradient.id}
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor={gradient.start} />
                <stop offset="100%" stopColor={gradient.end} />
              </linearGradient>
            ))}
          </defs>

          {/* Render multiple zigzag lines with separate colors */}
          {pointsSet.map((points, index) => (
            <animated.polyline
              key={index}
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={`url(#${gradients[index % gradients.length].id})`}
              strokeWidth="2"
              strokeDasharray="500"
              strokeDashoffset={lineProps.strokeDashoffset}
              style={{
                filter: `drop-shadow(0px 0px 5px ${gradients[index % gradients.length].start})`,
              }}
            />
          ))}
        </svg>
      </animated.div>

      <p
        style={{
          color: "gray",
          marginTop: "20px",
          zIndex: 1, // Ensure the text is above the background
        }}
      >
        A seamless stock portfolio experience.
      </p>
    </div>
  );
};

export default LandingAnimation;
