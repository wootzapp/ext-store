import React from "react";

const TaskStatus = ({ status }) => {
  if (!status) return null;

  const getStatusColor = (statusType) => {
    switch (statusType) {
      case "planning":
        return "#ffad1f";
      case "executing":
        return "#1da1f2";
      case "validating":
        return "#17bf63";
      case "completed":
        return "#17bf63";
      case "error":
        return "#e0245e";
      case "failed":
        return "#e0245e";
      case "cancelled":
        return "#657786";
      default:
        return "#657786";
    }
  };

  const getStatusIcon = (statusType) => {
    switch (statusType) {
      case "planning":
        return "🤔";
      case "executing":
        return "⚡";
      case "validating":
        return "✅";
      case "completed":
        return "🎉";
      case "error":
        return "❌";
      case "failed":
        return "⚠️";
      case "cancelled":
        return "🛑";
      default:
        return "⏳";
    }
  };

  const getStatusMessage = (statusType) => {
    switch (statusType) {
      case "planning":
        return "Analyzing your request...";
      case "executing":
        return "Your task is being executed by AI agent";
      case "validating":
        return "Verifying task completion...";
      case "completed":
        return "Task completed successfully!";
      case "error":
        return "An error occurred during execution";
      case "failed":
        return "Task execution failed";
      case "cancelled":
        return "Task was cancelled";
      default:
        return "Processing your request...";
    }
  };

  return (
    <div
      style={{
        padding: "8px 16px",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #e1e8ed",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexShrink: 0,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: getStatusColor(status.status),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          flexShrink: 0,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          animation: status.status === "executing" ? "taskStatusPulse 2s infinite" : "none",
        }}
      >
        {status.status === "executing" ? (
          <div
            className="loader"
            style={{
              width: "14px",
              height: "14px",
              aspectRatio: "1",
              display: "grid",
              color: "#ffffff",
              background:
                "radial-gradient(farthest-side, currentColor calc(100% - 2px), #0000 calc(100% - 1px) 0)",
              WebkitMask:
                "radial-gradient(farthest-side, #0000 calc(100% - 4px), #000 calc(100% - 3px))",
              mask: "radial-gradient(farthest-side, #0000 calc(100% - 4px), #000 calc(100% - 3px))",
              borderRadius: "50%",
              animation: "l19 2s infinite linear",
            }}
          >
            <div
              style={{
                content: '""',
                gridArea: "1/1",
                background: `
                 linear-gradient(currentColor 0 0) center,
                 linear-gradient(currentColor 0 0) center
               `,
                backgroundSize: "100% 2px, 2px 100%",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div
              style={{
                content: '""',
                gridArea: "1/1",
                background: `
                 linear-gradient(currentColor 0 0) center,
                 linear-gradient(currentColor 0 0) center
               `,
                backgroundSize: "100% 2px, 2px 100%",
                backgroundRepeat: "no-repeat",
                transform: "rotate(45deg)",
              }}
            />
          </div>
        ) : (
          <span style={{ fontSize: "10px" }}>
            {getStatusIcon(status.status)}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#14171a",
            lineHeight: "16px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {getStatusMessage(status.status)}
        </div>

        {/* {status.status === "executing" && (
          <div
            style={{
              fontSize: "11px",
              color: "#657786",
              marginTop: "2px",
              lineHeight: "13px",
              fontStyle: "italic",
            }}
          >
            Please wait while the AI processes your request...
          </div>
        )} */}
      </div>
    </div>
  );
};

export default TaskStatus;
