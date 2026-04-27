import React from "react";
import "./circularProgress.module.scss";

interface CircularProgressProps {
    size?: number;
    thickness?: number;
    color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
    size = 40,
    thickness = 3.6,
    color = "#1976d2"
}) => {
    const circumference = 2 * Math.PI * ((44 - thickness) / 2);

    return (
        <div
            className="circular-progress"
            style={{
                width: size,
                height: size
            }}
        >
            <svg viewBox="22 22 44 44">
                <circle
                    className="circular-progress-circle"
                    cx="44"
                    cy="44"
                    r={(44 - thickness) / 2}
                    fill="none"
                    strokeWidth={thickness}
                    style={{
                        stroke: color,
                        strokeDasharray: `${circumference * 0.8}, ${circumference}`,
                    }}
                />
            </svg>
        </div>
    );
};

export default CircularProgress;
