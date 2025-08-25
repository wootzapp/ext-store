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
      default:
        return "⏳";
    }
  };

  return (
    <div
      style={{
        padding: "6px 12px",
        backgroundColor: "#f7f9fa",
        borderBottom: "1px solid #e1e8ed",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          backgroundColor: getStatusColor(status.status),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          flexShrink: 0,
        }}
      >
        {status.status === "executing" ? (
          <div
            className="loader"
            style={{
              width: "12px",
              height: "12px",
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
          <span style={{ fontSize: "8px" }}>
            {getStatusIcon(status.status)}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#14171a",
            lineHeight: "14px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {status.message || `Status: ${status.status}`}
        </div>

        {status.task && status.task.steps && (
          <div
            style={{
              fontSize: "10px",
              color: "#657786",
              marginTop: "1px",
              lineHeight: "12px",
            }}
          >
            Progress: {status.task.steps.length}/
            {status.task.plan?.actions?.length || 0} steps
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskStatus;
