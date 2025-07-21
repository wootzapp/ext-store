var rr = Object.defineProperty;
var or = (n, o, t) =>
  o in n
    ? rr(n, o, { enumerable: !0, configurable: !0, writable: !0, value: t })
    : (n[o] = t);
var I = (n, o, t) => or(n, typeof o != "symbol" ? o + "" : o, t);
import { E as Ce, C as l0 } from "./actions-CxosgIhI.js";
import { g as Ht, a as nr, c as be } from "./_commonjsHelpers-BosuxZz1.js";
var Y = ((n) => (
    (n.PLAYING = "PLAYING"),
    (n.PAUSED = "PAUSED"),
    (n.SEEK = "SEEK"),
    (n.END = "END"),
    (n.FOCUS_LOST = "FOCUS_LOST"),
    (n.FOCUS_GAINED = "FOCUS_GAINED"),
    n
  ))(Y || {}),
  Se = ((n) => ((n.EVREP = "EVENT_REPORT"), (n.HBEAT = "HEARTBEAT"), n))(
    Se || {}
  ),
  R0 = ((n) => (
    (n.EVENT_ACK = "EVENT_ACK"),
    (n.HEARTBEAT_ACK = "HEARTBEAT_ACK"),
    (n.ERROR = "ERROR"),
    n
  ))(R0 || {}),
  Tt = ((n) => (
    (n.SUCCESS = "SUCCESS"), (n.CONNECTED = "CONNECTED"), (n.ERROR = "ERROR"), n
  ))(Tt || {});
const x0 = class x0 {
  constructor() {
    console.log(
      "[SocketHeartReport] 🔧 Constructor: Initializing heartbeat manager"
    );
    I(this, "isActive", !1);
    I(this, "heartbeatInterval", 55e3);
    I(this, "heartbeatTimer", null);
    I(this, "hasVideoActivity", !1);
    I(this, "videoActivityTimer", null);
    I(this, "videoActivityTimeout", 2e4);
    I(this, "adaptiveInterval", !0);
    I(this, "minInterval", 3e4);
    I(this, "maxInterval", 12e4);
    I(this, "consecutiveFailures", 0);
    I(this, "maxFailures", 3);
    console.log(
      "[SocketHeartReport] ✅ Constructor: Heartbeat manager initialized with config:",
      {
        heartbeatInterval: this.heartbeatInterval,
        minInterval: this.minInterval,
        maxInterval: this.maxInterval,
        maxFailures: this.maxFailures,
      }
    );
  }
  static getInstance() {
    console.log(
      "[SocketHeartReport] 🔄 getInstance: Getting singleton instance"
    );
    if (!x0.instance) {
      console.log("[SocketHeartReport] 🆕 getInstance: Creating new instance");
      x0.instance = new x0();
    }
    console.log(
      "[SocketHeartReport] ✅ getInstance: Returning instance, isActive:",
      x0.instance.isActive
    );
    return x0.instance;
  }
  start() {
    console.log(
      "[SocketHeartReport] 🚀 start: Starting heartbeat service, current state:",
      {
        isActive: this.isActive,
        heartbeatInterval: this.heartbeatInterval,
      }
    );
    this.isActive ||
      ((this.isActive = !0),
      console.log(
        "[SocketHeartReport] ⏰ start: Scheduling heartbeat start in 2 seconds"
      ),
      setTimeout(() => {
        console.log(
          "[SocketHeartReport] 🔄 start: Timeout callback - starting heartbeat"
        );
        this.startHeartbeat();
      }, 2e3));
  }
  stop() {
    console.log(
      "[SocketHeartReport] 🛑 stop: Stopping heartbeat service, current state:",
      {
        isActive: this.isActive,
        hasVideoActivity: this.hasVideoActivity,
      }
    );
    this.isActive &&
      ((this.isActive = !1),
      console.log(
        "[SocketHeartReport] 🔄 stop: Calling stopHeartbeat and stopVideoActivityTimer"
      ),
      this.stopHeartbeat(),
      this.stopVideoActivityTimer());
  }
  startHeartbeat() {
    this.heartbeatTimer && clearInterval(this.heartbeatTimer),
      (this.heartbeatTimer = setInterval(() => {
        this.sendHeartbeat();
      }, this.heartbeatInterval)),
      console.log(
        "[SocketHeartReport] 心跳已启动，间隔:",
        this.heartbeatInterval / 1e3,
        "秒"
      );
  }
  stopHeartbeat() {
    this.heartbeatTimer &&
      (clearInterval(this.heartbeatTimer),
      (this.heartbeatTimer = null),
      console.log("[SocketHeartReport] 心跳已停止"));
  }
  sendHeartbeat() {
    console.log(
      "[SocketHeartReport] 💓 sendHeartbeat: Attempting to send heartbeat",
      {
        isActive: this.isActive,
        hasVideoActivity: this.hasVideoActivity,
        isConnected: he.isConnected(),
      }
    );
    if (!this.isActive || this.hasVideoActivity) {
      console.log(
        "[SocketHeartReport] ⏸️ sendHeartbeat: Skipping heartbeat - not active or has video activity"
      );
      return;
    }
    const o = { messageType: Se.HBEAT, timestamp: Date.now() };
    console.log(
      "[SocketHeartReport] 📤 sendHeartbeat: Prepared heartbeat message:",
      o
    );
    if (he.isConnected())
      try {
        typeof window !== "undefined" && "requestIdleCallback" in window
          ? (console.log(
              "[SocketHeartReport] 🔄 sendHeartbeat: Using requestIdleCallback for heartbeat"
            ),
            requestIdleCallback(
              () => {
                console.log(
                  "[SocketHeartReport] 🔄 sendHeartbeat: requestIdleCallback executing"
                );
                this.actualSendHeartbeat(o);
              },
              { timeout: 1e3 }
            ))
          : (console.log(
              "[SocketHeartReport] 🔄 sendHeartbeat: Using setTimeout for heartbeat"
            ),
            setTimeout(() => {
              console.log(
                "[SocketHeartReport] 🔄 sendHeartbeat: setTimeout executing"
              );
              this.actualSendHeartbeat(o);
            }, 50));
      } catch (t) {
        console.log(
          "[SocketHeartReport] ❌ sendHeartbeat: Error sending heartbeat:",
          t
        ),
          this.handleHeartbeatFailure();
      }
    else
      console.log(
        "[SocketHeartReport] ⚠️ sendHeartbeat: WebSocket not connected, handling failure"
      ),
        this.handleHeartbeatFailure();
  }
  actualSendHeartbeat(o) {
    console.log(
      "[SocketHeartReport] 📡 actualSendHeartbeat: Sending heartbeat message:",
      o
    );
    try {
      he.send(o),
        console.log(
          "[SocketHeartReport] ✅ actualSendHeartbeat: Heartbeat sent successfully"
        ),
        (this.consecutiveFailures = 0),
        console.log(
          "[SocketHeartReport] 🔄 actualSendHeartbeat: Reset consecutive failures to 0"
        ),
        this.adaptiveInterval &&
          this.heartbeatInterval < this.maxInterval &&
          (console.log(
            "[SocketHeartReport] 📈 actualSendHeartbeat: Increasing heartbeat interval"
          ),
          (this.heartbeatInterval = Math.min(
            this.heartbeatInterval * 1.1,
            this.maxInterval
          )),
          console.log(
            "[SocketHeartReport] 📈 actualSendHeartbeat: New heartbeat interval:",
            this.heartbeatInterval
          ),
          this.restartHeartbeat());
    } catch (t) {
      console.log(
        "[SocketHeartReport] ❌ actualSendHeartbeat: Failed to send heartbeat:",
        t
      ),
        this.handleHeartbeatFailure();
    }
  }
  handleHeartbeatFailure() {
    console.log(
      "[SocketHeartReport] 💔 handleHeartbeatFailure: Handling heartbeat failure",
      {
        consecutiveFailures: this.consecutiveFailures,
        maxFailures: this.maxFailures,
      }
    );
    this.consecutiveFailures++,
      console.log(
        "[SocketHeartReport] 📊 handleHeartbeatFailure: Incremented consecutive failures to:",
        this.consecutiveFailures
      ),
      this.consecutiveFailures >= this.maxFailures &&
        (console.log(
          "[SocketHeartReport] 🔄 handleHeartbeatFailure: Max failures reached, adjusting interval"
        ),
        (this.heartbeatInterval = Math.max(
          this.heartbeatInterval * 0.8,
          this.minInterval
        )),
        console.log(
          "[SocketHeartReport] 📉 handleHeartbeatFailure: New heartbeat interval:",
          this.heartbeatInterval
        ),
        (this.consecutiveFailures = 0),
        console.log(
          "[SocketHeartReport] 🔄 handleHeartbeatFailure: Reset consecutive failures, restarting heartbeat"
        ),
        this.restartHeartbeat(),
        console.log(
          "[SocketHeartReport] ⚠️ handleHeartbeatFailure: Consecutive failures exceeded, adjusted interval to:",
          this.heartbeatInterval / 1e3,
          "seconds"
        ));
  }
  restartHeartbeat() {
    this.heartbeatTimer && clearInterval(this.heartbeatTimer),
      (this.heartbeatTimer = setInterval(() => {
        this.sendHeartbeat();
      }, this.heartbeatInterval));
  }
  notifyVideoActivity() {
    console.log(
      "[SocketHeartReport] 🎬 notifyVideoActivity: Video activity detected",
      {
        hasVideoActivity: this.hasVideoActivity,
        isActive: this.isActive,
      }
    );
    this.hasVideoActivity ||
      (console.log(
        "[SocketHeartReport] 🎬 notifyVideoActivity: Setting hasVideoActivity to true, stopping heartbeat"
      ),
      (this.hasVideoActivity = !0),
      this.stopHeartbeat()),
      console.log(
        "[SocketHeartReport] ⏰ notifyVideoActivity: Resetting video activity timer"
      ),
      this.resetVideoActivityTimer();
  }
  notifyVideoActivityStopped() {
    console.log(
      "[SocketHeartReport] 🎬 notifyVideoActivityStopped: Video activity stopped",
      {
        hasVideoActivity: this.hasVideoActivity,
      }
    );
    this.hasVideoActivity &&
      (console.log(
        "[SocketHeartReport] 🎬 notifyVideoActivityStopped: Setting hasVideoActivity to false"
      ),
      (this.hasVideoActivity = !1),
      this.stopVideoActivityTimer(),
      console.log(
        "[SocketHeartReport] ⏰ notifyVideoActivityStopped: Scheduling heartbeat restart in 1 second"
      ),
      setTimeout(() => {
        console.log(
          "[SocketHeartReport] 🔄 notifyVideoActivityStopped: Timeout callback - restarting heartbeat"
        );
        this.startHeartbeat();
      }, 1e3));
  }
  resetVideoActivityTimer() {
    this.stopVideoActivityTimer(),
      (this.videoActivityTimer = setTimeout(() => {
        (this.hasVideoActivity = !1), this.startHeartbeat();
      }, this.videoActivityTimeout));
  }
  stopVideoActivityTimer() {
    this.videoActivityTimer &&
      (clearTimeout(this.videoActivityTimer), (this.videoActivityTimer = null));
  }
  destroy() {
    this.stop(),
      this.stopHeartbeat(),
      this.stopVideoActivityTimer(),
      (this.hasVideoActivity = !1),
      (this.consecutiveFailures = 0);
  }
  getActiveStatus() {
    return this.isActive;
  }
  getHeartbeatInterval() {
    return this.heartbeatInterval;
  }
  setHeartbeatInterval(o) {
    (this.heartbeatInterval = Math.max(
      this.minInterval,
      Math.min(o, this.maxInterval)
    )),
      this.isActive && !this.hasVideoActivity && this.restartHeartbeat();
  }
};
I(x0, "instance");
let Fe = x0;
const Ae = Fe.getInstance();
class sr {
  constructor(o) {
    console.log(
      "[WSSock] 🔧 Constructor: Initializing WebSocket connection with config:",
      o
    );
    I(this, "ws", null);
    I(this, "reconnectAttempts", 0);
    I(this, "messageQueue", []);
    I(this, "maxQueueSize", 50);
    I(this, "config", {
      url: "wss://api.trex.dev.dipbit.xyz/ws",
      maxReconnectAttempts: 3,
      initialReconnectDelay: 2e3,
      maxReconnectDelay: 3e4,
    });
    I(this, "reconnectDelay");
    I(this, "isConnecting", !1);
    I(this, "onRewardMessage", (o) => {});
    I(this, "batchSendTimer", null);
    I(this, "pendingMessages", []);
    I(this, "batchSize", 5);
    I(this, "batchTimeout", 500);
    o &&
      (console.log(
        "[WSSock] 📝 Constructor: Merging provided config with defaults"
      ),
      (this.config = { ...this.config, ...o })),
      (this.reconnectDelay = this.config.initialReconnectDelay);
    console.log(
      "[WSSock] ✅ Constructor: WebSocket initialized with final config:",
      this.config
    );
  }
  connect(o) {
    var t;
    console.log("[WSSock] 🔗 connect: Attempting to connect to WebSocket", {
      url: this.config.url,
      isConnecting: this.isConnecting,
      currentState: (t = this.ws) == null ? void 0 : t.readyState,
    });
    if (
      this.isConnecting ||
      ((t = this.ws) == null ? void 0 : t.readyState) === WebSocket.OPEN
    ) {
      console.log(
        "[WSSock] ⏸️ connect: Connection already exists or in progress, skipping"
      );
      return;
    }
    (this.isConnecting = !0),
      console.log(
        "[WSSock] 🔄 connect: Setting isConnecting to true, creating WebSocket"
      );
    try {
      (this.ws = new WebSocket(this.config.url)),
        console.log("[WSSock] ✅ connect: WebSocket created successfully"),
        this.setupEventHandlers();
    } catch (e) {
      console.error("[WSSock] ❌ connect: Failed to create WebSocket:", e),
        (this.isConnecting = !1),
        this.handleReconnect();
    }
    o &&
      (console.log("[WSSock] 📞 connect: Setting reward message callback"),
      (this.onRewardMessage = o));
  }
  setupEventHandlers() {
    console.log(
      "[WSSock] 🔧 setupEventHandlers: Setting up WebSocket event handlers"
    );
    this.ws &&
      ((this.ws.onopen = () => {
        console.log(
          "[WSSock] ✅ onopen: WebSocket connection established successfully to URL:",
          this.config.url
        ),
          (this.isConnecting = !1),
          (this.reconnectAttempts = 0),
          (this.reconnectDelay = this.config.initialReconnectDelay),
          console.log(
            "[WSSock] 🔄 onopen: Reset connection state,flushing message queue"
          ),
          this.flushMessageQueue();
      }),
      (this.ws.onmessage = (o) => {
        console.log("[WSSock] 📨 onmessage: Received message:", o.data);
        try {
          o.data &&
            (typeof window !== "undefined" && "requestIdleCallback" in window
              ? (console.log(
                  "[WSSock] 🔄 onmessage: Using requestIdleCallback for message processing"
                ),
                requestIdleCallback(
                  () => {
                    console.log(
                      "[WSSock] 🔄 onmessage: requestIdleCallback executing"
                    );
                    this.processMessageData(o.data);
                  },
                  { timeout: 1e3 }
                ))
              : (console.log(
                  "[WSSock] 🔄 onmessage: Using setTimeout for message processing"
                ),
                setTimeout(() => {
                  console.log("[WSSock] 🔄 onmessage: setTimeout executing");
                  this.processMessageData(o.data);
                }, 10)));
        } catch (t) {
          console.log("[WSSock] ❌ onmessage: Message processing failed:", t);
        }
      }),
      (this.ws.onclose = (o) => {
        console.log("[WSSock] 🔌 onclose: Connection closed:", {
          code: o.code,
          reason: o.reason,
          wasClean: o.wasClean,
        }),
          (this.isConnecting = !1),
          this.handleReconnect();
      }),
      (this.ws.onerror = (o) => {
        console.log("[WSSock] ❌ onerror: Connection error:", o),
          (this.isConnecting = !1);
      }));
  }
  processMessageData(o) {
    console.log(
      "[WSSock] 🔄 processMessageData: Processing raw message data:",
      o
    );
    try {
      const t = o.replace("Message received:", "");
      console.log("[WSSock] 📝 processMessageData: Cleaned message data:", t);
      const e = JSON.parse(t);
      console.log(
        "[WSSock] 📊 processMessageData: Parsed message object:",
        e,
        "messageType:",
        e.messageType,
        "timestamp:",
        new Date(e.timestamp).toISOString()
      );
      this.handleMessage(e);
    } catch (t) {
      console.error(
        "[WSSock] ❌ processMessageData: JSON parsing failed:",
        t,
        "Raw data was:",
        o
      );
    }
  }
  handleMessage(o) {
    console.log(
      "[WSSock] 📬 handleMessage: Processing message with type:",
      o.messageType
    );
    if (o.messageType === R0.EVENT_ACK) {
      console.log("[WSSock] 📨 handleMessage: Received EVENT_ACK message");
      const t = o.responseData;
      console.log("[WSSock] 📊 handleMessage: Response data:", t);
      if (t.status === Tt.SUCCESS) {
        console.log(
          "[WSSock] ✅ handleMessage: Event acknowledged successfully"
        );
        const e = t.rewardInfo;
        e &&
          (console.log("[WSSock] 🎁 handleMessage: Reward info found:", e),
          this.onRewardMessage(e));
      } else {
        console.log(
          "[WSSock] ⚠️ handleMessage: Event acknowledgment failed, status:",
          t.status
        );
      }
    } else if (o.messageType === R0.HEARTBEAT_ACK) {
      console.log(
        "[WSSock] 💓 handleMessage: Received heartbeat acknowledgment:",
        o
      );
    } else if (o.messageType === R0.ERROR) {
      console.log("[WSSock] ❌ handleMessage: Received error message:", o);
    } else {
      console.log(
        "[WSSock] ❓ handleMessage: Unknown message type received:",
        o.messageType
      );
    }
  }
  handleReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log(
        "[WSSock] ❌ handleReconnect: Maximum reconnection attempts reached, stopping reconnection attempts"
      );
      return;
    }
    this.reconnectAttempts++,
      console.log(
        `[WSSock] 🔄 handleReconnect: Attempting to reconnect in ${this.reconnectDelay}ms (Attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`
      ),
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay),
      (this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        this.config.maxReconnectDelay
      ));
  }
  send(o) {
    console.log("[WSSock] 📤 send: Attempting to send message:", o, {
      isConnected: this.ws && this.ws.readyState === WebSocket.OPEN,
      pendingMessagesCount: this.pendingMessages.length,
      batchSize: this.batchSize,
    });
    this.ws && this.ws.readyState === WebSocket.OPEN
      ? (console.log("[WSSock] 📝 send: Adding message to pending queue"),
        this.pendingMessages.push(o),
        console.log(
          "[WSSock] 📊 send: Pending messages count:",
          this.pendingMessages.length
        ),
        this.pendingMessages.length >= this.batchSize
          ? (console.log(
              "[WSSock] 🚀 send: Batch size reached, flushing immediately"
            ),
            this.flushPendingMessages())
          : this.batchSendTimer ||
            (console.log("[WSSock] ⏰ send: Starting batch timeout timer"),
            (this.batchSendTimer = setTimeout(() => {
              console.log(
                "[WSSock] ⏰ send: Batch timeout reached, flushing pending messages"
              );
              this.flushPendingMessages();
            }, this.batchTimeout))))
      : (console.log(
          "[WSSock] ⚠️ send: WebSocket not connected, adding to queue"
        ),
        this.addMessageToQueue(o));
  }
  safeSend(o) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN)
      try {
        const t = { ...o, timestamp: Date.now() };
        return (
          this.ws.send(JSON.stringify(t)),
          console.log("[WSSock] 安全发送消息成功:", t),
          !0
        );
      } catch (t) {
        return (
          console.log("[WSSock] 安全发送消息失败:", t),
          this.addMessageToQueue(o),
          !1
        );
      }
    else
      return (
        console.log("[WSSock] WebSocket未连接，消息加入队列"),
        this.addMessageToQueue(o),
        !1
      );
  }
  flushPendingMessages() {
    var o;
    console.log(
      "[WSSock] 🔄 flushPendingMessages: Flushing pending messages",
      "Pending count:",
      this.pendingMessages.length,
      "WebSocket ready state:",
      (o = this.ws) ? o.readyState : "null"
    );

    if (this.pendingMessages.length !== 0) {
      if (
        (this.batchSendTimer &&
          (clearTimeout(this.batchSendTimer), (this.batchSendTimer = null)),
        ((o = this.ws) == null ? void 0 : o.readyState) !== WebSocket.OPEN)
      ) {
        console.log(
          "[WSSock] ⚠️ flushPendingMessages: WebSocket not in OPEN state (current state:",
          (o = this.ws) ? o.readyState : "null",
          "), re-queuing messages"
        ),
          this.pendingMessages.forEach((t) => {
            this.addMessageToQueue(t);
          }),
          (this.pendingMessages = []);
        return;
      }
      try {
        const t = this.pendingMessages.splice(0, this.batchSize);
        t.forEach((e) => {
          var v;
          if (
            ((v = this.ws) == null ? void 0 : v.readyState) === WebSocket.OPEN
          ) {
            const x = { ...e, timestamp: Date.now() };
            this.ws.send(JSON.stringify(x)),
              console.log("[WSSock] 批量发送消息:", x);
          } else
            console.log("[WSSock] WebSocket状态已改变，跳过消息发送"),
              this.addMessageToQueue(e);
        }),
          this.cleanupSentMessages(t);
      } catch (t) {
        console.log("[WSSock] 批量发送消息失败:", t),
          this.pendingMessages.unshift(...this.pendingMessages);
      }
    }
  }
  addMessageToQueue(o) {
    if (
      (this.messageQueue.push(o), this.messageQueue.length > this.maxQueueSize)
    ) {
      const t = this.messageQueue.shift();
      console.log("[WSSock] 队列已满，移除最旧的消息:", t);
    }
    console.log(
      "[WSSock] 消息已添加到队列，当前队列长度:",
      this.messageQueue.length
    );
  }
  cleanupSentMessages(o) {
    o.forEach((t) => {
      const e = this.messageQueue.findIndex(
        (v) => JSON.stringify(v) === JSON.stringify(t)
      );
      e !== -1 && this.messageQueue.splice(e, 1);
    }),
      console.log(
        "[WSSock] 已清理发送的消息，剩余队列长度:",
        this.messageQueue.length
      );
  }
  flushMessageQueue() {
    console.log(
      "[WSSock] 🔄 flushMessageQueue: Flushing message queue",
      "Queue length:",
      this.messageQueue.length,
      "Connection status:",
      this.getStatus()
    );
    if (this.messageQueue.length === 0) {
      console.log(
        "[WSSock] ℹ️ flushMessageQueue: Message queue is empty, nothing to flush"
      );
      return;
    }
    const o = [...this.messageQueue];
    console.log(
      "[WSSock] 📤 flushMessageQueue: Preparing to send",
      o.length,
      "queued messages"
    );
    (this.messageQueue = []),
      o.forEach((t, i) => {
        console.log(
          `[WSSock] 📤 flushMessageQueue: Sending queued message ${i + 1}/${
            o.length
          }`
        );
        this.send(t);
      });
  }
  clearMessageQueue() {
    this.messageQueue.length, (this.messageQueue = []);
  }
  disconnect() {
    console.log("[WSSock] 🔌 disconnect: Disconnecting WebSocket connection"),
      this.ws &&
        (console.log(
          "[WSSock] 🔌 disconnect: Closing WebSocket with readyState:",
          this.ws.readyState
        ),
        this.ws.close(),
        (this.ws = null)),
      (this.isConnecting = !1),
      (this.reconnectAttempts = 0),
      this.clearMessageQueue(),
      console.log(
        "[WSSock] 🔌 disconnect: WebSocket connection closed and cleanup complete"
      );
  }
  isConnected() {
    return !!(this.ws && this.ws.readyState === WebSocket.OPEN);
  }
  canSend() {
    return !!(this.ws && this.ws.readyState === WebSocket.OPEN);
  }
  getReadyState() {
    return this.ws ? this.ws.readyState : null;
  }
  getStatus() {
    if (!this.ws) return "disconnected";
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
        return "closed";
      default:
        return "unknown";
    }
  }
  updateConfig(o) {
    this.config = { ...this.config, ...o };
  }
  handleWSSockMessages(o, t, e) {
    console.log(
      "[WSSock] 📨 handleWSSockMessages: Received message type:",
      o.type,
      "data:",
      o.data
    );
    switch (o.type) {
      case "WSSOCK_SEND":
        console.log(
          "[WSSock] 📤 handleWSSockMessages: Handling WSSOCK_SEND message"
        );
        return this.handleSendMessage(o.data, e), !0;
      case "WSSOCK_STATUS":
        console.log(
          "[WSSock] 📊 handleWSSockMessages: Handling WSSOCK_STATUS message"
        );
        return this.handleStatusRequest(e), !0;
      case "WSSOCK_UPDATE_CONFIG":
        console.log(
          "[WSSock] ⚙️ handleWSSockMessages: Handling WSSOCK_UPDATE_CONFIG message"
        );
        return this.handleUpdateConfig(o.data, e), !0;
      default:
        console.log(
          "[WSSock] ❓ handleWSSockMessages: Unknown message type:",
          o.type
        );
        return !1;
    }
  }
  handleSendMessage(o, t) {
    console.log(
      "[WSSock] 📤 handleSendMessage: Attempting to send message:",
      o
    );
    try {
      this.send(o);
      console.log("[WSSock] ✅ handleSendMessage: Message sent successfully");
      t({ success: !0, message: "Message sent successfully" });
    } catch (e) {
      console.error("[WSSock] ❌ handleSendMessage: Error sending message:", e);
      t({ success: !1, error: e.message || "Failed to send message" });
    }
  }
  handleStatusRequest(o) {
    console.log("[WSSock] 📊 handleStatusRequest: Getting WebSocket status");
    try {
      const t = this.getStatus(),
        e = this.isConnected();
      console.log(
        "[WSSock] 📊 handleStatusRequest: Current status:",
        t,
        "isConnected:",
        e
      );
      o({
        success: !0,
        status: t,
        isConnected: e,
        message: "Status retrieved successfully",
        queueLength: this.messageQueue.length,
        pendingMessages: this.pendingMessages.length,
      });
    } catch (t) {
      console.error(
        "[WSSock] ❌ handleStatusRequest: Error retrieving status:",
        t
      );
      o({ success: !1, error: t.message || "Failed to retrieve status" });
    }
  }
  handleUpdateConfig(o, t) {
    console.log(
      "[WSSock] ⚙️ handleUpdateConfig: Updating WebSocket configuration",
      o
    );
    try {
      const oldConfig = { ...this.config };
      this.updateConfig(o);
      console.log(
        "[WSSock] ✅ handleUpdateConfig: Configuration updated successfully",
        "Old:",
        oldConfig,
        "New:",
        this.config
      );
      t({
        success: !0,
        message: "Configuration updated successfully",
        oldConfig: oldConfig,
        newConfig: this.config,
      });
    } catch (e) {
      console.error(
        "[WSSock] ❌ handleUpdateConfig: Error updating configuration:",
        e
      );
      t({ success: !1, error: e.message || "Failed to update configuration" });
    }
  }
}
const he = new sr();
var me = { exports: {} };
/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/ var Ge;
function ar() {
  return (
    Ge ||
      ((Ge = 1),
      (function (n) {
        (function () {
          var o = {}.hasOwnProperty;
          function t() {
            for (var x = "", b = 0; b < arguments.length; b++) {
              var l = arguments[b];
              l && (x = v(x, e(l)));
            }
            return x;
          }
          function e(x) {
            if (typeof x == "string" || typeof x == "number") return x;
            if (typeof x != "object") return "";
            if (Array.isArray(x)) return t.apply(null, x);
            if (
              x.toString !== Object.prototype.toString &&
              !x.toString.toString().includes("[native code]")
            )
              return x.toString();
            var b = "";
            for (var l in x) o.call(x, l) && x[l] && (b = v(b, l));
            return b;
          }
          function v(x, b) {
            return b ? (x ? x + " " + b : x + b) : x;
          }
          n.exports
            ? ((t.default = t), (n.exports = t))
            : (window.classNames = t);
        })();
      })(me)),
    me.exports
  );
}
var ir = ar();
const xr = Ht(ir),
  ke = "-",
  cr = (n) => {
    const o = fr(n),
      { conflictingClassGroups: t, conflictingClassGroupModifiers: e } = n;
    return {
      getClassGroupId: (b) => {
        const l = b.split(ke);
        return l[0] === "" && l.length !== 1 && l.shift(), zt(l, o) || lr(b);
      },
      getConflictingClassGroupIds: (b, l) => {
        const C = t[b] || [];
        return l && e[b] ? [...C, ...e[b]] : C;
      },
    };
  },
  zt = (n, o) => {
    var b;
    if (n.length === 0) return o.classGroupId;
    const t = n[0],
      e = o.nextPart.get(t),
      v = e ? zt(n.slice(1), e) : void 0;
    if (v) return v;
    if (o.validators.length === 0) return;
    const x = n.join(ke);
    return (b = o.validators.find(({ validator: l }) => l(x))) == null
      ? void 0
      : b.classGroupId;
  },
  Ue = /^\[(.+)\]$/,
  lr = (n) => {
    if (Ue.test(n)) {
      const o = Ue.exec(n)[1],
        t = o == null ? void 0 : o.substring(0, o.indexOf(":"));
      if (t) return "arbitrary.." + t;
    }
  },
  fr = (n) => {
    const { theme: o, prefix: t } = n,
      e = { nextPart: new Map(), validators: [] };
    return (
      ur(Object.entries(n.classGroups), t).forEach(([x, b]) => {
        ye(b, e, x, o);
      }),
      e
    );
  },
  ye = (n, o, t, e) => {
    n.forEach((v) => {
      if (typeof v == "string") {
        const x = v === "" ? o : Ke(o, v);
        x.classGroupId = t;
        return;
      }
      if (typeof v == "function") {
        if (dr(v)) {
          ye(v(e), o, t, e);
          return;
        }
        o.validators.push({ validator: v, classGroupId: t });
        return;
      }
      Object.entries(v).forEach(([x, b]) => {
        ye(b, Ke(o, x), t, e);
      });
    });
  },
  Ke = (n, o) => {
    let t = n;
    return (
      o.split(ke).forEach((e) => {
        t.nextPart.has(e) ||
          t.nextPart.set(e, { nextPart: new Map(), validators: [] }),
          (t = t.nextPart.get(e));
      }),
      t
    );
  },
  dr = (n) => n.isThemeGetter,
  ur = (n, o) =>
    o
      ? n.map(([t, e]) => {
          const v = e.map((x) =>
            typeof x == "string"
              ? o + x
              : typeof x == "object"
              ? Object.fromEntries(
                  Object.entries(x).map(([b, l]) => [o + b, l])
                )
              : x
          );
          return [t, v];
        })
      : n,
  hr = (n) => {
    if (n < 1) return { get: () => {}, set: () => {} };
    let o = 0,
      t = new Map(),
      e = new Map();
    const v = (x, b) => {
      t.set(x, b), o++, o > n && ((o = 0), (e = t), (t = new Map()));
    };
    return {
      get(x) {
        let b = t.get(x);
        if (b !== void 0) return b;
        if ((b = e.get(x)) !== void 0) return v(x, b), b;
      },
      set(x, b) {
        t.has(x) ? t.set(x, b) : v(x, b);
      },
    };
  },
  It = "!",
  vr = (n) => {
    const { separator: o, experimentalParseClassName: t } = n,
      e = o.length === 1,
      v = o[0],
      x = o.length,
      b = (l) => {
        const C = [];
        let r = 0,
          a = 0,
          B;
        for (let f = 0; f < l.length; f++) {
          let E = l[f];
          if (r === 0) {
            if (E === v && (e || l.slice(f, f + x) === o)) {
              C.push(l.slice(a, f)), (a = f + x);
              continue;
            }
            if (E === "/") {
              B = f;
              continue;
            }
          }
          E === "[" ? r++ : E === "]" && r--;
        }
        const s = C.length === 0 ? l : l.substring(a),
          h = s.startsWith(It),
          d = h ? s.substring(1) : s,
          p = B && B > a ? B - a : void 0;
        return {
          modifiers: C,
          hasImportantModifier: h,
          baseClassName: d,
          maybePostfixModifierPosition: p,
        };
      };
    return t ? (l) => t({ className: l, parseClassName: b }) : b;
  },
  pr = (n) => {
    if (n.length <= 1) return n;
    const o = [];
    let t = [];
    return (
      n.forEach((e) => {
        e[0] === "[" ? (o.push(...t.sort(), e), (t = [])) : t.push(e);
      }),
      o.push(...t.sort()),
      o
    );
  },
  Cr = (n) => ({ cache: hr(n.cacheSize), parseClassName: vr(n), ...cr(n) }),
  Er = /\s+/,
  Br = (n, o) => {
    const {
        parseClassName: t,
        getClassGroupId: e,
        getConflictingClassGroupIds: v,
      } = o,
      x = [],
      b = n.trim().split(Er);
    let l = "";
    for (let C = b.length - 1; C >= 0; C -= 1) {
      const r = b[C],
        {
          modifiers: a,
          hasImportantModifier: B,
          baseClassName: s,
          maybePostfixModifierPosition: h,
        } = t(r);
      let d = !!h,
        p = e(d ? s.substring(0, h) : s);
      if (!p) {
        if (!d) {
          l = r + (l.length > 0 ? " " + l : l);
          continue;
        }
        if (((p = e(s)), !p)) {
          l = r + (l.length > 0 ? " " + l : l);
          continue;
        }
        d = !1;
      }
      const f = pr(a).join(":"),
        E = B ? f + It : f,
        i = E + p;
      if (x.includes(i)) continue;
      x.push(i);
      const c = v(p, d);
      for (let u = 0; u < c.length; ++u) {
        const A = c[u];
        x.push(E + A);
      }
      l = r + (l.length > 0 ? " " + l : l);
    }
    return l;
  };
function gr() {
  let n = 0,
    o,
    t,
    e = "";
  for (; n < arguments.length; )
    (o = arguments[n++]) && (t = Pt(o)) && (e && (e += " "), (e += t));
  return e;
}
const Pt = (n) => {
  if (typeof n == "string") return n;
  let o,
    t = "";
  for (let e = 0; e < n.length; e++)
    n[e] && (o = Pt(n[e])) && (t && (t += " "), (t += o));
  return t;
};
function Qe(n, ...o) {
  let t,
    e,
    v,
    x = b;
  function b(C) {
    const r = o.reduce((a, B) => B(a), n());
    return (t = Cr(r)), (e = t.cache.get), (v = t.cache.set), (x = l), l(C);
  }
  function l(C) {
    const r = e(C);
    if (r) return r;
    const a = Br(C, t);
    return v(C, a), a;
  }
  return function () {
    return x(gr.apply(null, arguments));
  };
}
const U = (n) => {
    const o = (t) => t[n] || [];
    return (o.isThemeGetter = !0), o;
  },
  Wt = /^\[(?:([a-z-]+):)?(.+)\]$/i,
  br = /^\d+\/\d+$/,
  Ar = new Set(["px", "full", "screen"]),
  mr = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
  Dr =
    /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  Fr = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/,
  yr = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  _r =
    /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
  r0 = (n) => p0(n) || Ar.has(n) || br.test(n),
  s0 = (n) => C0(n, "length", Ir),
  p0 = (n) => !!n && !Number.isNaN(Number(n)),
  De = (n) => C0(n, "number", p0),
  F0 = (n) => !!n && Number.isInteger(Number(n)),
  wr = (n) => n.endsWith("%") && p0(n.slice(0, -1)),
  L = (n) => Wt.test(n),
  a0 = (n) => mr.test(n),
  Sr = new Set(["length", "size", "percentage"]),
  kr = (n) => C0(n, Sr, Lt),
  Rr = (n) => C0(n, "position", Lt),
  Hr = new Set(["image", "url"]),
  Tr = (n) => C0(n, Hr, Wr),
  zr = (n) => C0(n, "", Pr),
  y0 = () => !0,
  C0 = (n, o, t) => {
    const e = Wt.exec(n);
    return e
      ? e[1]
        ? typeof o == "string"
          ? e[1] === o
          : o.has(e[1])
        : t(e[2])
      : !1;
  },
  Ir = (n) => Dr.test(n) && !Fr.test(n),
  Lt = () => !1,
  Pr = (n) => yr.test(n),
  Wr = (n) => _r.test(n),
  Lr = () => {
    const n = U("colors"),
      o = U("spacing"),
      t = U("blur"),
      e = U("brightness"),
      v = U("borderColor"),
      x = U("borderRadius"),
      b = U("borderSpacing"),
      l = U("borderWidth"),
      C = U("contrast"),
      r = U("grayscale"),
      a = U("hueRotate"),
      B = U("invert"),
      s = U("gap"),
      h = U("gradientColorStops"),
      d = U("gradientColorStopPositions"),
      p = U("inset"),
      f = U("margin"),
      E = U("opacity"),
      i = U("padding"),
      c = U("saturate"),
      u = U("scale"),
      A = U("sepia"),
      m = U("skew"),
      F = U("space"),
      _ = U("translate"),
      T = () => ["auto", "contain", "none"],
      g = () => ["auto", "hidden", "clip", "visible", "scroll"],
      D = () => ["auto", L, o],
      y = () => [L, o],
      S = () => ["", r0, s0],
      z = () => ["auto", p0, L],
      P = () => [
        "bottom",
        "center",
        "left",
        "left-bottom",
        "left-top",
        "right",
        "right-bottom",
        "right-top",
        "top",
      ],
      W = () => ["solid", "dashed", "dotted", "double", "none"],
      V = () => [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity",
      ],
      M = () => [
        "start",
        "end",
        "center",
        "between",
        "around",
        "evenly",
        "stretch",
      ],
      O = () => ["", "0", L],
      $ = () => [
        "auto",
        "avoid",
        "all",
        "avoid-page",
        "page",
        "left",
        "right",
        "column",
      ],
      w = () => [p0, L];
    return {
      cacheSize: 500,
      separator: ":",
      theme: {
        colors: [y0],
        spacing: [r0, s0],
        blur: ["none", "", a0, L],
        brightness: w(),
        borderColor: [n],
        borderRadius: ["none", "", "full", a0, L],
        borderSpacing: y(),
        borderWidth: S(),
        contrast: w(),
        grayscale: O(),
        hueRotate: w(),
        invert: O(),
        gap: y(),
        gradientColorStops: [n],
        gradientColorStopPositions: [wr, s0],
        inset: D(),
        margin: D(),
        opacity: w(),
        padding: y(),
        saturate: w(),
        scale: w(),
        sepia: O(),
        skew: w(),
        space: y(),
        translate: y(),
      },
      classGroups: {
        aspect: [{ aspect: ["auto", "square", "video", L] }],
        container: ["container"],
        columns: [{ columns: [a0] }],
        "break-after": [{ "break-after": $() }],
        "break-before": [{ "break-before": $() }],
        "break-inside": [
          { "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"] },
        ],
        "box-decoration": [{ "box-decoration": ["slice", "clone"] }],
        box: [{ box: ["border", "content"] }],
        display: [
          "block",
          "inline-block",
          "inline",
          "flex",
          "inline-flex",
          "table",
          "inline-table",
          "table-caption",
          "table-cell",
          "table-column",
          "table-column-group",
          "table-footer-group",
          "table-header-group",
          "table-row-group",
          "table-row",
          "flow-root",
          "grid",
          "inline-grid",
          "contents",
          "list-item",
          "hidden",
        ],
        float: [{ float: ["right", "left", "none", "start", "end"] }],
        clear: [{ clear: ["left", "right", "both", "none", "start", "end"] }],
        isolation: ["isolate", "isolation-auto"],
        "object-fit": [
          { object: ["contain", "cover", "fill", "none", "scale-down"] },
        ],
        "object-position": [{ object: [...P(), L] }],
        overflow: [{ overflow: g() }],
        "overflow-x": [{ "overflow-x": g() }],
        "overflow-y": [{ "overflow-y": g() }],
        overscroll: [{ overscroll: T() }],
        "overscroll-x": [{ "overscroll-x": T() }],
        "overscroll-y": [{ "overscroll-y": T() }],
        position: ["static", "fixed", "absolute", "relative", "sticky"],
        inset: [{ inset: [p] }],
        "inset-x": [{ "inset-x": [p] }],
        "inset-y": [{ "inset-y": [p] }],
        start: [{ start: [p] }],
        end: [{ end: [p] }],
        top: [{ top: [p] }],
        right: [{ right: [p] }],
        bottom: [{ bottom: [p] }],
        left: [{ left: [p] }],
        visibility: ["visible", "invisible", "collapse"],
        z: [{ z: ["auto", F0, L] }],
        basis: [{ basis: D() }],
        "flex-direction": [
          { flex: ["row", "row-reverse", "col", "col-reverse"] },
        ],
        "flex-wrap": [{ flex: ["wrap", "wrap-reverse", "nowrap"] }],
        flex: [{ flex: ["1", "auto", "initial", "none", L] }],
        grow: [{ grow: O() }],
        shrink: [{ shrink: O() }],
        order: [{ order: ["first", "last", "none", F0, L] }],
        "grid-cols": [{ "grid-cols": [y0] }],
        "col-start-end": [{ col: ["auto", { span: ["full", F0, L] }, L] }],
        "col-start": [{ "col-start": z() }],
        "col-end": [{ "col-end": z() }],
        "grid-rows": [{ "grid-rows": [y0] }],
        "row-start-end": [{ row: ["auto", { span: [F0, L] }, L] }],
        "row-start": [{ "row-start": z() }],
        "row-end": [{ "row-end": z() }],
        "grid-flow": [
          { "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"] },
        ],
        "auto-cols": [{ "auto-cols": ["auto", "min", "max", "fr", L] }],
        "auto-rows": [{ "auto-rows": ["auto", "min", "max", "fr", L] }],
        gap: [{ gap: [s] }],
        "gap-x": [{ "gap-x": [s] }],
        "gap-y": [{ "gap-y": [s] }],
        "justify-content": [{ justify: ["normal", ...M()] }],
        "justify-items": [
          { "justify-items": ["start", "end", "center", "stretch"] },
        ],
        "justify-self": [
          { "justify-self": ["auto", "start", "end", "center", "stretch"] },
        ],
        "align-content": [{ content: ["normal", ...M(), "baseline"] }],
        "align-items": [
          { items: ["start", "end", "center", "baseline", "stretch"] },
        ],
        "align-self": [
          { self: ["auto", "start", "end", "center", "stretch", "baseline"] },
        ],
        "place-content": [{ "place-content": [...M(), "baseline"] }],
        "place-items": [
          { "place-items": ["start", "end", "center", "baseline", "stretch"] },
        ],
        "place-self": [
          { "place-self": ["auto", "start", "end", "center", "stretch"] },
        ],
        p: [{ p: [i] }],
        px: [{ px: [i] }],
        py: [{ py: [i] }],
        ps: [{ ps: [i] }],
        pe: [{ pe: [i] }],
        pt: [{ pt: [i] }],
        pr: [{ pr: [i] }],
        pb: [{ pb: [i] }],
        pl: [{ pl: [i] }],
        m: [{ m: [f] }],
        mx: [{ mx: [f] }],
        my: [{ my: [f] }],
        ms: [{ ms: [f] }],
        me: [{ me: [f] }],
        mt: [{ mt: [f] }],
        mr: [{ mr: [f] }],
        mb: [{ mb: [f] }],
        ml: [{ ml: [f] }],
        "space-x": [{ "space-x": [F] }],
        "space-x-reverse": ["space-x-reverse"],
        "space-y": [{ "space-y": [F] }],
        "space-y-reverse": ["space-y-reverse"],
        w: [{ w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", L, o] }],
        "min-w": [{ "min-w": [L, o, "min", "max", "fit"] }],
        "max-w": [
          {
            "max-w": [
              L,
              o,
              "none",
              "full",
              "min",
              "max",
              "fit",
              "prose",
              { screen: [a0] },
              a0,
            ],
          },
        ],
        h: [{ h: [L, o, "auto", "min", "max", "fit", "svh", "lvh", "dvh"] }],
        "min-h": [
          { "min-h": [L, o, "min", "max", "fit", "svh", "lvh", "dvh"] },
        ],
        "max-h": [
          { "max-h": [L, o, "min", "max", "fit", "svh", "lvh", "dvh"] },
        ],
        size: [{ size: [L, o, "auto", "min", "max", "fit"] }],
        "font-size": [{ text: ["base", a0, s0] }],
        "font-smoothing": ["antialiased", "subpixel-antialiased"],
        "font-style": ["italic", "not-italic"],
        "font-weight": [
          {
            font: [
              "thin",
              "extralight",
              "light",
              "normal",
              "medium",
              "semibold",
              "bold",
              "extrabold",
              "black",
              De,
            ],
          },
        ],
        "font-family": [{ font: [y0] }],
        "fvn-normal": ["normal-nums"],
        "fvn-ordinal": ["ordinal"],
        "fvn-slashed-zero": ["slashed-zero"],
        "fvn-figure": ["lining-nums", "oldstyle-nums"],
        "fvn-spacing": ["proportional-nums", "tabular-nums"],
        "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
        tracking: [
          {
            tracking: [
              "tighter",
              "tight",
              "normal",
              "wide",
              "wider",
              "widest",
              L,
            ],
          },
        ],
        "line-clamp": [{ "line-clamp": ["none", p0, De] }],
        leading: [
          {
            leading: [
              "none",
              "tight",
              "snug",
              "normal",
              "relaxed",
              "loose",
              r0,
              L,
            ],
          },
        ],
        "list-image": [{ "list-image": ["none", L] }],
        "list-style-type": [{ list: ["none", "disc", "decimal", L] }],
        "list-style-position": [{ list: ["inside", "outside"] }],
        "placeholder-color": [{ placeholder: [n] }],
        "placeholder-opacity": [{ "placeholder-opacity": [E] }],
        "text-alignment": [
          { text: ["left", "center", "right", "justify", "start", "end"] },
        ],
        "text-color": [{ text: [n] }],
        "text-opacity": [{ "text-opacity": [E] }],
        "text-decoration": [
          "underline",
          "overline",
          "line-through",
          "no-underline",
        ],
        "text-decoration-style": [{ decoration: [...W(), "wavy"] }],
        "text-decoration-thickness": [
          { decoration: ["auto", "from-font", r0, s0] },
        ],
        "underline-offset": [{ "underline-offset": ["auto", r0, L] }],
        "text-decoration-color": [{ decoration: [n] }],
        "text-transform": [
          "uppercase",
          "lowercase",
          "capitalize",
          "normal-case",
        ],
        "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
        "text-wrap": [{ text: ["wrap", "nowrap", "balance", "pretty"] }],
        indent: [{ indent: y() }],
        "vertical-align": [
          {
            align: [
              "baseline",
              "top",
              "middle",
              "bottom",
              "text-top",
              "text-bottom",
              "sub",
              "super",
              L,
            ],
          },
        ],
        whitespace: [
          {
            whitespace: [
              "normal",
              "nowrap",
              "pre",
              "pre-line",
              "pre-wrap",
              "break-spaces",
            ],
          },
        ],
        break: [{ break: ["normal", "words", "all", "keep"] }],
        hyphens: [{ hyphens: ["none", "manual", "auto"] }],
        content: [{ content: ["none", L] }],
        "bg-attachment": [{ bg: ["fixed", "local", "scroll"] }],
        "bg-clip": [{ "bg-clip": ["border", "padding", "content", "text"] }],
        "bg-opacity": [{ "bg-opacity": [E] }],
        "bg-origin": [{ "bg-origin": ["border", "padding", "content"] }],
        "bg-position": [{ bg: [...P(), Rr] }],
        "bg-repeat": [
          { bg: ["no-repeat", { repeat: ["", "x", "y", "round", "space"] }] },
        ],
        "bg-size": [{ bg: ["auto", "cover", "contain", kr] }],
        "bg-image": [
          {
            bg: [
              "none",
              { "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"] },
              Tr,
            ],
          },
        ],
        "bg-color": [{ bg: [n] }],
        "gradient-from-pos": [{ from: [d] }],
        "gradient-via-pos": [{ via: [d] }],
        "gradient-to-pos": [{ to: [d] }],
        "gradient-from": [{ from: [h] }],
        "gradient-via": [{ via: [h] }],
        "gradient-to": [{ to: [h] }],
        rounded: [{ rounded: [x] }],
        "rounded-s": [{ "rounded-s": [x] }],
        "rounded-e": [{ "rounded-e": [x] }],
        "rounded-t": [{ "rounded-t": [x] }],
        "rounded-r": [{ "rounded-r": [x] }],
        "rounded-b": [{ "rounded-b": [x] }],
        "rounded-l": [{ "rounded-l": [x] }],
        "rounded-ss": [{ "rounded-ss": [x] }],
        "rounded-se": [{ "rounded-se": [x] }],
        "rounded-ee": [{ "rounded-ee": [x] }],
        "rounded-es": [{ "rounded-es": [x] }],
        "rounded-tl": [{ "rounded-tl": [x] }],
        "rounded-tr": [{ "rounded-tr": [x] }],
        "rounded-br": [{ "rounded-br": [x] }],
        "rounded-bl": [{ "rounded-bl": [x] }],
        "border-w": [{ border: [l] }],
        "border-w-x": [{ "border-x": [l] }],
        "border-w-y": [{ "border-y": [l] }],
        "border-w-s": [{ "border-s": [l] }],
        "border-w-e": [{ "border-e": [l] }],
        "border-w-t": [{ "border-t": [l] }],
        "border-w-r": [{ "border-r": [l] }],
        "border-w-b": [{ "border-b": [l] }],
        "border-w-l": [{ "border-l": [l] }],
        "border-opacity": [{ "border-opacity": [E] }],
        "border-style": [{ border: [...W(), "hidden"] }],
        "divide-x": [{ "divide-x": [l] }],
        "divide-x-reverse": ["divide-x-reverse"],
        "divide-y": [{ "divide-y": [l] }],
        "divide-y-reverse": ["divide-y-reverse"],
        "divide-opacity": [{ "divide-opacity": [E] }],
        "divide-style": [{ divide: W() }],
        "border-color": [{ border: [v] }],
        "border-color-x": [{ "border-x": [v] }],
        "border-color-y": [{ "border-y": [v] }],
        "border-color-s": [{ "border-s": [v] }],
        "border-color-e": [{ "border-e": [v] }],
        "border-color-t": [{ "border-t": [v] }],
        "border-color-r": [{ "border-r": [v] }],
        "border-color-b": [{ "border-b": [v] }],
        "border-color-l": [{ "border-l": [v] }],
        "divide-color": [{ divide: [v] }],
        "outline-style": [{ outline: ["", ...W()] }],
        "outline-offset": [{ "outline-offset": [r0, L] }],
        "outline-w": [{ outline: [r0, s0] }],
        "outline-color": [{ outline: [n] }],
        "ring-w": [{ ring: S() }],
        "ring-w-inset": ["ring-inset"],
        "ring-color": [{ ring: [n] }],
        "ring-opacity": [{ "ring-opacity": [E] }],
        "ring-offset-w": [{ "ring-offset": [r0, s0] }],
        "ring-offset-color": [{ "ring-offset": [n] }],
        shadow: [{ shadow: ["", "inner", "none", a0, zr] }],
        "shadow-color": [{ shadow: [y0] }],
        opacity: [{ opacity: [E] }],
        "mix-blend": [{ "mix-blend": [...V(), "plus-lighter", "plus-darker"] }],
        "bg-blend": [{ "bg-blend": V() }],
        filter: [{ filter: ["", "none"] }],
        blur: [{ blur: [t] }],
        brightness: [{ brightness: [e] }],
        contrast: [{ contrast: [C] }],
        "drop-shadow": [{ "drop-shadow": ["", "none", a0, L] }],
        grayscale: [{ grayscale: [r] }],
        "hue-rotate": [{ "hue-rotate": [a] }],
        invert: [{ invert: [B] }],
        saturate: [{ saturate: [c] }],
        sepia: [{ sepia: [A] }],
        "backdrop-filter": [{ "backdrop-filter": ["", "none"] }],
        "backdrop-blur": [{ "backdrop-blur": [t] }],
        "backdrop-brightness": [{ "backdrop-brightness": [e] }],
        "backdrop-contrast": [{ "backdrop-contrast": [C] }],
        "backdrop-grayscale": [{ "backdrop-grayscale": [r] }],
        "backdrop-hue-rotate": [{ "backdrop-hue-rotate": [a] }],
        "backdrop-invert": [{ "backdrop-invert": [B] }],
        "backdrop-opacity": [{ "backdrop-opacity": [E] }],
        "backdrop-saturate": [{ "backdrop-saturate": [c] }],
        "backdrop-sepia": [{ "backdrop-sepia": [A] }],
        "border-collapse": [{ border: ["collapse", "separate"] }],
        "border-spacing": [{ "border-spacing": [b] }],
        "border-spacing-x": [{ "border-spacing-x": [b] }],
        "border-spacing-y": [{ "border-spacing-y": [b] }],
        "table-layout": [{ table: ["auto", "fixed"] }],
        caption: [{ caption: ["top", "bottom"] }],
        transition: [
          {
            transition: [
              "none",
              "all",
              "",
              "colors",
              "opacity",
              "shadow",
              "transform",
              L,
            ],
          },
        ],
        duration: [{ duration: w() }],
        ease: [{ ease: ["linear", "in", "out", "in-out", L] }],
        delay: [{ delay: w() }],
        animate: [{ animate: ["none", "spin", "ping", "pulse", "bounce", L] }],
        transform: [{ transform: ["", "gpu", "none"] }],
        scale: [{ scale: [u] }],
        "scale-x": [{ "scale-x": [u] }],
        "scale-y": [{ "scale-y": [u] }],
        rotate: [{ rotate: [F0, L] }],
        "translate-x": [{ "translate-x": [_] }],
        "translate-y": [{ "translate-y": [_] }],
        "skew-x": [{ "skew-x": [m] }],
        "skew-y": [{ "skew-y": [m] }],
        "transform-origin": [
          {
            origin: [
              "center",
              "top",
              "top-right",
              "right",
              "bottom-right",
              "bottom",
              "bottom-left",
              "left",
              "top-left",
              L,
            ],
          },
        ],
        accent: [{ accent: ["auto", n] }],
        appearance: [{ appearance: ["none", "auto"] }],
        cursor: [
          {
            cursor: [
              "auto",
              "default",
              "pointer",
              "wait",
              "text",
              "move",
              "help",
              "not-allowed",
              "none",
              "context-menu",
              "progress",
              "cell",
              "crosshair",
              "vertical-text",
              "alias",
              "copy",
              "no-drop",
              "grab",
              "grabbing",
              "all-scroll",
              "col-resize",
              "row-resize",
              "n-resize",
              "e-resize",
              "s-resize",
              "w-resize",
              "ne-resize",
              "nw-resize",
              "se-resize",
              "sw-resize",
              "ew-resize",
              "ns-resize",
              "nesw-resize",
              "nwse-resize",
              "zoom-in",
              "zoom-out",
              L,
            ],
          },
        ],
        "caret-color": [{ caret: [n] }],
        "pointer-events": [{ "pointer-events": ["none", "auto"] }],
        resize: [{ resize: ["none", "y", "x", ""] }],
        "scroll-behavior": [{ scroll: ["auto", "smooth"] }],
        "scroll-m": [{ "scroll-m": y() }],
        "scroll-mx": [{ "scroll-mx": y() }],
        "scroll-my": [{ "scroll-my": y() }],
        "scroll-ms": [{ "scroll-ms": y() }],
        "scroll-me": [{ "scroll-me": y() }],
        "scroll-mt": [{ "scroll-mt": y() }],
        "scroll-mr": [{ "scroll-mr": y() }],
        "scroll-mb": [{ "scroll-mb": y() }],
        "scroll-ml": [{ "scroll-ml": y() }],
        "scroll-p": [{ "scroll-p": y() }],
        "scroll-px": [{ "scroll-px": y() }],
        "scroll-py": [{ "scroll-py": y() }],
        "scroll-ps": [{ "scroll-ps": y() }],
        "scroll-pe": [{ "scroll-pe": y() }],
        "scroll-pt": [{ "scroll-pt": y() }],
        "scroll-pr": [{ "scroll-pr": y() }],
        "scroll-pb": [{ "scroll-pb": y() }],
        "scroll-pl": [{ "scroll-pl": y() }],
        "snap-align": [{ snap: ["start", "end", "center", "align-none"] }],
        "snap-stop": [{ snap: ["normal", "always"] }],
        "snap-type": [{ snap: ["none", "x", "y", "both"] }],
        "snap-strictness": [{ snap: ["mandatory", "proximity"] }],
        touch: [{ touch: ["auto", "none", "manipulation"] }],
        "touch-x": [{ "touch-pan": ["x", "left", "right"] }],
        "touch-y": [{ "touch-pan": ["y", "up", "down"] }],
        "touch-pz": ["touch-pinch-zoom"],
        select: [{ select: ["none", "text", "all", "auto"] }],
        "will-change": [
          { "will-change": ["auto", "scroll", "contents", "transform", L] },
        ],
        fill: [{ fill: [n, "none"] }],
        "stroke-w": [{ stroke: [r0, s0, De] }],
        stroke: [{ stroke: [n, "none"] }],
        sr: ["sr-only", "not-sr-only"],
        "forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }],
      },
      conflictingClassGroups: {
        overflow: ["overflow-x", "overflow-y"],
        overscroll: ["overscroll-x", "overscroll-y"],
        inset: [
          "inset-x",
          "inset-y",
          "start",
          "end",
          "top",
          "right",
          "bottom",
          "left",
        ],
        "inset-x": ["right", "left"],
        "inset-y": ["top", "bottom"],
        flex: ["basis", "grow", "shrink"],
        gap: ["gap-x", "gap-y"],
        p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
        px: ["pr", "pl"],
        py: ["pt", "pb"],
        m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
        mx: ["mr", "ml"],
        my: ["mt", "mb"],
        size: ["w", "h"],
        "font-size": ["leading"],
        "fvn-normal": [
          "fvn-ordinal",
          "fvn-slashed-zero",
          "fvn-figure",
          "fvn-spacing",
          "fvn-fraction",
        ],
        "fvn-ordinal": ["fvn-normal"],
        "fvn-slashed-zero": ["fvn-normal"],
        "fvn-figure": ["fvn-normal"],
        "fvn-spacing": ["fvn-normal"],
        "fvn-fraction": ["fvn-normal"],
        "line-clamp": ["display", "overflow"],
        rounded: [
          "rounded-s",
          "rounded-e",
          "rounded-t",
          "rounded-r",
          "rounded-b",
          "rounded-l",
          "rounded-ss",
          "rounded-se",
          "rounded-ee",
          "rounded-es",
          "rounded-tl",
          "rounded-tr",
          "rounded-br",
          "rounded-bl",
        ],
        "rounded-s": ["rounded-ss", "rounded-es"],
        "rounded-e": ["rounded-se", "rounded-ee"],
        "rounded-t": ["rounded-tl", "rounded-tr"],
        "rounded-r": ["rounded-tr", "rounded-br"],
        "rounded-b": ["rounded-br", "rounded-bl"],
        "rounded-l": ["rounded-tl", "rounded-bl"],
        "border-spacing": ["border-spacing-x", "border-spacing-y"],
        "border-w": [
          "border-w-s",
          "border-w-e",
          "border-w-t",
          "border-w-r",
          "border-w-b",
          "border-w-l",
        ],
        "border-w-x": ["border-w-r", "border-w-l"],
        "border-w-y": ["border-w-t", "border-w-b"],
        "border-color": [
          "border-color-s",
          "border-color-e",
          "border-color-t",
          "border-color-r",
          "border-color-b",
          "border-color-l",
        ],
        "border-color-x": ["border-color-r", "border-color-l"],
        "border-color-y": ["border-color-t", "border-color-b"],
        "scroll-m": [
          "scroll-mx",
          "scroll-my",
          "scroll-ms",
          "scroll-me",
          "scroll-mt",
          "scroll-mr",
          "scroll-mb",
          "scroll-ml",
        ],
        "scroll-mx": ["scroll-mr", "scroll-ml"],
        "scroll-my": ["scroll-mt", "scroll-mb"],
        "scroll-p": [
          "scroll-px",
          "scroll-py",
          "scroll-ps",
          "scroll-pe",
          "scroll-pt",
          "scroll-pr",
          "scroll-pb",
          "scroll-pl",
        ],
        "scroll-px": ["scroll-pr", "scroll-pl"],
        "scroll-py": ["scroll-pt", "scroll-pb"],
        touch: ["touch-x", "touch-y", "touch-pz"],
        "touch-x": ["touch"],
        "touch-y": ["touch"],
        "touch-pz": ["touch"],
      },
      conflictingClassGroupModifiers: { "font-size": ["leading"] },
    };
  },
  qr = (
    n,
    {
      cacheSize: o,
      prefix: t,
      separator: e,
      experimentalParseClassName: v,
      extend: x = {},
      override: b = {},
    }
  ) => {
    _0(n, "cacheSize", o),
      _0(n, "prefix", t),
      _0(n, "separator", e),
      _0(n, "experimentalParseClassName", v);
    for (const l in b) Nr(n[l], b[l]);
    for (const l in x) Mr(n[l], x[l]);
    return n;
  },
  _0 = (n, o, t) => {
    t !== void 0 && (n[o] = t);
  },
  Nr = (n, o) => {
    if (o) for (const t in o) _0(n, t, o[t]);
  },
  Mr = (n, o) => {
    if (o)
      for (const t in o) {
        const e = o[t];
        e !== void 0 && (n[t] = (n[t] || []).concat(e));
      }
  },
  pe = class pe {
    constructor() {
      I(this, "config");
      I(this, "twCn");
      (this.config = Lr()), (this.twCn = Qe(() => this.config));
    }
    mergeConfig(o) {
      (this.config = qr(this.config, o)), this.updateTailwindMergeInstance();
    }
    updateTailwindMergeInstance() {
      this.twCn = Qe(() => this.config);
    }
    static getInstance() {
      return this.instance || (this.instance = new pe()), this.instance;
    }
  };
I(pe, "instance");
let _e = pe;
const qt = _e.getInstance(),
  Or = (n) => {
    qt.mergeConfig(n);
  };
Or({ extend: { classGroups: { "font-size": [{ text: ["4.33xl"] }] } } });
const $r = (...n) => qt.twCn(xr(n)),
  gn = $r,
  bn = () => {
    chrome.storage.local.set({ [l0.perm_pop_first_show]: !0 });
  },
  An = (n) => {
    const o = new Date().toISOString();
    chrome.storage.local.set({
      [l0.perm_pop_last_click]: { action: n, timestamp: o },
    });
  },
  Nt = () => chrome.storage.local.get(l0.perm_pop_last_click),
  mn = async () => {
    try {
      const o = (await Nt())[l0.perm_pop_last_click];
      if (await Vr()) return console.log("如果今天已经弹出过"), !1;
      if (!o) return !0;
      const e = o.action;
      return e === l0.perm_click_later
        ? (console.log(
            "上次点击的是maybeLater, 今天还没有弹出过 Permission Popup"
          ),
          !0)
        : e === l0.perm_click_accept
        ? (console.log("上次点击的是accept, 不再弹出 Permission Popup"), !1)
        : !0;
    } catch (n) {
      return console.error("Error in getisPopup:", n), !1;
    }
  },
  Vr = async () => {
    try {
      const o = (await Nt())[l0.perm_pop_last_click];
      if (!o || !o.timestamp) return !1;
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      const e = t.getTime();
      return new Date(o.timestamp).getTime() >= e;
    } catch (n) {
      return console.error("Error in getToDayPopup:", n), !1;
    }
  },
  Dn = async (n) => {
    const o = { type: Ce.TrexGetPrivacyAuth };
    chrome.runtime.sendMessage(o, n);
  },
  Fn = async (n, o) => {
    const t = { type: Ce.TrexAgreePermission, data: { platform: n } };
    chrome.runtime.sendMessage(t, o);
  },
  Gr = async () =>
    new Promise((n, o) => {
      const t = { type: Ce.TrexGetPassportInfo };
      chrome.runtime.sendMessage(t, (e) => {
        chrome.runtime.lastError ? o(chrome.runtime.lastError) : n(e);
      });
    }),
  Ur = async (n) =>
    new Promise((o, t) => {
      const e = { platform: "Youtube", videoId: n },
        v = { type: Ce.TrexSessionInit, data: e };
      chrome.runtime.sendMessage(v, (x) => {
        chrome.runtime.lastError ? t(chrome.runtime.lastError) : o(x);
      });
    }),
  Kr = (n) => {
    const o =
        (n == null ? void 0 : n.width) ||
        (typeof window !== "undefined" ? window.screen.width : 1920),
      t =
        (n == null ? void 0 : n.height) ||
        (typeof window !== "undefined" ? window.screen.height : 1080),
      e = navigator.userAgent,
      v = navigator.language,
      x = navigator.platform,
      b = `${o}x${t}`,
      l = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return btoa(`${e}|${v}|${x}|${b}|${l}`);
  },
  Qr = async () => {
    try {
      return (
        (await (await fetch("https://api.ipify.org?format=json")).json()).ip ||
        ""
      );
    } catch {
      return "";
    }
  };
var H0 = { exports: {} };
function Xr(n) {
  throw new Error(
    'Could not dynamically require "' +
      n +
      '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.'
  );
}
var T0 = { exports: {} };
const Yr = {},
  jr = Object.freeze(
    Object.defineProperty(
      { __proto__: null, default: Yr },
      Symbol.toStringTag,
      { value: "Module" }
    )
  ),
  Zr = nr(jr);
var Jr = T0.exports,
  Xe;
function N() {
  return (
    Xe ||
      ((Xe = 1),
      (function (n, o) {
        (function (t, e) {
          n.exports = e();
        })(Jr, function () {
          var t =
            t ||
            (function (e, v) {
              var x;
              if (
                (typeof window < "u" && window.crypto && (x = window.crypto),
                typeof self < "u" && self.crypto && (x = self.crypto),
                typeof globalThis < "u" &&
                  globalThis.crypto &&
                  (x = globalThis.crypto),
                !x &&
                  typeof window < "u" &&
                  window.msCrypto &&
                  (x = window.msCrypto),
                !x && typeof be < "u" && be.crypto && (x = be.crypto),
                !x && typeof Xr == "function")
              )
                try {
                  x = Zr;
                } catch {}
              var b = function () {
                  if (x) {
                    if (typeof x.getRandomValues == "function")
                      try {
                        return x.getRandomValues(new Uint32Array(1))[0];
                      } catch {}
                    if (typeof x.randomBytes == "function")
                      try {
                        return x.randomBytes(4).readInt32LE();
                      } catch {}
                  }
                  throw new Error(
                    "Native crypto module could not be used to get secure random number."
                  );
                },
                l =
                  Object.create ||
                  (function () {
                    function i() {}
                    return function (c) {
                      var u;
                      return (
                        (i.prototype = c),
                        (u = new i()),
                        (i.prototype = null),
                        u
                      );
                    };
                  })(),
                C = {},
                r = (C.lib = {}),
                a = (r.Base = (function () {
                  return {
                    extend: function (i) {
                      var c = l(this);
                      return (
                        i && c.mixIn(i),
                        (!c.hasOwnProperty("init") || this.init === c.init) &&
                          (c.init = function () {
                            c.$super.init.apply(this, arguments);
                          }),
                        (c.init.prototype = c),
                        (c.$super = this),
                        c
                      );
                    },
                    create: function () {
                      var i = this.extend();
                      return i.init.apply(i, arguments), i;
                    },
                    init: function () {},
                    mixIn: function (i) {
                      for (var c in i) i.hasOwnProperty(c) && (this[c] = i[c]);
                      i.hasOwnProperty("toString") &&
                        (this.toString = i.toString);
                    },
                    clone: function () {
                      return this.init.prototype.extend(this);
                    },
                  };
                })()),
                B = (r.WordArray = a.extend({
                  init: function (i, c) {
                    (i = this.words = i || []),
                      c != v
                        ? (this.sigBytes = c)
                        : (this.sigBytes = i.length * 4);
                  },
                  toString: function (i) {
                    return (i || h).stringify(this);
                  },
                  concat: function (i) {
                    var c = this.words,
                      u = i.words,
                      A = this.sigBytes,
                      m = i.sigBytes;
                    if ((this.clamp(), A % 4))
                      for (var F = 0; F < m; F++) {
                        var _ = (u[F >>> 2] >>> (24 - (F % 4) * 8)) & 255;
                        c[(A + F) >>> 2] |= _ << (24 - ((A + F) % 4) * 8);
                      }
                    else
                      for (var T = 0; T < m; T += 4)
                        c[(A + T) >>> 2] = u[T >>> 2];
                    return (this.sigBytes += m), this;
                  },
                  clamp: function () {
                    var i = this.words,
                      c = this.sigBytes;
                    (i[c >>> 2] &= 4294967295 << (32 - (c % 4) * 8)),
                      (i.length = e.ceil(c / 4));
                  },
                  clone: function () {
                    var i = a.clone.call(this);
                    return (i.words = this.words.slice(0)), i;
                  },
                  random: function (i) {
                    for (var c = [], u = 0; u < i; u += 4) c.push(b());
                    return new B.init(c, i);
                  },
                })),
                s = (C.enc = {}),
                h = (s.Hex = {
                  stringify: function (i) {
                    for (
                      var c = i.words, u = i.sigBytes, A = [], m = 0;
                      m < u;
                      m++
                    ) {
                      var F = (c[m >>> 2] >>> (24 - (m % 4) * 8)) & 255;
                      A.push((F >>> 4).toString(16)),
                        A.push((F & 15).toString(16));
                    }
                    return A.join("");
                  },
                  parse: function (i) {
                    for (var c = i.length, u = [], A = 0; A < c; A += 2)
                      u[A >>> 3] |=
                        parseInt(i.substr(A, 2), 16) << (24 - (A % 8) * 4);
                    return new B.init(u, c / 2);
                  },
                }),
                d = (s.Latin1 = {
                  stringify: function (i) {
                    for (
                      var c = i.words, u = i.sigBytes, A = [], m = 0;
                      m < u;
                      m++
                    ) {
                      var F = (c[m >>> 2] >>> (24 - (m % 4) * 8)) & 255;
                      A.push(String.fromCharCode(F));
                    }
                    return A.join("");
                  },
                  parse: function (i) {
                    for (var c = i.length, u = [], A = 0; A < c; A++)
                      u[A >>> 2] |=
                        (i.charCodeAt(A) & 255) << (24 - (A % 4) * 8);
                    return new B.init(u, c);
                  },
                }),
                p = (s.Utf8 = {
                  stringify: function (i) {
                    try {
                      return decodeURIComponent(escape(d.stringify(i)));
                    } catch {
                      throw new Error("Malformed UTF-8 data");
                    }
                  },
                  parse: function (i) {
                    return d.parse(unescape(encodeURIComponent(i)));
                  },
                }),
                f = (r.BufferedBlockAlgorithm = a.extend({
                  reset: function () {
                    (this._data = new B.init()), (this._nDataBytes = 0);
                  },
                  _append: function (i) {
                    typeof i == "string" && (i = p.parse(i)),
                      this._data.concat(i),
                      (this._nDataBytes += i.sigBytes);
                  },
                  _process: function (i) {
                    var c,
                      u = this._data,
                      A = u.words,
                      m = u.sigBytes,
                      F = this.blockSize,
                      _ = F * 4,
                      T = m / _;
                    i
                      ? (T = e.ceil(T))
                      : (T = e.max((T | 0) - this._minBufferSize, 0));
                    var g = T * F,
                      D = e.min(g * 4, m);
                    if (g) {
                      for (var y = 0; y < g; y += F) this._doProcessBlock(A, y);
                      (c = A.splice(0, g)), (u.sigBytes -= D);
                    }
                    return new B.init(c, D);
                  },
                  clone: function () {
                    var i = a.clone.call(this);
                    return (i._data = this._data.clone()), i;
                  },
                  _minBufferSize: 0,
                }));
              r.Hasher = f.extend({
                cfg: a.extend(),
                init: function (i) {
                  (this.cfg = this.cfg.extend(i)), this.reset();
                },
                reset: function () {
                  f.reset.call(this), this._doReset();
                },
                update: function (i) {
                  return this._append(i), this._process(), this;
                },
                finalize: function (i) {
                  i && this._append(i);
                  var c = this._doFinalize();
                  return c;
                },
                blockSize: 16,
                _createHelper: function (i) {
                  return function (c, u) {
                    return new i.init(u).finalize(c);
                  };
                },
                _createHmacHelper: function (i) {
                  return function (c, u) {
                    return new E.HMAC.init(i, u).finalize(c);
                  };
                },
              });
              var E = (C.algo = {});
              return C;
            })(Math);
          return t;
        });
      })(T0)),
    T0.exports
  );
}
var z0 = { exports: {} },
  eo = z0.exports,
  Ye;
function Ee() {
  return (
    Ye ||
      ((Ye = 1),
      (function (n, o) {
        (function (t, e) {
          n.exports = e(N());
        })(eo, function (t) {
          return (
            (function (e) {
              var v = t,
                x = v.lib,
                b = x.Base,
                l = x.WordArray,
                C = (v.x64 = {});
              (C.Word = b.extend({
                init: function (r, a) {
                  (this.high = r), (this.low = a);
                },
              })),
                (C.WordArray = b.extend({
                  init: function (r, a) {
                    (r = this.words = r || []),
                      a != e
                        ? (this.sigBytes = a)
                        : (this.sigBytes = r.length * 8);
                  },
                  toX32: function () {
                    for (
                      var r = this.words, a = r.length, B = [], s = 0;
                      s < a;
                      s++
                    ) {
                      var h = r[s];
                      B.push(h.high), B.push(h.low);
                    }
                    return l.create(B, this.sigBytes);
                  },
                  clone: function () {
                    for (
                      var r = b.clone.call(this),
                        a = (r.words = this.words.slice(0)),
                        B = a.length,
                        s = 0;
                      s < B;
                      s++
                    )
                      a[s] = a[s].clone();
                    return r;
                  },
                }));
            })(),
            t
          );
        });
      })(z0)),
    z0.exports
  );
}
var I0 = { exports: {} },
  to = I0.exports,
  je;
function ro() {
  return (
    je ||
      ((je = 1),
      (function (n, o) {
        (function (t, e) {
          n.exports = e(N());
        })(to, function (t) {
          return (
            (function () {
              if (typeof ArrayBuffer == "function") {
                var e = t,
                  v = e.lib,
                  x = v.WordArray,
                  b = x.init,
                  l = (x.init = function (C) {
                    if (
                      (C instanceof ArrayBuffer && (C = new Uint8Array(C)),
                      (C instanceof Int8Array ||
                        (typeof Uint8ClampedArray < "u" &&
                          C instanceof Uint8ClampedArray) ||
                        C instanceof Int16Array ||
                        C instanceof Uint16Array ||
                        C instanceof Int32Array ||
                        C instanceof Uint32Array ||
                        C instanceof Float32Array ||
                        C instanceof Float64Array) &&
                        (C = new Uint8Array(
                          C.buffer,
                          C.byteOffset,
                          C.byteLength
                        )),
                      C instanceof Uint8Array)
                    ) {
                      for (var r = C.byteLength, a = [], B = 0; B < r; B++)
                        a[B >>> 2] |= C[B] << (24 - (B % 4) * 8);
                      b.call(this, a, r);
                    } else b.apply(this, arguments);
                  });
                l.prototype = x;
              }
            })(),
            t.lib.WordArray
          );
        });
      })(I0)),
    I0.exports
  );
}
var P0 = { exports: {} },
  oo = P0.exports,
  Ze;
function no() {
  return (
    Ze ||
      ((Ze = 1),
      (function (n, o) {
        (function (t, e) {
          n.exports = e(N());
        })(oo, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.WordArray,
                b = e.enc;
              (b.Utf16 = b.Utf16BE =
                {
                  stringify: function (C) {
                    for (
                      var r = C.words, a = C.sigBytes, B = [], s = 0;
                      s < a;
                      s += 2
                    ) {
                      var h = (r[s >>> 2] >>> (16 - (s % 4) * 8)) & 65535;
                      B.push(String.fromCharCode(h));
                    }
                    return B.join("");
                  },
                  parse: function (C) {
                    for (var r = C.length, a = [], B = 0; B < r; B++)
                      a[B >>> 1] |= C.charCodeAt(B) << (16 - (B % 2) * 16);
                    return x.create(a, r * 2);
                  },
                }),
                (b.Utf16LE = {
                  stringify: function (C) {
                    for (
                      var r = C.words, a = C.sigBytes, B = [], s = 0;
                      s < a;
                      s += 2
                    ) {
                      var h = l((r[s >>> 2] >>> (16 - (s % 4) * 8)) & 65535);
                      B.push(String.fromCharCode(h));
                    }
                    return B.join("");
                  },
                  parse: function (C) {
                    for (var r = C.length, a = [], B = 0; B < r; B++)
                      a[B >>> 1] |= l(C.charCodeAt(B) << (16 - (B % 2) * 16));
                    return x.create(a, r * 2);
                  },
                });
              function l(C) {
                return ((C << 8) & 4278255360) | ((C >>> 8) & 16711935);
              }
            })(),
            t.enc.Utf16
          );
        });
      })(P0)),
    P0.exports
  );
}
var W0 = { exports: {} },
  so = W0.exports,
  Je;
function f0() {
  return (
    Je ||
      ((Je = 1),
      (function (n, o) {
        (function (t, e) {
          n.exports = e(N());
        })(so, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.WordArray,
                b = e.enc;
              b.Base64 = {
                stringify: function (C) {
                  var r = C.words,
                    a = C.sigBytes,
                    B = this._map;
                  C.clamp();
                  for (var s = [], h = 0; h < a; h += 3)
                    for (
                      var d = (r[h >>> 2] >>> (24 - (h % 4) * 8)) & 255,
                        p =
                          (r[(h + 1) >>> 2] >>> (24 - ((h + 1) % 4) * 8)) & 255,
                        f =
                          (r[(h + 2) >>> 2] >>> (24 - ((h + 2) % 4) * 8)) & 255,
                        E = (d << 16) | (p << 8) | f,
                        i = 0;
                      i < 4 && h + i * 0.75 < a;
                      i++
                    )
                      s.push(B.charAt((E >>> (6 * (3 - i))) & 63));
                  var c = B.charAt(64);
                  if (c) for (; s.length % 4; ) s.push(c);
                  return s.join("");
                },
                parse: function (C) {
                  var r = C.length,
                    a = this._map,
                    B = this._reverseMap;
                  if (!B) {
                    B = this._reverseMap = [];
                    for (var s = 0; s < a.length; s++) B[a.charCodeAt(s)] = s;
                  }
                  var h = a.charAt(64);
                  if (h) {
                    var d = C.indexOf(h);
                    d !== -1 && (r = d);
                  }
                  return l(C, r, B);
                },
                _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
              };
              function l(C, r, a) {
                for (var B = [], s = 0, h = 0; h < r; h++)
                  if (h % 4) {
                    var d = a[C.charCodeAt(h - 1)] << ((h % 4) * 2),
                      p = a[C.charCodeAt(h)] >>> (6 - (h % 4) * 2),
                      f = d | p;
                    (B[s >>> 2] |= f << (24 - (s % 4) * 8)), s++;
                  }
                return x.create(B, s);
              }
            })(),
            t.enc.Base64
          );
        });
      })(W0)),
    W0.exports
  );
}
var L0 = { exports: {} },
  ao = L0.exports,
  et;
function io() {
  return (
    et ||
      ((et = 1),
      (function (n, o) {
        (function (t, e) {
          n.exports = e(N());
        })(ao, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.WordArray,
                b = e.enc;
              b.Base64url = {
                stringify: function (C, r) {
                  r === void 0 && (r = !0);
                  var a = C.words,
                    B = C.sigBytes,
                    s = r ? this._safe_map : this._map;
                  C.clamp();
                  for (var h = [], d = 0; d < B; d += 3)
                    for (
                      var p = (a[d >>> 2] >>> (24 - (d % 4) * 8)) & 255,
                        f =
                          (a[(d + 1) >>> 2] >>> (24 - ((d + 1) % 4) * 8)) & 255,
                        E =
                          (a[(d + 2) >>> 2] >>> (24 - ((d + 2) % 4) * 8)) & 255,
                        i = (p << 16) | (f << 8) | E,
                        c = 0;
                      c < 4 && d + c * 0.75 < B;
                      c++
                    )
                      h.push(s.charAt((i >>> (6 * (3 - c))) & 63));
                  var u = s.charAt(64);
                  if (u) for (; h.length % 4; ) h.push(u);
                  return h.join("");
                },
                parse: function (C, r) {
                  r === void 0 && (r = !0);
                  var a = C.length,
                    B = r ? this._safe_map : this._map,
                    s = this._reverseMap;
                  if (!s) {
                    s = this._reverseMap = [];
                    for (var h = 0; h < B.length; h++) s[B.charCodeAt(h)] = h;
                  }
                  var d = B.charAt(64);
                  if (d) {
                    var p = C.indexOf(d);
                    p !== -1 && (a = p);
                  }
                  return l(C, a, s);
                },
                _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                _safe_map:
                  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
              };
              function l(C, r, a) {
                for (var B = [], s = 0, h = 0; h < r; h++)
                  if (h % 4) {
                    var d = a[C.charCodeAt(h - 1)] << ((h % 4) * 2),
                      p = a[C.charCodeAt(h)] >>> (6 - (h % 4) * 2),
                      f = d | p;
                    (B[s >>> 2] |= f << (24 - (s % 4) * 8)), s++;
                  }
                return x.create(B, s);
              }
            })(),
            t.enc.Base64url
          );
        });
      })(L0)),
    L0.exports
  );
}
var q0 = { exports: {} },
  xo = q0.exports,
  tt;
function d0() {
  return (
    tt ||
      ((tt = 1),
      (function (n, o) {
        (function (t, e) {
          n.exports = e(N());
        })(xo, function (t) {
          return (
            (function (e) {
              var v = t,
                x = v.lib,
                b = x.WordArray,
                l = x.Hasher,
                C = v.algo,
                r = [];
              (function () {
                for (var p = 0; p < 64; p++)
                  r[p] = (e.abs(e.sin(p + 1)) * 4294967296) | 0;
              })();
              var a = (C.MD5 = l.extend({
                _doReset: function () {
                  this._hash = new b.init([
                    1732584193, 4023233417, 2562383102, 271733878,
                  ]);
                },
                _doProcessBlock: function (p, f) {
                  for (var E = 0; E < 16; E++) {
                    var i = f + E,
                      c = p[i];
                    p[i] =
                      (((c << 8) | (c >>> 24)) & 16711935) |
                      (((c << 24) | (c >>> 8)) & 4278255360);
                  }
                  var u = this._hash.words,
                    A = p[f + 0],
                    m = p[f + 1],
                    F = p[f + 2],
                    _ = p[f + 3],
                    T = p[f + 4],
                    g = p[f + 5],
                    D = p[f + 6],
                    y = p[f + 7],
                    S = p[f + 8],
                    z = p[f + 9],
                    P = p[f + 10],
                    W = p[f + 11],
                    V = p[f + 12],
                    M = p[f + 13],
                    O = p[f + 14],
                    $ = p[f + 15],
                    w = u[0],
                    R = u[1],
                    H = u[2],
                    k = u[3];
                  (w = B(w, R, H, k, A, 7, r[0])),
                    (k = B(k, w, R, H, m, 12, r[1])),
                    (H = B(H, k, w, R, F, 17, r[2])),
                    (R = B(R, H, k, w, _, 22, r[3])),
                    (w = B(w, R, H, k, T, 7, r[4])),
                    (k = B(k, w, R, H, g, 12, r[5])),
                    (H = B(H, k, w, R, D, 17, r[6])),
                    (R = B(R, H, k, w, y, 22, r[7])),
                    (w = B(w, R, H, k, S, 7, r[8])),
                    (k = B(k, w, R, H, z, 12, r[9])),
                    (H = B(H, k, w, R, P, 17, r[10])),
                    (R = B(R, H, k, w, W, 22, r[11])),
                    (w = B(w, R, H, k, V, 7, r[12])),
                    (k = B(k, w, R, H, M, 12, r[13])),
                    (H = B(H, k, w, R, O, 17, r[14])),
                    (R = B(R, H, k, w, $, 22, r[15])),
                    (w = s(w, R, H, k, m, 5, r[16])),
                    (k = s(k, w, R, H, D, 9, r[17])),
                    (H = s(H, k, w, R, W, 14, r[18])),
                    (R = s(R, H, k, w, A, 20, r[19])),
                    (w = s(w, R, H, k, g, 5, r[20])),
                    (k = s(k, w, R, H, P, 9, r[21])),
                    (H = s(H, k, w, R, $, 14, r[22])),
                    (R = s(R, H, k, w, T, 20, r[23])),
                    (w = s(w, R, H, k, z, 5, r[24])),
                    (k = s(k, w, R, H, O, 9, r[25])),
                    (H = s(H, k, w, R, _, 14, r[26])),
                    (R = s(R, H, k, w, S, 20, r[27])),
                    (w = s(w, R, H, k, M, 5, r[28])),
                    (k = s(k, w, R, H, F, 9, r[29])),
                    (H = s(H, k, w, R, y, 14, r[30])),
                    (R = s(R, H, k, w, V, 20, r[31])),
                    (w = h(w, R, H, k, g, 4, r[32])),
                    (k = h(k, w, R, H, S, 11, r[33])),
                    (H = h(H, k, w, R, W, 16, r[34])),
                    (R = h(R, H, k, w, O, 23, r[35])),
                    (w = h(w, R, H, k, m, 4, r[36])),
                    (k = h(k, w, R, H, T, 11, r[37])),
                    (H = h(H, k, w, R, y, 16, r[38])),
                    (R = h(R, H, k, w, P, 23, r[39])),
                    (w = h(w, R, H, k, M, 4, r[40])),
                    (k = h(k, w, R, H, A, 11, r[41])),
                    (H = h(H, k, w, R, _, 16, r[42])),
                    (R = h(R, H, k, w, D, 23, r[43])),
                    (w = h(w, R, H, k, z, 4, r[44])),
                    (k = h(k, w, R, H, V, 11, r[45])),
                    (H = h(H, k, w, R, $, 16, r[46])),
                    (R = h(R, H, k, w, F, 23, r[47])),
                    (w = d(w, R, H, k, A, 6, r[48])),
                    (k = d(k, w, R, H, y, 10, r[49])),
                    (H = d(H, k, w, R, O, 15, r[50])),
                    (R = d(R, H, k, w, g, 21, r[51])),
                    (w = d(w, R, H, k, V, 6, r[52])),
                    (k = d(k, w, R, H, _, 10, r[53])),
                    (H = d(H, k, w, R, P, 15, r[54])),
                    (R = d(R, H, k, w, m, 21, r[55])),
                    (w = d(w, R, H, k, S, 6, r[56])),
                    (k = d(k, w, R, H, $, 10, r[57])),
                    (H = d(H, k, w, R, D, 15, r[58])),
                    (R = d(R, H, k, w, M, 21, r[59])),
                    (w = d(w, R, H, k, T, 6, r[60])),
                    (k = d(k, w, R, H, W, 10, r[61])),
                    (H = d(H, k, w, R, F, 15, r[62])),
                    (R = d(R, H, k, w, z, 21, r[63])),
                    (u[0] = (u[0] + w) | 0),
                    (u[1] = (u[1] + R) | 0),
                    (u[2] = (u[2] + H) | 0),
                    (u[3] = (u[3] + k) | 0);
                },
                _doFinalize: function () {
                  var p = this._data,
                    f = p.words,
                    E = this._nDataBytes * 8,
                    i = p.sigBytes * 8;
                  f[i >>> 5] |= 128 << (24 - (i % 32));
                  var c = e.floor(E / 4294967296),
                    u = E;
                  (f[(((i + 64) >>> 9) << 4) + 15] =
                    (((c << 8) | (c >>> 24)) & 16711935) |
                    (((c << 24) | (c >>> 8)) & 4278255360)),
                    (f[(((i + 64) >>> 9) << 4) + 14] =
                      (((u << 8) | (u >>> 24)) & 16711935) |
                      (((u << 24) | (u >>> 8)) & 4278255360)),
                    (p.sigBytes = (f.length + 1) * 4),
                    this._process();
                  for (var A = this._hash, m = A.words, F = 0; F < 4; F++) {
                    var _ = m[F];
                    m[F] =
                      (((_ << 8) | (_ >>> 24)) & 16711935) |
                      (((_ << 24) | (_ >>> 8)) & 4278255360);
                  }
                  return A;
                },
                clone: function () {
                  var p = l.clone.call(this);
                  return (p._hash = this._hash.clone()), p;
                },
              }));
              function B(p, f, E, i, c, u, A) {
                var m = p + ((f & E) | (~f & i)) + c + A;
                return ((m << u) | (m >>> (32 - u))) + f;
              }
              function s(p, f, E, i, c, u, A) {
                var m = p + ((f & i) | (E & ~i)) + c + A;
                return ((m << u) | (m >>> (32 - u))) + f;
              }
              function h(p, f, E, i, c, u, A) {
                var m = p + (f ^ E ^ i) + c + A;
                return ((m << u) | (m >>> (32 - u))) + f;
              }
              function d(p, f, E, i, c, u, A) {
                var m = p + (E ^ (f | ~i)) + c + A;
                return ((m << u) | (m >>> (32 - u))) + f;
              }
              (v.MD5 = l._createHelper(a)),
                (v.HmacMD5 = l._createHmacHelper(a));
            })(Math),
            t.MD5
          );
        });
      })(q0)),
    q0.exports
  );
}
var N0 = { exports: {} },
  co = N0.exports,
  rt;
function Mt() {
  return (
    rt ||
      ((rt = 1),
      (function (n, o) {
        (function (t, e) {
          n.exports = e(N());
        })(co, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.WordArray,
                b = v.Hasher,
                l = e.algo,
                C = [],
                r = (l.SHA1 = b.extend({
                  _doReset: function () {
                    this._hash = new x.init([
                      1732584193, 4023233417, 2562383102, 271733878, 3285377520,
                    ]);
                  },
                  _doProcessBlock: function (a, B) {
                    for (
                      var s = this._hash.words,
                        h = s[0],
                        d = s[1],
                        p = s[2],
                        f = s[3],
                        E = s[4],
                        i = 0;
                      i < 80;
                      i++
                    ) {
                      if (i < 16) C[i] = a[B + i] | 0;
                      else {
                        var c = C[i - 3] ^ C[i - 8] ^ C[i - 14] ^ C[i - 16];
                        C[i] = (c << 1) | (c >>> 31);
                      }
                      var u = ((h << 5) | (h >>> 27)) + E + C[i];
                      i < 20
                        ? (u += ((d & p) | (~d & f)) + 1518500249)
                        : i < 40
                        ? (u += (d ^ p ^ f) + 1859775393)
                        : i < 60
                        ? (u += ((d & p) | (d & f) | (p & f)) - 1894007588)
                        : (u += (d ^ p ^ f) - 899497514),
                        (E = f),
                        (f = p),
                        (p = (d << 30) | (d >>> 2)),
                        (d = h),
                        (h = u);
                    }
                    (s[0] = (s[0] + h) | 0),
                      (s[1] = (s[1] + d) | 0),
                      (s[2] = (s[2] + p) | 0),
                      (s[3] = (s[3] + f) | 0),
                      (s[4] = (s[4] + E) | 0);
                  },
                  _doFinalize: function () {
                    var a = this._data,
                      B = a.words,
                      s = this._nDataBytes * 8,
                      h = a.sigBytes * 8;
                    return (
                      (B[h >>> 5] |= 128 << (24 - (h % 32))),
                      (B[(((h + 64) >>> 9) << 4) + 14] = Math.floor(
                        s / 4294967296
                      )),
                      (B[(((h + 64) >>> 9) << 4) + 15] = s),
                      (a.sigBytes = B.length * 4),
                      this._process(),
                      this._hash
                    );
                  },
                  clone: function () {
                    var a = b.clone.call(this);
                    return (a._hash = this._hash.clone()), a;
                  },
                }));
              (e.SHA1 = b._createHelper(r)),
                (e.HmacSHA1 = b._createHmacHelper(r));
            })(),
            t.SHA1
          );
        });
      })(N0)),
    N0.exports
  );
}
var M0 = { exports: {} },
  lo = M0.exports,
  ot;
function Re() {
  return (
    ot ||
      ((ot = 1),
      (function (n, o) {
        (function (t, e) {
          n.exports = e(N());
        })(lo, function (t) {
          return (
            (function (e) {
              var v = t,
                x = v.lib,
                b = x.WordArray,
                l = x.Hasher,
                C = v.algo,
                r = [],
                a = [];
              (function () {
                function h(E) {
                  for (var i = e.sqrt(E), c = 2; c <= i; c++)
                    if (!(E % c)) return !1;
                  return !0;
                }
                function d(E) {
                  return ((E - (E | 0)) * 4294967296) | 0;
                }
                for (var p = 2, f = 0; f < 64; )
                  h(p) &&
                    (f < 8 && (r[f] = d(e.pow(p, 1 / 2))),
                    (a[f] = d(e.pow(p, 1 / 3))),
                    f++),
                    p++;
              })();
              var B = [],
                s = (C.SHA256 = l.extend({
                  _doReset: function () {
                    this._hash = new b.init(r.slice(0));
                  },
                  _doProcessBlock: function (h, d) {
                    for (
                      var p = this._hash.words,
                        f = p[0],
                        E = p[1],
                        i = p[2],
                        c = p[3],
                        u = p[4],
                        A = p[5],
                        m = p[6],
                        F = p[7],
                        _ = 0;
                      _ < 64;
                      _++
                    ) {
                      if (_ < 16) B[_] = h[d + _] | 0;
                      else {
                        var T = B[_ - 15],
                          g =
                            ((T << 25) | (T >>> 7)) ^
                            ((T << 14) | (T >>> 18)) ^
                            (T >>> 3),
                          D = B[_ - 2],
                          y =
                            ((D << 15) | (D >>> 17)) ^
                            ((D << 13) | (D >>> 19)) ^
                            (D >>> 10);
                        B[_] = g + B[_ - 7] + y + B[_ - 16];
                      }
                      var S = (u & A) ^ (~u & m),
                        z = (f & E) ^ (f & i) ^ (E & i),
                        P =
                          ((f << 30) | (f >>> 2)) ^
                          ((f << 19) | (f >>> 13)) ^
                          ((f << 10) | (f >>> 22)),
                        W =
                          ((u << 26) | (u >>> 6)) ^
                          ((u << 21) | (u >>> 11)) ^
                          ((u << 7) | (u >>> 25)),
                        V = F + W + S + a[_] + B[_],
                        M = P + z;
                      (F = m),
                        (m = A),
                        (A = u),
                        (u = (c + V) | 0),
                        (c = i),
                        (i = E),
                        (E = f),
                        (f = (V + M) | 0);
                    }
                    (p[0] = (p[0] + f) | 0),
                      (p[1] = (p[1] + E) | 0),
                      (p[2] = (p[2] + i) | 0),
                      (p[3] = (p[3] + c) | 0),
                      (p[4] = (p[4] + u) | 0),
                      (p[5] = (p[5] + A) | 0),
                      (p[6] = (p[6] + m) | 0),
                      (p[7] = (p[7] + F) | 0);
                  },
                  _doFinalize: function () {
                    var h = this._data,
                      d = h.words,
                      p = this._nDataBytes * 8,
                      f = h.sigBytes * 8;
                    return (
                      (d[f >>> 5] |= 128 << (24 - (f % 32))),
                      (d[(((f + 64) >>> 9) << 4) + 14] = e.floor(
                        p / 4294967296
                      )),
                      (d[(((f + 64) >>> 9) << 4) + 15] = p),
                      (h.sigBytes = d.length * 4),
                      this._process(),
                      this._hash
                    );
                  },
                  clone: function () {
                    var h = l.clone.call(this);
                    return (h._hash = this._hash.clone()), h;
                  },
                }));
              (v.SHA256 = l._createHelper(s)),
                (v.HmacSHA256 = l._createHmacHelper(s));
            })(Math),
            t.SHA256
          );
        });
      })(M0)),
    M0.exports
  );
}
var O0 = { exports: {} },
  fo = O0.exports,
  nt;
function uo() {
  return (
    nt ||
      ((nt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Re());
        })(fo, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.WordArray,
                b = e.algo,
                l = b.SHA256,
                C = (b.SHA224 = l.extend({
                  _doReset: function () {
                    this._hash = new x.init([
                      3238371032, 914150663, 812702999, 4144912697, 4290775857,
                      1750603025, 1694076839, 3204075428,
                    ]);
                  },
                  _doFinalize: function () {
                    var r = l._doFinalize.call(this);
                    return (r.sigBytes -= 4), r;
                  },
                }));
              (e.SHA224 = l._createHelper(C)),
                (e.HmacSHA224 = l._createHmacHelper(C));
            })(),
            t.SHA224
          );
        });
      })(O0)),
    O0.exports
  );
}
var $0 = { exports: {} },
  ho = $0.exports,
  st;
function Ot() {
  return (
    st ||
      ((st = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Ee());
        })(ho, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.Hasher,
                b = e.x64,
                l = b.Word,
                C = b.WordArray,
                r = e.algo;
              function a() {
                return l.create.apply(l, arguments);
              }
              var B = [
                  a(1116352408, 3609767458),
                  a(1899447441, 602891725),
                  a(3049323471, 3964484399),
                  a(3921009573, 2173295548),
                  a(961987163, 4081628472),
                  a(1508970993, 3053834265),
                  a(2453635748, 2937671579),
                  a(2870763221, 3664609560),
                  a(3624381080, 2734883394),
                  a(310598401, 1164996542),
                  a(607225278, 1323610764),
                  a(1426881987, 3590304994),
                  a(1925078388, 4068182383),
                  a(2162078206, 991336113),
                  a(2614888103, 633803317),
                  a(3248222580, 3479774868),
                  a(3835390401, 2666613458),
                  a(4022224774, 944711139),
                  a(264347078, 2341262773),
                  a(604807628, 2007800933),
                  a(770255983, 1495990901),
                  a(1249150122, 1856431235),
                  a(1555081692, 3175218132),
                  a(1996064986, 2198950837),
                  a(2554220882, 3999719339),
                  a(2821834349, 766784016),
                  a(2952996808, 2566594879),
                  a(3210313671, 3203337956),
                  a(3336571891, 1034457026),
                  a(3584528711, 2466948901),
                  a(113926993, 3758326383),
                  a(338241895, 168717936),
                  a(666307205, 1188179964),
                  a(773529912, 1546045734),
                  a(1294757372, 1522805485),
                  a(1396182291, 2643833823),
                  a(1695183700, 2343527390),
                  a(1986661051, 1014477480),
                  a(2177026350, 1206759142),
                  a(2456956037, 344077627),
                  a(2730485921, 1290863460),
                  a(2820302411, 3158454273),
                  a(3259730800, 3505952657),
                  a(3345764771, 106217008),
                  a(3516065817, 3606008344),
                  a(3600352804, 1432725776),
                  a(4094571909, 1467031594),
                  a(275423344, 851169720),
                  a(430227734, 3100823752),
                  a(506948616, 1363258195),
                  a(659060556, 3750685593),
                  a(883997877, 3785050280),
                  a(958139571, 3318307427),
                  a(1322822218, 3812723403),
                  a(1537002063, 2003034995),
                  a(1747873779, 3602036899),
                  a(1955562222, 1575990012),
                  a(2024104815, 1125592928),
                  a(2227730452, 2716904306),
                  a(2361852424, 442776044),
                  a(2428436474, 593698344),
                  a(2756734187, 3733110249),
                  a(3204031479, 2999351573),
                  a(3329325298, 3815920427),
                  a(3391569614, 3928383900),
                  a(3515267271, 566280711),
                  a(3940187606, 3454069534),
                  a(4118630271, 4000239992),
                  a(116418474, 1914138554),
                  a(174292421, 2731055270),
                  a(289380356, 3203993006),
                  a(460393269, 320620315),
                  a(685471733, 587496836),
                  a(852142971, 1086792851),
                  a(1017036298, 365543100),
                  a(1126000580, 2618297676),
                  a(1288033470, 3409855158),
                  a(1501505948, 4234509866),
                  a(1607167915, 987167468),
                  a(1816402316, 1246189591),
                ],
                s = [];
              (function () {
                for (var d = 0; d < 80; d++) s[d] = a();
              })();
              var h = (r.SHA512 = x.extend({
                _doReset: function () {
                  this._hash = new C.init([
                    new l.init(1779033703, 4089235720),
                    new l.init(3144134277, 2227873595),
                    new l.init(1013904242, 4271175723),
                    new l.init(2773480762, 1595750129),
                    new l.init(1359893119, 2917565137),
                    new l.init(2600822924, 725511199),
                    new l.init(528734635, 4215389547),
                    new l.init(1541459225, 327033209),
                  ]);
                },
                _doProcessBlock: function (d, p) {
                  for (
                    var f = this._hash.words,
                      E = f[0],
                      i = f[1],
                      c = f[2],
                      u = f[3],
                      A = f[4],
                      m = f[5],
                      F = f[6],
                      _ = f[7],
                      T = E.high,
                      g = E.low,
                      D = i.high,
                      y = i.low,
                      S = c.high,
                      z = c.low,
                      P = u.high,
                      W = u.low,
                      V = A.high,
                      M = A.low,
                      O = m.high,
                      $ = m.low,
                      w = F.high,
                      R = F.low,
                      H = _.high,
                      k = _.low,
                      K = T,
                      G = g,
                      X = D,
                      q = y,
                      E0 = S,
                      u0 = z,
                      Be = P,
                      B0 = W,
                      e0 = V,
                      j = M,
                      w0 = O,
                      g0 = $,
                      S0 = w,
                      b0 = R,
                      ge = H,
                      A0 = k,
                      t0 = 0;
                    t0 < 80;
                    t0++
                  ) {
                    var J,
                      o0,
                      k0 = s[t0];
                    if (t0 < 16)
                      (o0 = k0.high = d[p + t0 * 2] | 0),
                        (J = k0.low = d[p + t0 * 2 + 1] | 0);
                    else {
                      var Te = s[t0 - 15],
                        h0 = Te.high,
                        m0 = Te.low,
                        $t =
                          ((h0 >>> 1) | (m0 << 31)) ^
                          ((h0 >>> 8) | (m0 << 24)) ^
                          (h0 >>> 7),
                        ze =
                          ((m0 >>> 1) | (h0 << 31)) ^
                          ((m0 >>> 8) | (h0 << 24)) ^
                          ((m0 >>> 7) | (h0 << 25)),
                        Ie = s[t0 - 2],
                        v0 = Ie.high,
                        D0 = Ie.low,
                        Vt =
                          ((v0 >>> 19) | (D0 << 13)) ^
                          ((v0 << 3) | (D0 >>> 29)) ^
                          (v0 >>> 6),
                        Pe =
                          ((D0 >>> 19) | (v0 << 13)) ^
                          ((D0 << 3) | (v0 >>> 29)) ^
                          ((D0 >>> 6) | (v0 << 26)),
                        We = s[t0 - 7],
                        Gt = We.high,
                        Ut = We.low,
                        Le = s[t0 - 16],
                        Kt = Le.high,
                        qe = Le.low;
                      (J = ze + Ut),
                        (o0 = $t + Gt + (J >>> 0 < ze >>> 0 ? 1 : 0)),
                        (J = J + Pe),
                        (o0 = o0 + Vt + (J >>> 0 < Pe >>> 0 ? 1 : 0)),
                        (J = J + qe),
                        (o0 = o0 + Kt + (J >>> 0 < qe >>> 0 ? 1 : 0)),
                        (k0.high = o0),
                        (k0.low = J);
                    }
                    var Qt = (e0 & w0) ^ (~e0 & S0),
                      Ne = (j & g0) ^ (~j & b0),
                      Xt = (K & X) ^ (K & E0) ^ (X & E0),
                      Yt = (G & q) ^ (G & u0) ^ (q & u0),
                      jt =
                        ((K >>> 28) | (G << 4)) ^
                        ((K << 30) | (G >>> 2)) ^
                        ((K << 25) | (G >>> 7)),
                      Me =
                        ((G >>> 28) | (K << 4)) ^
                        ((G << 30) | (K >>> 2)) ^
                        ((G << 25) | (K >>> 7)),
                      Zt =
                        ((e0 >>> 14) | (j << 18)) ^
                        ((e0 >>> 18) | (j << 14)) ^
                        ((e0 << 23) | (j >>> 9)),
                      Jt =
                        ((j >>> 14) | (e0 << 18)) ^
                        ((j >>> 18) | (e0 << 14)) ^
                        ((j << 23) | (e0 >>> 9)),
                      Oe = B[t0],
                      er = Oe.high,
                      $e = Oe.low,
                      Z = A0 + Jt,
                      n0 = ge + Zt + (Z >>> 0 < A0 >>> 0 ? 1 : 0),
                      Z = Z + Ne,
                      n0 = n0 + Qt + (Z >>> 0 < Ne >>> 0 ? 1 : 0),
                      Z = Z + $e,
                      n0 = n0 + er + (Z >>> 0 < $e >>> 0 ? 1 : 0),
                      Z = Z + J,
                      n0 = n0 + o0 + (Z >>> 0 < J >>> 0 ? 1 : 0),
                      Ve = Me + Yt,
                      tr = jt + Xt + (Ve >>> 0 < Me >>> 0 ? 1 : 0);
                    (ge = S0),
                      (A0 = b0),
                      (S0 = w0),
                      (b0 = g0),
                      (w0 = e0),
                      (g0 = j),
                      (j = (B0 + Z) | 0),
                      (e0 = (Be + n0 + (j >>> 0 < B0 >>> 0 ? 1 : 0)) | 0),
                      (Be = E0),
                      (B0 = u0),
                      (E0 = X),
                      (u0 = q),
                      (X = K),
                      (q = G),
                      (G = (Z + Ve) | 0),
                      (K = (n0 + tr + (G >>> 0 < Z >>> 0 ? 1 : 0)) | 0);
                  }
                  (g = E.low = g + G),
                    (E.high = T + K + (g >>> 0 < G >>> 0 ? 1 : 0)),
                    (y = i.low = y + q),
                    (i.high = D + X + (y >>> 0 < q >>> 0 ? 1 : 0)),
                    (z = c.low = z + u0),
                    (c.high = S + E0 + (z >>> 0 < u0 >>> 0 ? 1 : 0)),
                    (W = u.low = W + B0),
                    (u.high = P + Be + (W >>> 0 < B0 >>> 0 ? 1 : 0)),
                    (M = A.low = M + j),
                    (A.high = V + e0 + (M >>> 0 < j >>> 0 ? 1 : 0)),
                    ($ = m.low = $ + g0),
                    (m.high = O + w0 + ($ >>> 0 < g0 >>> 0 ? 1 : 0)),
                    (R = F.low = R + b0),
                    (F.high = w + S0 + (R >>> 0 < b0 >>> 0 ? 1 : 0)),
                    (k = _.low = k + A0),
                    (_.high = H + ge + (k >>> 0 < A0 >>> 0 ? 1 : 0));
                },
                _doFinalize: function () {
                  var d = this._data,
                    p = d.words,
                    f = this._nDataBytes * 8,
                    E = d.sigBytes * 8;
                  (p[E >>> 5] |= 128 << (24 - (E % 32))),
                    (p[(((E + 128) >>> 10) << 5) + 30] = Math.floor(
                      f / 4294967296
                    )),
                    (p[(((E + 128) >>> 10) << 5) + 31] = f),
                    (d.sigBytes = p.length * 4),
                    this._process();
                  var i = this._hash.toX32();
                  return i;
                },
                clone: function () {
                  var d = x.clone.call(this);
                  return (d._hash = this._hash.clone()), d;
                },
                blockSize: 1024 / 32,
              }));
              (e.SHA512 = x._createHelper(h)),
                (e.HmacSHA512 = x._createHmacHelper(h));
            })(),
            t.SHA512
          );
        });
      })($0)),
    $0.exports
  );
}
var V0 = { exports: {} },
  vo = V0.exports,
  at;
function po() {
  return (
    at ||
      ((at = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Ee(), Ot());
        })(vo, function (t) {
          return (
            (function () {
              var e = t,
                v = e.x64,
                x = v.Word,
                b = v.WordArray,
                l = e.algo,
                C = l.SHA512,
                r = (l.SHA384 = C.extend({
                  _doReset: function () {
                    this._hash = new b.init([
                      new x.init(3418070365, 3238371032),
                      new x.init(1654270250, 914150663),
                      new x.init(2438529370, 812702999),
                      new x.init(355462360, 4144912697),
                      new x.init(1731405415, 4290775857),
                      new x.init(2394180231, 1750603025),
                      new x.init(3675008525, 1694076839),
                      new x.init(1203062813, 3204075428),
                    ]);
                  },
                  _doFinalize: function () {
                    var a = C._doFinalize.call(this);
                    return (a.sigBytes -= 16), a;
                  },
                }));
              (e.SHA384 = C._createHelper(r)),
                (e.HmacSHA384 = C._createHmacHelper(r));
            })(),
            t.SHA384
          );
        });
      })(V0)),
    V0.exports
  );
}
var G0 = { exports: {} },
  Co = G0.exports,
  it;
function Eo() {
  return (
    it ||
      ((it = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Ee());
        })(Co, function (t) {
          return (
            (function (e) {
              var v = t,
                x = v.lib,
                b = x.WordArray,
                l = x.Hasher,
                C = v.x64,
                r = C.Word,
                a = v.algo,
                B = [],
                s = [],
                h = [];
              (function () {
                for (var f = 1, E = 0, i = 0; i < 24; i++) {
                  B[f + 5 * E] = (((i + 1) * (i + 2)) / 2) % 64;
                  var c = E % 5,
                    u = (2 * f + 3 * E) % 5;
                  (f = c), (E = u);
                }
                for (var f = 0; f < 5; f++)
                  for (var E = 0; E < 5; E++)
                    s[f + 5 * E] = E + ((2 * f + 3 * E) % 5) * 5;
                for (var A = 1, m = 0; m < 24; m++) {
                  for (var F = 0, _ = 0, T = 0; T < 7; T++) {
                    if (A & 1) {
                      var g = (1 << T) - 1;
                      g < 32 ? (_ ^= 1 << g) : (F ^= 1 << (g - 32));
                    }
                    A & 128 ? (A = (A << 1) ^ 113) : (A <<= 1);
                  }
                  h[m] = r.create(F, _);
                }
              })();
              var d = [];
              (function () {
                for (var f = 0; f < 25; f++) d[f] = r.create();
              })();
              var p = (a.SHA3 = l.extend({
                cfg: l.cfg.extend({ outputLength: 512 }),
                _doReset: function () {
                  for (var f = (this._state = []), E = 0; E < 25; E++)
                    f[E] = new r.init();
                  this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
                },
                _doProcessBlock: function (f, E) {
                  for (
                    var i = this._state, c = this.blockSize / 2, u = 0;
                    u < c;
                    u++
                  ) {
                    var A = f[E + 2 * u],
                      m = f[E + 2 * u + 1];
                    (A =
                      (((A << 8) | (A >>> 24)) & 16711935) |
                      (((A << 24) | (A >>> 8)) & 4278255360)),
                      (m =
                        (((m << 8) | (m >>> 24)) & 16711935) |
                        (((m << 24) | (m >>> 8)) & 4278255360));
                    var F = i[u];
                    (F.high ^= m), (F.low ^= A);
                  }
                  for (var _ = 0; _ < 24; _++) {
                    for (var T = 0; T < 5; T++) {
                      for (var g = 0, D = 0, y = 0; y < 5; y++) {
                        var F = i[T + 5 * y];
                        (g ^= F.high), (D ^= F.low);
                      }
                      var S = d[T];
                      (S.high = g), (S.low = D);
                    }
                    for (var T = 0; T < 5; T++)
                      for (
                        var z = d[(T + 4) % 5],
                          P = d[(T + 1) % 5],
                          W = P.high,
                          V = P.low,
                          g = z.high ^ ((W << 1) | (V >>> 31)),
                          D = z.low ^ ((V << 1) | (W >>> 31)),
                          y = 0;
                        y < 5;
                        y++
                      ) {
                        var F = i[T + 5 * y];
                        (F.high ^= g), (F.low ^= D);
                      }
                    for (var M = 1; M < 25; M++) {
                      var g,
                        D,
                        F = i[M],
                        O = F.high,
                        $ = F.low,
                        w = B[M];
                      w < 32
                        ? ((g = (O << w) | ($ >>> (32 - w))),
                          (D = ($ << w) | (O >>> (32 - w))))
                        : ((g = ($ << (w - 32)) | (O >>> (64 - w))),
                          (D = (O << (w - 32)) | ($ >>> (64 - w))));
                      var R = d[s[M]];
                      (R.high = g), (R.low = D);
                    }
                    var H = d[0],
                      k = i[0];
                    (H.high = k.high), (H.low = k.low);
                    for (var T = 0; T < 5; T++)
                      for (var y = 0; y < 5; y++) {
                        var M = T + 5 * y,
                          F = i[M],
                          K = d[M],
                          G = d[((T + 1) % 5) + 5 * y],
                          X = d[((T + 2) % 5) + 5 * y];
                        (F.high = K.high ^ (~G.high & X.high)),
                          (F.low = K.low ^ (~G.low & X.low));
                      }
                    var F = i[0],
                      q = h[_];
                    (F.high ^= q.high), (F.low ^= q.low);
                  }
                },
                _doFinalize: function () {
                  var f = this._data,
                    E = f.words;
                  this._nDataBytes * 8;
                  var i = f.sigBytes * 8,
                    c = this.blockSize * 32;
                  (E[i >>> 5] |= 1 << (24 - (i % 32))),
                    (E[((e.ceil((i + 1) / c) * c) >>> 5) - 1] |= 128),
                    (f.sigBytes = E.length * 4),
                    this._process();
                  for (
                    var u = this._state,
                      A = this.cfg.outputLength / 8,
                      m = A / 8,
                      F = [],
                      _ = 0;
                    _ < m;
                    _++
                  ) {
                    var T = u[_],
                      g = T.high,
                      D = T.low;
                    (g =
                      (((g << 8) | (g >>> 24)) & 16711935) |
                      (((g << 24) | (g >>> 8)) & 4278255360)),
                      (D =
                        (((D << 8) | (D >>> 24)) & 16711935) |
                        (((D << 24) | (D >>> 8)) & 4278255360)),
                      F.push(D),
                      F.push(g);
                  }
                  return new b.init(F, A);
                },
                clone: function () {
                  for (
                    var f = l.clone.call(this),
                      E = (f._state = this._state.slice(0)),
                      i = 0;
                    i < 25;
                    i++
                  )
                    E[i] = E[i].clone();
                  return f;
                },
              }));
              (v.SHA3 = l._createHelper(p)),
                (v.HmacSHA3 = l._createHmacHelper(p));
            })(Math),
            t.SHA3
          );
        });
      })(G0)),
    G0.exports
  );
}
var U0 = { exports: {} },
  Bo = U0.exports,
  xt;
function go() {
  return (
    xt ||
      ((xt = 1),
      (function (n, o) {
        (function (t, e) {
          n.exports = e(N());
        })(Bo, function (t) {
          /** @preserve
			(c) 2012 by Cédric Mesnil. All rights reserved.

			Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

			    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
			    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
			*/ return (
            (function (e) {
              var v = t,
                x = v.lib,
                b = x.WordArray,
                l = x.Hasher,
                C = v.algo,
                r = b.create([
                  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4,
                  13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4,
                  9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8,
                  12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10,
                  14, 1, 3, 8, 11, 6, 15, 13,
                ]),
                a = b.create([
                  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11,
                  3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7,
                  14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15,
                  0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6,
                  2, 13, 14, 0, 3, 9, 11,
                ]),
                B = b.create([
                  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6,
                  8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6,
                  7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15,
                  14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8,
                  13, 12, 5, 12, 13, 14, 11, 8, 5, 6,
                ]),
                s = b.create([
                  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13,
                  15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11,
                  8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14,
                  14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14,
                  6, 8, 13, 6, 5, 15, 13, 11, 11,
                ]),
                h = b.create([
                  0, 1518500249, 1859775393, 2400959708, 2840853838,
                ]),
                d = b.create([
                  1352829926, 1548603684, 1836072691, 2053994217, 0,
                ]),
                p = (C.RIPEMD160 = l.extend({
                  _doReset: function () {
                    this._hash = b.create([
                      1732584193, 4023233417, 2562383102, 271733878, 3285377520,
                    ]);
                  },
                  _doProcessBlock: function (m, F) {
                    for (var _ = 0; _ < 16; _++) {
                      var T = F + _,
                        g = m[T];
                      m[T] =
                        (((g << 8) | (g >>> 24)) & 16711935) |
                        (((g << 24) | (g >>> 8)) & 4278255360);
                    }
                    var D = this._hash.words,
                      y = h.words,
                      S = d.words,
                      z = r.words,
                      P = a.words,
                      W = B.words,
                      V = s.words,
                      M,
                      O,
                      $,
                      w,
                      R,
                      H,
                      k,
                      K,
                      G,
                      X;
                    (H = M = D[0]),
                      (k = O = D[1]),
                      (K = $ = D[2]),
                      (G = w = D[3]),
                      (X = R = D[4]);
                    for (var q, _ = 0; _ < 80; _ += 1)
                      (q = (M + m[F + z[_]]) | 0),
                        _ < 16
                          ? (q += f(O, $, w) + y[0])
                          : _ < 32
                          ? (q += E(O, $, w) + y[1])
                          : _ < 48
                          ? (q += i(O, $, w) + y[2])
                          : _ < 64
                          ? (q += c(O, $, w) + y[3])
                          : (q += u(O, $, w) + y[4]),
                        (q = q | 0),
                        (q = A(q, W[_])),
                        (q = (q + R) | 0),
                        (M = R),
                        (R = w),
                        (w = A($, 10)),
                        ($ = O),
                        (O = q),
                        (q = (H + m[F + P[_]]) | 0),
                        _ < 16
                          ? (q += u(k, K, G) + S[0])
                          : _ < 32
                          ? (q += c(k, K, G) + S[1])
                          : _ < 48
                          ? (q += i(k, K, G) + S[2])
                          : _ < 64
                          ? (q += E(k, K, G) + S[3])
                          : (q += f(k, K, G) + S[4]),
                        (q = q | 0),
                        (q = A(q, V[_])),
                        (q = (q + X) | 0),
                        (H = X),
                        (X = G),
                        (G = A(K, 10)),
                        (K = k),
                        (k = q);
                    (q = (D[1] + $ + G) | 0),
                      (D[1] = (D[2] + w + X) | 0),
                      (D[2] = (D[3] + R + H) | 0),
                      (D[3] = (D[4] + M + k) | 0),
                      (D[4] = (D[0] + O + K) | 0),
                      (D[0] = q);
                  },
                  _doFinalize: function () {
                    var m = this._data,
                      F = m.words,
                      _ = this._nDataBytes * 8,
                      T = m.sigBytes * 8;
                    (F[T >>> 5] |= 128 << (24 - (T % 32))),
                      (F[(((T + 64) >>> 9) << 4) + 14] =
                        (((_ << 8) | (_ >>> 24)) & 16711935) |
                        (((_ << 24) | (_ >>> 8)) & 4278255360)),
                      (m.sigBytes = (F.length + 1) * 4),
                      this._process();
                    for (var g = this._hash, D = g.words, y = 0; y < 5; y++) {
                      var S = D[y];
                      D[y] =
                        (((S << 8) | (S >>> 24)) & 16711935) |
                        (((S << 24) | (S >>> 8)) & 4278255360);
                    }
                    return g;
                  },
                  clone: function () {
                    var m = l.clone.call(this);
                    return (m._hash = this._hash.clone()), m;
                  },
                }));
              function f(m, F, _) {
                return m ^ F ^ _;
              }
              function E(m, F, _) {
                return (m & F) | (~m & _);
              }
              function i(m, F, _) {
                return (m | ~F) ^ _;
              }
              function c(m, F, _) {
                return (m & _) | (F & ~_);
              }
              function u(m, F, _) {
                return m ^ (F | ~_);
              }
              function A(m, F) {
                return (m << F) | (m >>> (32 - F));
              }
              (v.RIPEMD160 = l._createHelper(p)),
                (v.HmacRIPEMD160 = l._createHmacHelper(p));
            })(),
            t.RIPEMD160
          );
        });
      })(U0)),
    U0.exports
  );
}
var K0 = { exports: {} },
  bo = K0.exports,
  ct;
function He() {
  return (
    ct ||
      ((ct = 1),
      (function (n, o) {
        (function (t, e) {
          n.exports = e(N());
        })(bo, function (t) {
          (function () {
            var e = t,
              v = e.lib,
              x = v.Base,
              b = e.enc,
              l = b.Utf8,
              C = e.algo;
            C.HMAC = x.extend({
              init: function (r, a) {
                (r = this._hasher = new r.init()),
                  typeof a == "string" && (a = l.parse(a));
                var B = r.blockSize,
                  s = B * 4;
                a.sigBytes > s && (a = r.finalize(a)), a.clamp();
                for (
                  var h = (this._oKey = a.clone()),
                    d = (this._iKey = a.clone()),
                    p = h.words,
                    f = d.words,
                    E = 0;
                  E < B;
                  E++
                )
                  (p[E] ^= 1549556828), (f[E] ^= 909522486);
                (h.sigBytes = d.sigBytes = s), this.reset();
              },
              reset: function () {
                var r = this._hasher;
                r.reset(), r.update(this._iKey);
              },
              update: function (r) {
                return this._hasher.update(r), this;
              },
              finalize: function (r) {
                var a = this._hasher,
                  B = a.finalize(r);
                a.reset();
                var s = a.finalize(this._oKey.clone().concat(B));
                return s;
              },
            });
          })();
        });
      })(K0)),
    K0.exports
  );
}
var Q0 = { exports: {} },
  Ao = Q0.exports,
  lt;
function mo() {
  return (
    lt ||
      ((lt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Re(), He());
        })(Ao, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.Base,
                b = v.WordArray,
                l = e.algo,
                C = l.SHA256,
                r = l.HMAC,
                a = (l.PBKDF2 = x.extend({
                  cfg: x.extend({
                    keySize: 128 / 32,
                    hasher: C,
                    iterations: 25e4,
                  }),
                  init: function (B) {
                    this.cfg = this.cfg.extend(B);
                  },
                  compute: function (B, s) {
                    for (
                      var h = this.cfg,
                        d = r.create(h.hasher, B),
                        p = b.create(),
                        f = b.create([1]),
                        E = p.words,
                        i = f.words,
                        c = h.keySize,
                        u = h.iterations;
                      E.length < c;

                    ) {
                      var A = d.update(s).finalize(f);
                      d.reset();
                      for (
                        var m = A.words, F = m.length, _ = A, T = 1;
                        T < u;
                        T++
                      ) {
                        (_ = d.finalize(_)), d.reset();
                        for (var g = _.words, D = 0; D < F; D++) m[D] ^= g[D];
                      }
                      p.concat(A), i[0]++;
                    }
                    return (p.sigBytes = c * 4), p;
                  },
                }));
              e.PBKDF2 = function (B, s, h) {
                return a.create(h).compute(B, s);
              };
            })(),
            t.PBKDF2
          );
        });
      })(Q0)),
    Q0.exports
  );
}
var X0 = { exports: {} },
  Do = X0.exports,
  ft;
function i0() {
  return (
    ft ||
      ((ft = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Mt(), He());
        })(Do, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.Base,
                b = v.WordArray,
                l = e.algo,
                C = l.MD5,
                r = (l.EvpKDF = x.extend({
                  cfg: x.extend({
                    keySize: 128 / 32,
                    hasher: C,
                    iterations: 1,
                  }),
                  init: function (a) {
                    this.cfg = this.cfg.extend(a);
                  },
                  compute: function (a, B) {
                    for (
                      var s,
                        h = this.cfg,
                        d = h.hasher.create(),
                        p = b.create(),
                        f = p.words,
                        E = h.keySize,
                        i = h.iterations;
                      f.length < E;

                    ) {
                      s && d.update(s),
                        (s = d.update(a).finalize(B)),
                        d.reset();
                      for (var c = 1; c < i; c++)
                        (s = d.finalize(s)), d.reset();
                      p.concat(s);
                    }
                    return (p.sigBytes = E * 4), p;
                  },
                }));
              e.EvpKDF = function (a, B, s) {
                return r.create(s).compute(a, B);
              };
            })(),
            t.EvpKDF
          );
        });
      })(X0)),
    X0.exports
  );
}
var Y0 = { exports: {} },
  Fo = Y0.exports,
  dt;
function Q() {
  return (
    dt ||
      ((dt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), i0());
        })(Fo, function (t) {
          t.lib.Cipher ||
            (function (e) {
              var v = t,
                x = v.lib,
                b = x.Base,
                l = x.WordArray,
                C = x.BufferedBlockAlgorithm,
                r = v.enc;
              r.Utf8;
              var a = r.Base64,
                B = v.algo,
                s = B.EvpKDF,
                h = (x.Cipher = C.extend({
                  cfg: b.extend(),
                  createEncryptor: function (g, D) {
                    return this.create(this._ENC_XFORM_MODE, g, D);
                  },
                  createDecryptor: function (g, D) {
                    return this.create(this._DEC_XFORM_MODE, g, D);
                  },
                  init: function (g, D, y) {
                    (this.cfg = this.cfg.extend(y)),
                      (this._xformMode = g),
                      (this._key = D),
                      this.reset();
                  },
                  reset: function () {
                    C.reset.call(this), this._doReset();
                  },
                  process: function (g) {
                    return this._append(g), this._process();
                  },
                  finalize: function (g) {
                    g && this._append(g);
                    var D = this._doFinalize();
                    return D;
                  },
                  keySize: 128 / 32,
                  ivSize: 128 / 32,
                  _ENC_XFORM_MODE: 1,
                  _DEC_XFORM_MODE: 2,
                  _createHelper: (function () {
                    function g(D) {
                      return typeof D == "string" ? T : m;
                    }
                    return function (D) {
                      return {
                        encrypt: function (y, S, z) {
                          return g(S).encrypt(D, y, S, z);
                        },
                        decrypt: function (y, S, z) {
                          return g(S).decrypt(D, y, S, z);
                        },
                      };
                    };
                  })(),
                }));
              x.StreamCipher = h.extend({
                _doFinalize: function () {
                  var g = this._process(!0);
                  return g;
                },
                blockSize: 1,
              });
              var d = (v.mode = {}),
                p = (x.BlockCipherMode = b.extend({
                  createEncryptor: function (g, D) {
                    return this.Encryptor.create(g, D);
                  },
                  createDecryptor: function (g, D) {
                    return this.Decryptor.create(g, D);
                  },
                  init: function (g, D) {
                    (this._cipher = g), (this._iv = D);
                  },
                })),
                f = (d.CBC = (function () {
                  var g = p.extend();
                  (g.Encryptor = g.extend({
                    processBlock: function (y, S) {
                      var z = this._cipher,
                        P = z.blockSize;
                      D.call(this, y, S, P),
                        z.encryptBlock(y, S),
                        (this._prevBlock = y.slice(S, S + P));
                    },
                  })),
                    (g.Decryptor = g.extend({
                      processBlock: function (y, S) {
                        var z = this._cipher,
                          P = z.blockSize,
                          W = y.slice(S, S + P);
                        z.decryptBlock(y, S),
                          D.call(this, y, S, P),
                          (this._prevBlock = W);
                      },
                    }));
                  function D(y, S, z) {
                    var P,
                      W = this._iv;
                    W ? ((P = W), (this._iv = e)) : (P = this._prevBlock);
                    for (var V = 0; V < z; V++) y[S + V] ^= P[V];
                  }
                  return g;
                })()),
                E = (v.pad = {}),
                i = (E.Pkcs7 = {
                  pad: function (g, D) {
                    for (
                      var y = D * 4,
                        S = y - (g.sigBytes % y),
                        z = (S << 24) | (S << 16) | (S << 8) | S,
                        P = [],
                        W = 0;
                      W < S;
                      W += 4
                    )
                      P.push(z);
                    var V = l.create(P, S);
                    g.concat(V);
                  },
                  unpad: function (g) {
                    var D = g.words[(g.sigBytes - 1) >>> 2] & 255;
                    g.sigBytes -= D;
                  },
                });
              x.BlockCipher = h.extend({
                cfg: h.cfg.extend({ mode: f, padding: i }),
                reset: function () {
                  var g;
                  h.reset.call(this);
                  var D = this.cfg,
                    y = D.iv,
                    S = D.mode;
                  this._xformMode == this._ENC_XFORM_MODE
                    ? (g = S.createEncryptor)
                    : ((g = S.createDecryptor), (this._minBufferSize = 1)),
                    this._mode && this._mode.__creator == g
                      ? this._mode.init(this, y && y.words)
                      : ((this._mode = g.call(S, this, y && y.words)),
                        (this._mode.__creator = g));
                },
                _doProcessBlock: function (g, D) {
                  this._mode.processBlock(g, D);
                },
                _doFinalize: function () {
                  var g,
                    D = this.cfg.padding;
                  return (
                    this._xformMode == this._ENC_XFORM_MODE
                      ? (D.pad(this._data, this.blockSize),
                        (g = this._process(!0)))
                      : ((g = this._process(!0)), D.unpad(g)),
                    g
                  );
                },
                blockSize: 128 / 32,
              });
              var c = (x.CipherParams = b.extend({
                  init: function (g) {
                    this.mixIn(g);
                  },
                  toString: function (g) {
                    return (g || this.formatter).stringify(this);
                  },
                })),
                u = (v.format = {}),
                A = (u.OpenSSL = {
                  stringify: function (g) {
                    var D,
                      y = g.ciphertext,
                      S = g.salt;
                    return (
                      S
                        ? (D = l
                            .create([1398893684, 1701076831])
                            .concat(S)
                            .concat(y))
                        : (D = y),
                      D.toString(a)
                    );
                  },
                  parse: function (g) {
                    var D,
                      y = a.parse(g),
                      S = y.words;
                    return (
                      S[0] == 1398893684 &&
                        S[1] == 1701076831 &&
                        ((D = l.create(S.slice(2, 4))),
                        S.splice(0, 4),
                        (y.sigBytes -= 16)),
                      c.create({ ciphertext: y, salt: D })
                    );
                  },
                }),
                m = (x.SerializableCipher = b.extend({
                  cfg: b.extend({ format: A }),
                  encrypt: function (g, D, y, S) {
                    S = this.cfg.extend(S);
                    var z = g.createEncryptor(y, S),
                      P = z.finalize(D),
                      W = z.cfg;
                    return c.create({
                      ciphertext: P,
                      key: y,
                      iv: W.iv,
                      algorithm: g,
                      mode: W.mode,
                      padding: W.padding,
                      blockSize: g.blockSize,
                      formatter: S.format,
                    });
                  },
                  decrypt: function (g, D, y, S) {
                    (S = this.cfg.extend(S)), (D = this._parse(D, S.format));
                    var z = g.createDecryptor(y, S).finalize(D.ciphertext);
                    return z;
                  },
                  _parse: function (g, D) {
                    return typeof g == "string" ? D.parse(g, this) : g;
                  },
                })),
                F = (v.kdf = {}),
                _ = (F.OpenSSL = {
                  execute: function (g, D, y, S, z) {
                    if ((S || (S = l.random(64 / 8)), z))
                      var P = s
                        .create({ keySize: D + y, hasher: z })
                        .compute(g, S);
                    else var P = s.create({ keySize: D + y }).compute(g, S);
                    var W = l.create(P.words.slice(D), y * 4);
                    return (
                      (P.sigBytes = D * 4), c.create({ key: P, iv: W, salt: S })
                    );
                  },
                }),
                T = (x.PasswordBasedCipher = m.extend({
                  cfg: m.cfg.extend({ kdf: _ }),
                  encrypt: function (g, D, y, S) {
                    S = this.cfg.extend(S);
                    var z = S.kdf.execute(
                      y,
                      g.keySize,
                      g.ivSize,
                      S.salt,
                      S.hasher
                    );
                    S.iv = z.iv;
                    var P = m.encrypt.call(this, g, D, z.key, S);
                    return P.mixIn(z), P;
                  },
                  decrypt: function (g, D, y, S) {
                    (S = this.cfg.extend(S)), (D = this._parse(D, S.format));
                    var z = S.kdf.execute(
                      y,
                      g.keySize,
                      g.ivSize,
                      D.salt,
                      S.hasher
                    );
                    S.iv = z.iv;
                    var P = m.decrypt.call(this, g, D, z.key, S);
                    return P;
                  },
                }));
            })();
        });
      })(Y0)),
    Y0.exports
  );
}
var j0 = { exports: {} },
  yo = j0.exports,
  ut;
function _o() {
  return (
    ut ||
      ((ut = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Q());
        })(yo, function (t) {
          return (
            (t.mode.CFB = (function () {
              var e = t.lib.BlockCipherMode.extend();
              (e.Encryptor = e.extend({
                processBlock: function (x, b) {
                  var l = this._cipher,
                    C = l.blockSize;
                  v.call(this, x, b, C, l),
                    (this._prevBlock = x.slice(b, b + C));
                },
              })),
                (e.Decryptor = e.extend({
                  processBlock: function (x, b) {
                    var l = this._cipher,
                      C = l.blockSize,
                      r = x.slice(b, b + C);
                    v.call(this, x, b, C, l), (this._prevBlock = r);
                  },
                }));
              function v(x, b, l, C) {
                var r,
                  a = this._iv;
                a
                  ? ((r = a.slice(0)), (this._iv = void 0))
                  : (r = this._prevBlock),
                  C.encryptBlock(r, 0);
                for (var B = 0; B < l; B++) x[b + B] ^= r[B];
              }
              return e;
            })()),
            t.mode.CFB
          );
        });
      })(j0)),
    j0.exports
  );
}
var Z0 = { exports: {} },
  wo = Z0.exports,
  ht;
function So() {
  return (
    ht ||
      ((ht = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Q());
        })(wo, function (t) {
          return (
            (t.mode.CTR = (function () {
              var e = t.lib.BlockCipherMode.extend(),
                v = (e.Encryptor = e.extend({
                  processBlock: function (x, b) {
                    var l = this._cipher,
                      C = l.blockSize,
                      r = this._iv,
                      a = this._counter;
                    r &&
                      ((a = this._counter = r.slice(0)), (this._iv = void 0));
                    var B = a.slice(0);
                    l.encryptBlock(B, 0), (a[C - 1] = (a[C - 1] + 1) | 0);
                    for (var s = 0; s < C; s++) x[b + s] ^= B[s];
                  },
                }));
              return (e.Decryptor = v), e;
            })()),
            t.mode.CTR
          );
        });
      })(Z0)),
    Z0.exports
  );
}
var J0 = { exports: {} },
  ko = J0.exports,
  vt;
function Ro() {
  return (
    vt ||
      ((vt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Q());
        })(ko, function (t) {
          /** @preserve
           * Counter block mode compatible with  Dr Brian Gladman fileenc.c
           * derived from CryptoJS.mode.CTR
           * Jan Hruby jhruby.web@gmail.com
           */ return (
            (t.mode.CTRGladman = (function () {
              var e = t.lib.BlockCipherMode.extend();
              function v(l) {
                if (((l >> 24) & 255) === 255) {
                  var C = (l >> 16) & 255,
                    r = (l >> 8) & 255,
                    a = l & 255;
                  C === 255
                    ? ((C = 0),
                      r === 255 ? ((r = 0), a === 255 ? (a = 0) : ++a) : ++r)
                    : ++C,
                    (l = 0),
                    (l += C << 16),
                    (l += r << 8),
                    (l += a);
                } else l += 1 << 24;
                return l;
              }
              function x(l) {
                return (l[0] = v(l[0])) === 0 && (l[1] = v(l[1])), l;
              }
              var b = (e.Encryptor = e.extend({
                processBlock: function (l, C) {
                  var r = this._cipher,
                    a = r.blockSize,
                    B = this._iv,
                    s = this._counter;
                  B && ((s = this._counter = B.slice(0)), (this._iv = void 0)),
                    x(s);
                  var h = s.slice(0);
                  r.encryptBlock(h, 0);
                  for (var d = 0; d < a; d++) l[C + d] ^= h[d];
                },
              }));
              return (e.Decryptor = b), e;
            })()),
            t.mode.CTRGladman
          );
        });
      })(J0)),
    J0.exports
  );
}
var ee = { exports: {} },
  Ho = ee.exports,
  pt;
function To() {
  return (
    pt ||
      ((pt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Q());
        })(Ho, function (t) {
          return (
            (t.mode.OFB = (function () {
              var e = t.lib.BlockCipherMode.extend(),
                v = (e.Encryptor = e.extend({
                  processBlock: function (x, b) {
                    var l = this._cipher,
                      C = l.blockSize,
                      r = this._iv,
                      a = this._keystream;
                    r &&
                      ((a = this._keystream = r.slice(0)), (this._iv = void 0)),
                      l.encryptBlock(a, 0);
                    for (var B = 0; B < C; B++) x[b + B] ^= a[B];
                  },
                }));
              return (e.Decryptor = v), e;
            })()),
            t.mode.OFB
          );
        });
      })(ee)),
    ee.exports
  );
}
var te = { exports: {} },
  zo = te.exports,
  Ct;
function Io() {
  return (
    Ct ||
      ((Ct = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Q());
        })(zo, function (t) {
          return (
            (t.mode.ECB = (function () {
              var e = t.lib.BlockCipherMode.extend();
              return (
                (e.Encryptor = e.extend({
                  processBlock: function (v, x) {
                    this._cipher.encryptBlock(v, x);
                  },
                })),
                (e.Decryptor = e.extend({
                  processBlock: function (v, x) {
                    this._cipher.decryptBlock(v, x);
                  },
                })),
                e
              );
            })()),
            t.mode.ECB
          );
        });
      })(te)),
    te.exports
  );
}
var re = { exports: {} },
  Po = re.exports,
  Et;
function Wo() {
  return (
    Et ||
      ((Et = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Q());
        })(Po, function (t) {
          return (
            (t.pad.AnsiX923 = {
              pad: function (e, v) {
                var x = e.sigBytes,
                  b = v * 4,
                  l = b - (x % b),
                  C = x + l - 1;
                e.clamp(),
                  (e.words[C >>> 2] |= l << (24 - (C % 4) * 8)),
                  (e.sigBytes += l);
              },
              unpad: function (e) {
                var v = e.words[(e.sigBytes - 1) >>> 2] & 255;
                e.sigBytes -= v;
              },
            }),
            t.pad.Ansix923
          );
        });
      })(re)),
    re.exports
  );
}
var oe = { exports: {} },
  Lo = oe.exports,
  Bt;
function qo() {
  return (
    Bt ||
      ((Bt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Q());
        })(Lo, function (t) {
          return (
            (t.pad.Iso10126 = {
              pad: function (e, v) {
                var x = v * 4,
                  b = x - (e.sigBytes % x);
                e.concat(t.lib.WordArray.random(b - 1)).concat(
                  t.lib.WordArray.create([b << 24], 1)
                );
              },
              unpad: function (e) {
                var v = e.words[(e.sigBytes - 1) >>> 2] & 255;
                e.sigBytes -= v;
              },
            }),
            t.pad.Iso10126
          );
        });
      })(oe)),
    oe.exports
  );
}
var ne = { exports: {} },
  No = ne.exports,
  gt;
function Mo() {
  return (
    gt ||
      ((gt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Q());
        })(No, function (t) {
          return (
            (t.pad.Iso97971 = {
              pad: function (e, v) {
                e.concat(t.lib.WordArray.create([2147483648], 1)),
                  t.pad.ZeroPadding.pad(e, v);
              },
              unpad: function (e) {
                t.pad.ZeroPadding.unpad(e), e.sigBytes--;
              },
            }),
            t.pad.Iso97971
          );
        });
      })(ne)),
    ne.exports
  );
}
var se = { exports: {} },
  Oo = se.exports,
  bt;
function $o() {
  return (
    bt ||
      ((bt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Q());
        })(Oo, function (t) {
          return (
            (t.pad.ZeroPadding = {
              pad: function (e, v) {
                var x = v * 4;
                e.clamp(), (e.sigBytes += x - (e.sigBytes % x || x));
              },
              unpad: function (e) {
                for (
                  var v = e.words, x = e.sigBytes - 1, x = e.sigBytes - 1;
                  x >= 0;
                  x--
                )
                  if ((v[x >>> 2] >>> (24 - (x % 4) * 8)) & 255) {
                    e.sigBytes = x + 1;
                    break;
                  }
              },
            }),
            t.pad.ZeroPadding
          );
        });
      })(se)),
    se.exports
  );
}
var ae = { exports: {} },
  Vo = ae.exports,
  At;
function Go() {
  return (
    At ||
      ((At = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Q());
        })(Vo, function (t) {
          return (
            (t.pad.NoPadding = { pad: function () {}, unpad: function () {} }),
            t.pad.NoPadding
          );
        });
      })(ae)),
    ae.exports
  );
}
var ie = { exports: {} },
  Uo = ie.exports,
  mt;
function Ko() {
  return (
    mt ||
      ((mt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), Q());
        })(Uo, function (t) {
          return (
            (function (e) {
              var v = t,
                x = v.lib,
                b = x.CipherParams,
                l = v.enc,
                C = l.Hex,
                r = v.format;
              r.Hex = {
                stringify: function (a) {
                  return a.ciphertext.toString(C);
                },
                parse: function (a) {
                  var B = C.parse(a);
                  return b.create({ ciphertext: B });
                },
              };
            })(),
            t.format.Hex
          );
        });
      })(ie)),
    ie.exports
  );
}
var xe = { exports: {} },
  Qo = xe.exports,
  Dt;
function Xo() {
  return (
    Dt ||
      ((Dt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), f0(), d0(), i0(), Q());
        })(Qo, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.BlockCipher,
                b = e.algo,
                l = [],
                C = [],
                r = [],
                a = [],
                B = [],
                s = [],
                h = [],
                d = [],
                p = [],
                f = [];
              (function () {
                for (var c = [], u = 0; u < 256; u++)
                  u < 128 ? (c[u] = u << 1) : (c[u] = (u << 1) ^ 283);
                for (var A = 0, m = 0, u = 0; u < 256; u++) {
                  var F = m ^ (m << 1) ^ (m << 2) ^ (m << 3) ^ (m << 4);
                  (F = (F >>> 8) ^ (F & 255) ^ 99), (l[A] = F), (C[F] = A);
                  var _ = c[A],
                    T = c[_],
                    g = c[T],
                    D = (c[F] * 257) ^ (F * 16843008);
                  (r[A] = (D << 24) | (D >>> 8)),
                    (a[A] = (D << 16) | (D >>> 16)),
                    (B[A] = (D << 8) | (D >>> 24)),
                    (s[A] = D);
                  var D =
                    (g * 16843009) ^ (T * 65537) ^ (_ * 257) ^ (A * 16843008);
                  (h[F] = (D << 24) | (D >>> 8)),
                    (d[F] = (D << 16) | (D >>> 16)),
                    (p[F] = (D << 8) | (D >>> 24)),
                    (f[F] = D),
                    A
                      ? ((A = _ ^ c[c[c[g ^ _]]]), (m ^= c[c[m]]))
                      : (A = m = 1);
                }
              })();
              var E = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
                i = (b.AES = x.extend({
                  _doReset: function () {
                    var c;
                    if (!(this._nRounds && this._keyPriorReset === this._key)) {
                      for (
                        var u = (this._keyPriorReset = this._key),
                          A = u.words,
                          m = u.sigBytes / 4,
                          F = (this._nRounds = m + 6),
                          _ = (F + 1) * 4,
                          T = (this._keySchedule = []),
                          g = 0;
                        g < _;
                        g++
                      )
                        g < m
                          ? (T[g] = A[g])
                          : ((c = T[g - 1]),
                            g % m
                              ? m > 6 &&
                                g % m == 4 &&
                                (c =
                                  (l[c >>> 24] << 24) |
                                  (l[(c >>> 16) & 255] << 16) |
                                  (l[(c >>> 8) & 255] << 8) |
                                  l[c & 255])
                              : ((c = (c << 8) | (c >>> 24)),
                                (c =
                                  (l[c >>> 24] << 24) |
                                  (l[(c >>> 16) & 255] << 16) |
                                  (l[(c >>> 8) & 255] << 8) |
                                  l[c & 255]),
                                (c ^= E[(g / m) | 0] << 24)),
                            (T[g] = T[g - m] ^ c));
                      for (
                        var D = (this._invKeySchedule = []), y = 0;
                        y < _;
                        y++
                      ) {
                        var g = _ - y;
                        if (y % 4) var c = T[g];
                        else var c = T[g - 4];
                        y < 4 || g <= 4
                          ? (D[y] = c)
                          : (D[y] =
                              h[l[c >>> 24]] ^
                              d[l[(c >>> 16) & 255]] ^
                              p[l[(c >>> 8) & 255]] ^
                              f[l[c & 255]]);
                      }
                    }
                  },
                  encryptBlock: function (c, u) {
                    this._doCryptBlock(c, u, this._keySchedule, r, a, B, s, l);
                  },
                  decryptBlock: function (c, u) {
                    var A = c[u + 1];
                    (c[u + 1] = c[u + 3]),
                      (c[u + 3] = A),
                      this._doCryptBlock(
                        c,
                        u,
                        this._invKeySchedule,
                        h,
                        d,
                        p,
                        f,
                        C
                      );
                    var A = c[u + 1];
                    (c[u + 1] = c[u + 3]), (c[u + 3] = A);
                  },
                  _doCryptBlock: function (c, u, A, m, F, _, T, g) {
                    for (
                      var D = this._nRounds,
                        y = c[u] ^ A[0],
                        S = c[u + 1] ^ A[1],
                        z = c[u + 2] ^ A[2],
                        P = c[u + 3] ^ A[3],
                        W = 4,
                        V = 1;
                      V < D;
                      V++
                    ) {
                      var M =
                          m[y >>> 24] ^
                          F[(S >>> 16) & 255] ^
                          _[(z >>> 8) & 255] ^
                          T[P & 255] ^
                          A[W++],
                        O =
                          m[S >>> 24] ^
                          F[(z >>> 16) & 255] ^
                          _[(P >>> 8) & 255] ^
                          T[y & 255] ^
                          A[W++],
                        $ =
                          m[z >>> 24] ^
                          F[(P >>> 16) & 255] ^
                          _[(y >>> 8) & 255] ^
                          T[S & 255] ^
                          A[W++],
                        w =
                          m[P >>> 24] ^
                          F[(y >>> 16) & 255] ^
                          _[(S >>> 8) & 255] ^
                          T[z & 255] ^
                          A[W++];
                      (y = M), (S = O), (z = $), (P = w);
                    }
                    var M =
                        ((g[y >>> 24] << 24) |
                          (g[(S >>> 16) & 255] << 16) |
                          (g[(z >>> 8) & 255] << 8) |
                          g[P & 255]) ^
                        A[W++],
                      O =
                        ((g[S >>> 24] << 24) |
                          (g[(z >>> 16) & 255] << 16) |
                          (g[(P >>> 8) & 255] << 8) |
                          g[y & 255]) ^
                        A[W++],
                      $ =
                        ((g[z >>> 24] << 24) |
                          (g[(P >>> 16) & 255] << 16) |
                          (g[(y >>> 8) & 255] << 8) |
                          g[S & 255]) ^
                        A[W++],
                      w =
                        ((g[P >>> 24] << 24) |
                          (g[(y >>> 16) & 255] << 16) |
                          (g[(S >>> 8) & 255] << 8) |
                          g[z & 255]) ^
                        A[W++];
                    (c[u] = M), (c[u + 1] = O), (c[u + 2] = $), (c[u + 3] = w);
                  },
                  keySize: 256 / 32,
                }));
              e.AES = x._createHelper(i);
            })(),
            t.AES
          );
        });
      })(xe)),
    xe.exports
  );
}
var ce = { exports: {} },
  Yo = ce.exports,
  Ft;
function jo() {
  return (
    Ft ||
      ((Ft = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), f0(), d0(), i0(), Q());
        })(Yo, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.WordArray,
                b = v.BlockCipher,
                l = e.algo,
                C = [
                  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2,
                  59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39,
                  31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37,
                  29, 21, 13, 5, 28, 20, 12, 4,
                ],
                r = [
                  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26,
                  8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51,
                  45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32,
                ],
                a = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28],
                B = [
                  {
                    0: 8421888,
                    268435456: 32768,
                    536870912: 8421378,
                    805306368: 2,
                    1073741824: 512,
                    1342177280: 8421890,
                    1610612736: 8389122,
                    1879048192: 8388608,
                    2147483648: 514,
                    2415919104: 8389120,
                    2684354560: 33280,
                    2952790016: 8421376,
                    3221225472: 32770,
                    3489660928: 8388610,
                    3758096384: 0,
                    4026531840: 33282,
                    134217728: 0,
                    402653184: 8421890,
                    671088640: 33282,
                    939524096: 32768,
                    1207959552: 8421888,
                    1476395008: 512,
                    1744830464: 8421378,
                    2013265920: 2,
                    2281701376: 8389120,
                    2550136832: 33280,
                    2818572288: 8421376,
                    3087007744: 8389122,
                    3355443200: 8388610,
                    3623878656: 32770,
                    3892314112: 514,
                    4160749568: 8388608,
                    1: 32768,
                    268435457: 2,
                    536870913: 8421888,
                    805306369: 8388608,
                    1073741825: 8421378,
                    1342177281: 33280,
                    1610612737: 512,
                    1879048193: 8389122,
                    2147483649: 8421890,
                    2415919105: 8421376,
                    2684354561: 8388610,
                    2952790017: 33282,
                    3221225473: 514,
                    3489660929: 8389120,
                    3758096385: 32770,
                    4026531841: 0,
                    134217729: 8421890,
                    402653185: 8421376,
                    671088641: 8388608,
                    939524097: 512,
                    1207959553: 32768,
                    1476395009: 8388610,
                    1744830465: 2,
                    2013265921: 33282,
                    2281701377: 32770,
                    2550136833: 8389122,
                    2818572289: 514,
                    3087007745: 8421888,
                    3355443201: 8389120,
                    3623878657: 0,
                    3892314113: 33280,
                    4160749569: 8421378,
                  },
                  {
                    0: 1074282512,
                    16777216: 16384,
                    33554432: 524288,
                    50331648: 1074266128,
                    67108864: 1073741840,
                    83886080: 1074282496,
                    100663296: 1073758208,
                    117440512: 16,
                    134217728: 540672,
                    150994944: 1073758224,
                    167772160: 1073741824,
                    184549376: 540688,
                    201326592: 524304,
                    218103808: 0,
                    234881024: 16400,
                    251658240: 1074266112,
                    8388608: 1073758208,
                    25165824: 540688,
                    41943040: 16,
                    58720256: 1073758224,
                    75497472: 1074282512,
                    92274688: 1073741824,
                    109051904: 524288,
                    125829120: 1074266128,
                    142606336: 524304,
                    159383552: 0,
                    176160768: 16384,
                    192937984: 1074266112,
                    209715200: 1073741840,
                    226492416: 540672,
                    243269632: 1074282496,
                    260046848: 16400,
                    268435456: 0,
                    285212672: 1074266128,
                    301989888: 1073758224,
                    318767104: 1074282496,
                    335544320: 1074266112,
                    352321536: 16,
                    369098752: 540688,
                    385875968: 16384,
                    402653184: 16400,
                    419430400: 524288,
                    436207616: 524304,
                    452984832: 1073741840,
                    469762048: 540672,
                    486539264: 1073758208,
                    503316480: 1073741824,
                    520093696: 1074282512,
                    276824064: 540688,
                    293601280: 524288,
                    310378496: 1074266112,
                    327155712: 16384,
                    343932928: 1073758208,
                    360710144: 1074282512,
                    377487360: 16,
                    394264576: 1073741824,
                    411041792: 1074282496,
                    427819008: 1073741840,
                    444596224: 1073758224,
                    461373440: 524304,
                    478150656: 0,
                    494927872: 16400,
                    511705088: 1074266128,
                    528482304: 540672,
                  },
                  {
                    0: 260,
                    1048576: 0,
                    2097152: 67109120,
                    3145728: 65796,
                    4194304: 65540,
                    5242880: 67108868,
                    6291456: 67174660,
                    7340032: 67174400,
                    8388608: 67108864,
                    9437184: 67174656,
                    10485760: 65792,
                    11534336: 67174404,
                    12582912: 67109124,
                    13631488: 65536,
                    14680064: 4,
                    15728640: 256,
                    524288: 67174656,
                    1572864: 67174404,
                    2621440: 0,
                    3670016: 67109120,
                    4718592: 67108868,
                    5767168: 65536,
                    6815744: 65540,
                    7864320: 260,
                    8912896: 4,
                    9961472: 256,
                    11010048: 67174400,
                    12058624: 65796,
                    13107200: 65792,
                    14155776: 67109124,
                    15204352: 67174660,
                    16252928: 67108864,
                    16777216: 67174656,
                    17825792: 65540,
                    18874368: 65536,
                    19922944: 67109120,
                    20971520: 256,
                    22020096: 67174660,
                    23068672: 67108868,
                    24117248: 0,
                    25165824: 67109124,
                    26214400: 67108864,
                    27262976: 4,
                    28311552: 65792,
                    29360128: 67174400,
                    30408704: 260,
                    31457280: 65796,
                    32505856: 67174404,
                    17301504: 67108864,
                    18350080: 260,
                    19398656: 67174656,
                    20447232: 0,
                    21495808: 65540,
                    22544384: 67109120,
                    23592960: 256,
                    24641536: 67174404,
                    25690112: 65536,
                    26738688: 67174660,
                    27787264: 65796,
                    28835840: 67108868,
                    29884416: 67109124,
                    30932992: 67174400,
                    31981568: 4,
                    33030144: 65792,
                  },
                  {
                    0: 2151682048,
                    65536: 2147487808,
                    131072: 4198464,
                    196608: 2151677952,
                    262144: 0,
                    327680: 4198400,
                    393216: 2147483712,
                    458752: 4194368,
                    524288: 2147483648,
                    589824: 4194304,
                    655360: 64,
                    720896: 2147487744,
                    786432: 2151678016,
                    851968: 4160,
                    917504: 4096,
                    983040: 2151682112,
                    32768: 2147487808,
                    98304: 64,
                    163840: 2151678016,
                    229376: 2147487744,
                    294912: 4198400,
                    360448: 2151682112,
                    425984: 0,
                    491520: 2151677952,
                    557056: 4096,
                    622592: 2151682048,
                    688128: 4194304,
                    753664: 4160,
                    819200: 2147483648,
                    884736: 4194368,
                    950272: 4198464,
                    1015808: 2147483712,
                    1048576: 4194368,
                    1114112: 4198400,
                    1179648: 2147483712,
                    1245184: 0,
                    1310720: 4160,
                    1376256: 2151678016,
                    1441792: 2151682048,
                    1507328: 2147487808,
                    1572864: 2151682112,
                    1638400: 2147483648,
                    1703936: 2151677952,
                    1769472: 4198464,
                    1835008: 2147487744,
                    1900544: 4194304,
                    1966080: 64,
                    2031616: 4096,
                    1081344: 2151677952,
                    1146880: 2151682112,
                    1212416: 0,
                    1277952: 4198400,
                    1343488: 4194368,
                    1409024: 2147483648,
                    1474560: 2147487808,
                    1540096: 64,
                    1605632: 2147483712,
                    1671168: 4096,
                    1736704: 2147487744,
                    1802240: 2151678016,
                    1867776: 4160,
                    1933312: 2151682048,
                    1998848: 4194304,
                    2064384: 4198464,
                  },
                  {
                    0: 128,
                    4096: 17039360,
                    8192: 262144,
                    12288: 536870912,
                    16384: 537133184,
                    20480: 16777344,
                    24576: 553648256,
                    28672: 262272,
                    32768: 16777216,
                    36864: 537133056,
                    40960: 536871040,
                    45056: 553910400,
                    49152: 553910272,
                    53248: 0,
                    57344: 17039488,
                    61440: 553648128,
                    2048: 17039488,
                    6144: 553648256,
                    10240: 128,
                    14336: 17039360,
                    18432: 262144,
                    22528: 537133184,
                    26624: 553910272,
                    30720: 536870912,
                    34816: 537133056,
                    38912: 0,
                    43008: 553910400,
                    47104: 16777344,
                    51200: 536871040,
                    55296: 553648128,
                    59392: 16777216,
                    63488: 262272,
                    65536: 262144,
                    69632: 128,
                    73728: 536870912,
                    77824: 553648256,
                    81920: 16777344,
                    86016: 553910272,
                    90112: 537133184,
                    94208: 16777216,
                    98304: 553910400,
                    102400: 553648128,
                    106496: 17039360,
                    110592: 537133056,
                    114688: 262272,
                    118784: 536871040,
                    122880: 0,
                    126976: 17039488,
                    67584: 553648256,
                    71680: 16777216,
                    75776: 17039360,
                    79872: 537133184,
                    83968: 536870912,
                    88064: 17039488,
                    92160: 128,
                    96256: 553910272,
                    100352: 262272,
                    104448: 553910400,
                    108544: 0,
                    112640: 553648128,
                    116736: 16777344,
                    120832: 262144,
                    124928: 537133056,
                    129024: 536871040,
                  },
                  {
                    0: 268435464,
                    256: 8192,
                    512: 270532608,
                    768: 270540808,
                    1024: 268443648,
                    1280: 2097152,
                    1536: 2097160,
                    1792: 268435456,
                    2048: 0,
                    2304: 268443656,
                    2560: 2105344,
                    2816: 8,
                    3072: 270532616,
                    3328: 2105352,
                    3584: 8200,
                    3840: 270540800,
                    128: 270532608,
                    384: 270540808,
                    640: 8,
                    896: 2097152,
                    1152: 2105352,
                    1408: 268435464,
                    1664: 268443648,
                    1920: 8200,
                    2176: 2097160,
                    2432: 8192,
                    2688: 268443656,
                    2944: 270532616,
                    3200: 0,
                    3456: 270540800,
                    3712: 2105344,
                    3968: 268435456,
                    4096: 268443648,
                    4352: 270532616,
                    4608: 270540808,
                    4864: 8200,
                    5120: 2097152,
                    5376: 268435456,
                    5632: 268435464,
                    5888: 2105344,
                    6144: 2105352,
                    6400: 0,
                    6656: 8,
                    6912: 270532608,
                    7168: 8192,
                    7424: 268443656,
                    7680: 270540800,
                    7936: 2097160,
                    4224: 8,
                    4480: 2105344,
                    4736: 2097152,
                    4992: 268435464,
                    5248: 268443648,
                    5504: 8200,
                    5760: 270540808,
                    6016: 270532608,
                    6272: 270540800,
                    6528: 270532616,
                    6784: 8192,
                    7040: 2105352,
                    7296: 2097160,
                    7552: 0,
                    7808: 268435456,
                    8064: 268443656,
                  },
                  {
                    0: 1048576,
                    16: 33555457,
                    32: 1024,
                    48: 1049601,
                    64: 34604033,
                    80: 0,
                    96: 1,
                    112: 34603009,
                    128: 33555456,
                    144: 1048577,
                    160: 33554433,
                    176: 34604032,
                    192: 34603008,
                    208: 1025,
                    224: 1049600,
                    240: 33554432,
                    8: 34603009,
                    24: 0,
                    40: 33555457,
                    56: 34604032,
                    72: 1048576,
                    88: 33554433,
                    104: 33554432,
                    120: 1025,
                    136: 1049601,
                    152: 33555456,
                    168: 34603008,
                    184: 1048577,
                    200: 1024,
                    216: 34604033,
                    232: 1,
                    248: 1049600,
                    256: 33554432,
                    272: 1048576,
                    288: 33555457,
                    304: 34603009,
                    320: 1048577,
                    336: 33555456,
                    352: 34604032,
                    368: 1049601,
                    384: 1025,
                    400: 34604033,
                    416: 1049600,
                    432: 1,
                    448: 0,
                    464: 34603008,
                    480: 33554433,
                    496: 1024,
                    264: 1049600,
                    280: 33555457,
                    296: 34603009,
                    312: 1,
                    328: 33554432,
                    344: 1048576,
                    360: 1025,
                    376: 34604032,
                    392: 33554433,
                    408: 34603008,
                    424: 0,
                    440: 34604033,
                    456: 1049601,
                    472: 1024,
                    488: 33555456,
                    504: 1048577,
                  },
                  {
                    0: 134219808,
                    1: 131072,
                    2: 134217728,
                    3: 32,
                    4: 131104,
                    5: 134350880,
                    6: 134350848,
                    7: 2048,
                    8: 134348800,
                    9: 134219776,
                    10: 133120,
                    11: 134348832,
                    12: 2080,
                    13: 0,
                    14: 134217760,
                    15: 133152,
                    2147483648: 2048,
                    2147483649: 134350880,
                    2147483650: 134219808,
                    2147483651: 134217728,
                    2147483652: 134348800,
                    2147483653: 133120,
                    2147483654: 133152,
                    2147483655: 32,
                    2147483656: 134217760,
                    2147483657: 2080,
                    2147483658: 131104,
                    2147483659: 134350848,
                    2147483660: 0,
                    2147483661: 134348832,
                    2147483662: 134219776,
                    2147483663: 131072,
                    16: 133152,
                    17: 134350848,
                    18: 32,
                    19: 2048,
                    20: 134219776,
                    21: 134217760,
                    22: 134348832,
                    23: 131072,
                    24: 0,
                    25: 131104,
                    26: 134348800,
                    27: 134219808,
                    28: 134350880,
                    29: 133120,
                    30: 2080,
                    31: 134217728,
                    2147483664: 131072,
                    2147483665: 2048,
                    2147483666: 134348832,
                    2147483667: 133152,
                    2147483668: 32,
                    2147483669: 134348800,
                    2147483670: 134217728,
                    2147483671: 134219808,
                    2147483672: 134350880,
                    2147483673: 134217760,
                    2147483674: 134219776,
                    2147483675: 0,
                    2147483676: 133120,
                    2147483677: 2080,
                    2147483678: 131104,
                    2147483679: 134350848,
                  },
                ],
                s = [
                  4160749569, 528482304, 33030144, 2064384, 129024, 8064, 504,
                  2147483679,
                ],
                h = (l.DES = b.extend({
                  _doReset: function () {
                    for (
                      var E = this._key, i = E.words, c = [], u = 0;
                      u < 56;
                      u++
                    ) {
                      var A = C[u] - 1;
                      c[u] = (i[A >>> 5] >>> (31 - (A % 32))) & 1;
                    }
                    for (var m = (this._subKeys = []), F = 0; F < 16; F++) {
                      for (var _ = (m[F] = []), T = a[F], u = 0; u < 24; u++)
                        (_[(u / 6) | 0] |=
                          c[(r[u] - 1 + T) % 28] << (31 - (u % 6))),
                          (_[4 + ((u / 6) | 0)] |=
                            c[28 + ((r[u + 24] - 1 + T) % 28)] <<
                            (31 - (u % 6)));
                      _[0] = (_[0] << 1) | (_[0] >>> 31);
                      for (var u = 1; u < 7; u++)
                        _[u] = _[u] >>> ((u - 1) * 4 + 3);
                      _[7] = (_[7] << 5) | (_[7] >>> 27);
                    }
                    for (var g = (this._invSubKeys = []), u = 0; u < 16; u++)
                      g[u] = m[15 - u];
                  },
                  encryptBlock: function (E, i) {
                    this._doCryptBlock(E, i, this._subKeys);
                  },
                  decryptBlock: function (E, i) {
                    this._doCryptBlock(E, i, this._invSubKeys);
                  },
                  _doCryptBlock: function (E, i, c) {
                    (this._lBlock = E[i]),
                      (this._rBlock = E[i + 1]),
                      d.call(this, 4, 252645135),
                      d.call(this, 16, 65535),
                      p.call(this, 2, 858993459),
                      p.call(this, 8, 16711935),
                      d.call(this, 1, 1431655765);
                    for (var u = 0; u < 16; u++) {
                      for (
                        var A = c[u],
                          m = this._lBlock,
                          F = this._rBlock,
                          _ = 0,
                          T = 0;
                        T < 8;
                        T++
                      )
                        _ |= B[T][((F ^ A[T]) & s[T]) >>> 0];
                      (this._lBlock = F), (this._rBlock = m ^ _);
                    }
                    var g = this._lBlock;
                    (this._lBlock = this._rBlock),
                      (this._rBlock = g),
                      d.call(this, 1, 1431655765),
                      p.call(this, 8, 16711935),
                      p.call(this, 2, 858993459),
                      d.call(this, 16, 65535),
                      d.call(this, 4, 252645135),
                      (E[i] = this._lBlock),
                      (E[i + 1] = this._rBlock);
                  },
                  keySize: 64 / 32,
                  ivSize: 64 / 32,
                  blockSize: 64 / 32,
                }));
              function d(E, i) {
                var c = ((this._lBlock >>> E) ^ this._rBlock) & i;
                (this._rBlock ^= c), (this._lBlock ^= c << E);
              }
              function p(E, i) {
                var c = ((this._rBlock >>> E) ^ this._lBlock) & i;
                (this._lBlock ^= c), (this._rBlock ^= c << E);
              }
              e.DES = b._createHelper(h);
              var f = (l.TripleDES = b.extend({
                _doReset: function () {
                  var E = this._key,
                    i = E.words;
                  if (i.length !== 2 && i.length !== 4 && i.length < 6)
                    throw new Error(
                      "Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192."
                    );
                  var c = i.slice(0, 2),
                    u = i.length < 4 ? i.slice(0, 2) : i.slice(2, 4),
                    A = i.length < 6 ? i.slice(0, 2) : i.slice(4, 6);
                  (this._des1 = h.createEncryptor(x.create(c))),
                    (this._des2 = h.createEncryptor(x.create(u))),
                    (this._des3 = h.createEncryptor(x.create(A)));
                },
                encryptBlock: function (E, i) {
                  this._des1.encryptBlock(E, i),
                    this._des2.decryptBlock(E, i),
                    this._des3.encryptBlock(E, i);
                },
                decryptBlock: function (E, i) {
                  this._des3.decryptBlock(E, i),
                    this._des2.encryptBlock(E, i),
                    this._des1.decryptBlock(E, i);
                },
                keySize: 192 / 32,
                ivSize: 64 / 32,
                blockSize: 64 / 32,
              }));
              e.TripleDES = b._createHelper(f);
            })(),
            t.TripleDES
          );
        });
      })(ce)),
    ce.exports
  );
}
var le = { exports: {} },
  Zo = le.exports,
  yt;
function Jo() {
  return (
    yt ||
      ((yt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), f0(), d0(), i0(), Q());
        })(Zo, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.StreamCipher,
                b = e.algo,
                l = (b.RC4 = x.extend({
                  _doReset: function () {
                    for (
                      var a = this._key,
                        B = a.words,
                        s = a.sigBytes,
                        h = (this._S = []),
                        d = 0;
                      d < 256;
                      d++
                    )
                      h[d] = d;
                    for (var d = 0, p = 0; d < 256; d++) {
                      var f = d % s,
                        E = (B[f >>> 2] >>> (24 - (f % 4) * 8)) & 255;
                      p = (p + h[d] + E) % 256;
                      var i = h[d];
                      (h[d] = h[p]), (h[p] = i);
                    }
                    this._i = this._j = 0;
                  },
                  _doProcessBlock: function (a, B) {
                    a[B] ^= C.call(this);
                  },
                  keySize: 256 / 32,
                  ivSize: 0,
                }));
              function C() {
                for (
                  var a = this._S, B = this._i, s = this._j, h = 0, d = 0;
                  d < 4;
                  d++
                ) {
                  (B = (B + 1) % 256), (s = (s + a[B]) % 256);
                  var p = a[B];
                  (a[B] = a[s]),
                    (a[s] = p),
                    (h |= a[(a[B] + a[s]) % 256] << (24 - d * 8));
                }
                return (this._i = B), (this._j = s), h;
              }
              e.RC4 = x._createHelper(l);
              var r = (b.RC4Drop = l.extend({
                cfg: l.cfg.extend({ drop: 192 }),
                _doReset: function () {
                  l._doReset.call(this);
                  for (var a = this.cfg.drop; a > 0; a--) C.call(this);
                },
              }));
              e.RC4Drop = x._createHelper(r);
            })(),
            t.RC4
          );
        });
      })(le)),
    le.exports
  );
}
var fe = { exports: {} },
  en = fe.exports,
  _t;
function tn() {
  return (
    _t ||
      ((_t = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), f0(), d0(), i0(), Q());
        })(en, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.StreamCipher,
                b = e.algo,
                l = [],
                C = [],
                r = [],
                a = (b.Rabbit = x.extend({
                  _doReset: function () {
                    for (
                      var s = this._key.words, h = this.cfg.iv, d = 0;
                      d < 4;
                      d++
                    )
                      s[d] =
                        (((s[d] << 8) | (s[d] >>> 24)) & 16711935) |
                        (((s[d] << 24) | (s[d] >>> 8)) & 4278255360);
                    var p = (this._X = [
                        s[0],
                        (s[3] << 16) | (s[2] >>> 16),
                        s[1],
                        (s[0] << 16) | (s[3] >>> 16),
                        s[2],
                        (s[1] << 16) | (s[0] >>> 16),
                        s[3],
                        (s[2] << 16) | (s[1] >>> 16),
                      ]),
                      f = (this._C = [
                        (s[2] << 16) | (s[2] >>> 16),
                        (s[0] & 4294901760) | (s[1] & 65535),
                        (s[3] << 16) | (s[3] >>> 16),
                        (s[1] & 4294901760) | (s[2] & 65535),
                        (s[0] << 16) | (s[0] >>> 16),
                        (s[2] & 4294901760) | (s[3] & 65535),
                        (s[1] << 16) | (s[1] >>> 16),
                        (s[3] & 4294901760) | (s[0] & 65535),
                      ]);
                    this._b = 0;
                    for (var d = 0; d < 4; d++) B.call(this);
                    for (var d = 0; d < 8; d++) f[d] ^= p[(d + 4) & 7];
                    if (h) {
                      var E = h.words,
                        i = E[0],
                        c = E[1],
                        u =
                          (((i << 8) | (i >>> 24)) & 16711935) |
                          (((i << 24) | (i >>> 8)) & 4278255360),
                        A =
                          (((c << 8) | (c >>> 24)) & 16711935) |
                          (((c << 24) | (c >>> 8)) & 4278255360),
                        m = (u >>> 16) | (A & 4294901760),
                        F = (A << 16) | (u & 65535);
                      (f[0] ^= u),
                        (f[1] ^= m),
                        (f[2] ^= A),
                        (f[3] ^= F),
                        (f[4] ^= u),
                        (f[5] ^= m),
                        (f[6] ^= A),
                        (f[7] ^= F);
                      for (var d = 0; d < 4; d++) B.call(this);
                    }
                  },
                  _doProcessBlock: function (s, h) {
                    var d = this._X;
                    B.call(this),
                      (l[0] = d[0] ^ (d[5] >>> 16) ^ (d[3] << 16)),
                      (l[1] = d[2] ^ (d[7] >>> 16) ^ (d[5] << 16)),
                      (l[2] = d[4] ^ (d[1] >>> 16) ^ (d[7] << 16)),
                      (l[3] = d[6] ^ (d[3] >>> 16) ^ (d[1] << 16));
                    for (var p = 0; p < 4; p++)
                      (l[p] =
                        (((l[p] << 8) | (l[p] >>> 24)) & 16711935) |
                        (((l[p] << 24) | (l[p] >>> 8)) & 4278255360)),
                        (s[h + p] ^= l[p]);
                  },
                  blockSize: 128 / 32,
                  ivSize: 64 / 32,
                }));
              function B() {
                for (var s = this._X, h = this._C, d = 0; d < 8; d++)
                  C[d] = h[d];
                (h[0] = (h[0] + 1295307597 + this._b) | 0),
                  (h[1] =
                    (h[1] + 3545052371 + (h[0] >>> 0 < C[0] >>> 0 ? 1 : 0)) |
                    0),
                  (h[2] =
                    (h[2] + 886263092 + (h[1] >>> 0 < C[1] >>> 0 ? 1 : 0)) | 0),
                  (h[3] =
                    (h[3] + 1295307597 + (h[2] >>> 0 < C[2] >>> 0 ? 1 : 0)) |
                    0),
                  (h[4] =
                    (h[4] + 3545052371 + (h[3] >>> 0 < C[3] >>> 0 ? 1 : 0)) |
                    0),
                  (h[5] =
                    (h[5] + 886263092 + (h[4] >>> 0 < C[4] >>> 0 ? 1 : 0)) | 0),
                  (h[6] =
                    (h[6] + 1295307597 + (h[5] >>> 0 < C[5] >>> 0 ? 1 : 0)) |
                    0),
                  (h[7] =
                    (h[7] + 3545052371 + (h[6] >>> 0 < C[6] >>> 0 ? 1 : 0)) |
                    0),
                  (this._b = h[7] >>> 0 < C[7] >>> 0 ? 1 : 0);
                for (var d = 0; d < 8; d++) {
                  var p = s[d] + h[d],
                    f = p & 65535,
                    E = p >>> 16,
                    i = ((((f * f) >>> 17) + f * E) >>> 15) + E * E,
                    c = (((p & 4294901760) * p) | 0) + (((p & 65535) * p) | 0);
                  r[d] = i ^ c;
                }
                (s[0] =
                  (r[0] +
                    ((r[7] << 16) | (r[7] >>> 16)) +
                    ((r[6] << 16) | (r[6] >>> 16))) |
                  0),
                  (s[1] = (r[1] + ((r[0] << 8) | (r[0] >>> 24)) + r[7]) | 0),
                  (s[2] =
                    (r[2] +
                      ((r[1] << 16) | (r[1] >>> 16)) +
                      ((r[0] << 16) | (r[0] >>> 16))) |
                    0),
                  (s[3] = (r[3] + ((r[2] << 8) | (r[2] >>> 24)) + r[1]) | 0),
                  (s[4] =
                    (r[4] +
                      ((r[3] << 16) | (r[3] >>> 16)) +
                      ((r[2] << 16) | (r[2] >>> 16))) |
                    0),
                  (s[5] = (r[5] + ((r[4] << 8) | (r[4] >>> 24)) + r[3]) | 0),
                  (s[6] =
                    (r[6] +
                      ((r[5] << 16) | (r[5] >>> 16)) +
                      ((r[4] << 16) | (r[4] >>> 16))) |
                    0),
                  (s[7] = (r[7] + ((r[6] << 8) | (r[6] >>> 24)) + r[5]) | 0);
              }
              e.Rabbit = x._createHelper(a);
            })(),
            t.Rabbit
          );
        });
      })(fe)),
    fe.exports
  );
}
var de = { exports: {} },
  rn = de.exports,
  wt;
function on() {
  return (
    wt ||
      ((wt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), f0(), d0(), i0(), Q());
        })(rn, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.StreamCipher,
                b = e.algo,
                l = [],
                C = [],
                r = [],
                a = (b.RabbitLegacy = x.extend({
                  _doReset: function () {
                    var s = this._key.words,
                      h = this.cfg.iv,
                      d = (this._X = [
                        s[0],
                        (s[3] << 16) | (s[2] >>> 16),
                        s[1],
                        (s[0] << 16) | (s[3] >>> 16),
                        s[2],
                        (s[1] << 16) | (s[0] >>> 16),
                        s[3],
                        (s[2] << 16) | (s[1] >>> 16),
                      ]),
                      p = (this._C = [
                        (s[2] << 16) | (s[2] >>> 16),
                        (s[0] & 4294901760) | (s[1] & 65535),
                        (s[3] << 16) | (s[3] >>> 16),
                        (s[1] & 4294901760) | (s[2] & 65535),
                        (s[0] << 16) | (s[0] >>> 16),
                        (s[2] & 4294901760) | (s[3] & 65535),
                        (s[1] << 16) | (s[1] >>> 16),
                        (s[3] & 4294901760) | (s[0] & 65535),
                      ]);
                    this._b = 0;
                    for (var f = 0; f < 4; f++) B.call(this);
                    for (var f = 0; f < 8; f++) p[f] ^= d[(f + 4) & 7];
                    if (h) {
                      var E = h.words,
                        i = E[0],
                        c = E[1],
                        u =
                          (((i << 8) | (i >>> 24)) & 16711935) |
                          (((i << 24) | (i >>> 8)) & 4278255360),
                        A =
                          (((c << 8) | (c >>> 24)) & 16711935) |
                          (((c << 24) | (c >>> 8)) & 4278255360),
                        m = (u >>> 16) | (A & 4294901760),
                        F = (A << 16) | (u & 65535);
                      (p[0] ^= u),
                        (p[1] ^= m),
                        (p[2] ^= A),
                        (p[3] ^= F),
                        (p[4] ^= u),
                        (p[5] ^= m),
                        (p[6] ^= A),
                        (p[7] ^= F);
                      for (var f = 0; f < 4; f++) B.call(this);
                    }
                  },
                  _doProcessBlock: function (s, h) {
                    var d = this._X;
                    B.call(this),
                      (l[0] = d[0] ^ (d[5] >>> 16) ^ (d[3] << 16)),
                      (l[1] = d[2] ^ (d[7] >>> 16) ^ (d[5] << 16)),
                      (l[2] = d[4] ^ (d[1] >>> 16) ^ (d[7] << 16)),
                      (l[3] = d[6] ^ (d[3] >>> 16) ^ (d[1] << 16));
                    for (var p = 0; p < 4; p++)
                      (l[p] =
                        (((l[p] << 8) | (l[p] >>> 24)) & 16711935) |
                        (((l[p] << 24) | (l[p] >>> 8)) & 4278255360)),
                        (s[h + p] ^= l[p]);
                  },
                  blockSize: 128 / 32,
                  ivSize: 64 / 32,
                }));
              function B() {
                for (var s = this._X, h = this._C, d = 0; d < 8; d++)
                  C[d] = h[d];
                (h[0] = (h[0] + 1295307597 + this._b) | 0),
                  (h[1] =
                    (h[1] + 3545052371 + (h[0] >>> 0 < C[0] >>> 0 ? 1 : 0)) |
                    0),
                  (h[2] =
                    (h[2] + 886263092 + (h[1] >>> 0 < C[1] >>> 0 ? 1 : 0)) | 0),
                  (h[3] =
                    (h[3] + 1295307597 + (h[2] >>> 0 < C[2] >>> 0 ? 1 : 0)) |
                    0),
                  (h[4] =
                    (h[4] + 3545052371 + (h[3] >>> 0 < C[3] >>> 0 ? 1 : 0)) |
                    0),
                  (h[5] =
                    (h[5] + 886263092 + (h[4] >>> 0 < C[4] >>> 0 ? 1 : 0)) | 0),
                  (h[6] =
                    (h[6] + 1295307597 + (h[5] >>> 0 < C[5] >>> 0 ? 1 : 0)) |
                    0),
                  (h[7] =
                    (h[7] + 3545052371 + (h[6] >>> 0 < C[6] >>> 0 ? 1 : 0)) |
                    0),
                  (this._b = h[7] >>> 0 < C[7] >>> 0 ? 1 : 0);
                for (var d = 0; d < 8; d++) {
                  var p = s[d] + h[d],
                    f = p & 65535,
                    E = p >>> 16,
                    i = ((((f * f) >>> 17) + f * E) >>> 15) + E * E,
                    c = (((p & 4294901760) * p) | 0) + (((p & 65535) * p) | 0);
                  r[d] = i ^ c;
                }
                (s[0] =
                  (r[0] +
                    ((r[7] << 16) | (r[7] >>> 16)) +
                    ((r[6] << 16) | (r[6] >>> 16))) |
                  0),
                  (s[1] = (r[1] + ((r[0] << 8) | (r[0] >>> 24)) + r[7]) | 0),
                  (s[2] =
                    (r[2] +
                      ((r[1] << 16) | (r[1] >>> 16)) +
                      ((r[0] << 16) | (r[0] >>> 16))) |
                    0),
                  (s[3] = (r[3] + ((r[2] << 8) | (r[2] >>> 24)) + r[1]) | 0),
                  (s[4] =
                    (r[4] +
                      ((r[3] << 16) | (r[3] >>> 16)) +
                      ((r[2] << 16) | (r[2] >>> 16))) |
                    0),
                  (s[5] = (r[5] + ((r[4] << 8) | (r[4] >>> 24)) + r[3]) | 0),
                  (s[6] =
                    (r[6] +
                      ((r[5] << 16) | (r[5] >>> 16)) +
                      ((r[4] << 16) | (r[4] >>> 16))) |
                    0),
                  (s[7] = (r[7] + ((r[6] << 8) | (r[6] >>> 24)) + r[5]) | 0);
              }
              e.RabbitLegacy = x._createHelper(a);
            })(),
            t.RabbitLegacy
          );
        });
      })(de)),
    de.exports
  );
}
var ue = { exports: {} },
  nn = ue.exports,
  St;
function sn() {
  return (
    St ||
      ((St = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(N(), f0(), d0(), i0(), Q());
        })(nn, function (t) {
          return (
            (function () {
              var e = t,
                v = e.lib,
                x = v.BlockCipher,
                b = e.algo;
              const l = 16,
                C = [
                  608135816, 2242054355, 320440878, 57701188, 2752067618,
                  698298832, 137296536, 3964562569, 1160258022, 953160567,
                  3193202383, 887688300, 3232508343, 3380367581, 1065670069,
                  3041331479, 2450970073, 2306472731,
                ],
                r = [
                  [
                    3509652390, 2564797868, 805139163, 3491422135, 3101798381,
                    1780907670, 3128725573, 4046225305, 614570311, 3012652279,
                    134345442, 2240740374, 1667834072, 1901547113, 2757295779,
                    4103290238, 227898511, 1921955416, 1904987480, 2182433518,
                    2069144605, 3260701109, 2620446009, 720527379, 3318853667,
                    677414384, 3393288472, 3101374703, 2390351024, 1614419982,
                    1822297739, 2954791486, 3608508353, 3174124327, 2024746970,
                    1432378464, 3864339955, 2857741204, 1464375394, 1676153920,
                    1439316330, 715854006, 3033291828, 289532110, 2706671279,
                    2087905683, 3018724369, 1668267050, 732546397, 1947742710,
                    3462151702, 2609353502, 2950085171, 1814351708, 2050118529,
                    680887927, 999245976, 1800124847, 3300911131, 1713906067,
                    1641548236, 4213287313, 1216130144, 1575780402, 4018429277,
                    3917837745, 3693486850, 3949271944, 596196993, 3549867205,
                    258830323, 2213823033, 772490370, 2760122372, 1774776394,
                    2652871518, 566650946, 4142492826, 1728879713, 2882767088,
                    1783734482, 3629395816, 2517608232, 2874225571, 1861159788,
                    326777828, 3124490320, 2130389656, 2716951837, 967770486,
                    1724537150, 2185432712, 2364442137, 1164943284, 2105845187,
                    998989502, 3765401048, 2244026483, 1075463327, 1455516326,
                    1322494562, 910128902, 469688178, 1117454909, 936433444,
                    3490320968, 3675253459, 1240580251, 122909385, 2157517691,
                    634681816, 4142456567, 3825094682, 3061402683, 2540495037,
                    79693498, 3249098678, 1084186820, 1583128258, 426386531,
                    1761308591, 1047286709, 322548459, 995290223, 1845252383,
                    2603652396, 3431023940, 2942221577, 3202600964, 3727903485,
                    1712269319, 422464435, 3234572375, 1170764815, 3523960633,
                    3117677531, 1434042557, 442511882, 3600875718, 1076654713,
                    1738483198, 4213154764, 2393238008, 3677496056, 1014306527,
                    4251020053, 793779912, 2902807211, 842905082, 4246964064,
                    1395751752, 1040244610, 2656851899, 3396308128, 445077038,
                    3742853595, 3577915638, 679411651, 2892444358, 2354009459,
                    1767581616, 3150600392, 3791627101, 3102740896, 284835224,
                    4246832056, 1258075500, 768725851, 2589189241, 3069724005,
                    3532540348, 1274779536, 3789419226, 2764799539, 1660621633,
                    3471099624, 4011903706, 913787905, 3497959166, 737222580,
                    2514213453, 2928710040, 3937242737, 1804850592, 3499020752,
                    2949064160, 2386320175, 2390070455, 2415321851, 4061277028,
                    2290661394, 2416832540, 1336762016, 1754252060, 3520065937,
                    3014181293, 791618072, 3188594551, 3933548030, 2332172193,
                    3852520463, 3043980520, 413987798, 3465142937, 3030929376,
                    4245938359, 2093235073, 3534596313, 375366246, 2157278981,
                    2479649556, 555357303, 3870105701, 2008414854, 3344188149,
                    4221384143, 3956125452, 2067696032, 3594591187, 2921233993,
                    2428461, 544322398, 577241275, 1471733935, 610547355,
                    4027169054, 1432588573, 1507829418, 2025931657, 3646575487,
                    545086370, 48609733, 2200306550, 1653985193, 298326376,
                    1316178497, 3007786442, 2064951626, 458293330, 2589141269,
                    3591329599, 3164325604, 727753846, 2179363840, 146436021,
                    1461446943, 4069977195, 705550613, 3059967265, 3887724982,
                    4281599278, 3313849956, 1404054877, 2845806497, 146425753,
                    1854211946,
                  ],
                  [
                    1266315497, 3048417604, 3681880366, 3289982499, 290971e4,
                    1235738493, 2632868024, 2414719590, 3970600049, 1771706367,
                    1449415276, 3266420449, 422970021, 1963543593, 2690192192,
                    3826793022, 1062508698, 1531092325, 1804592342, 2583117782,
                    2714934279, 4024971509, 1294809318, 4028980673, 1289560198,
                    2221992742, 1669523910, 35572830, 157838143, 1052438473,
                    1016535060, 1802137761, 1753167236, 1386275462, 3080475397,
                    2857371447, 1040679964, 2145300060, 2390574316, 1461121720,
                    2956646967, 4031777805, 4028374788, 33600511, 2920084762,
                    1018524850, 629373528, 3691585981, 3515945977, 2091462646,
                    2486323059, 586499841, 988145025, 935516892, 3367335476,
                    2599673255, 2839830854, 265290510, 3972581182, 2759138881,
                    3795373465, 1005194799, 847297441, 406762289, 1314163512,
                    1332590856, 1866599683, 4127851711, 750260880, 613907577,
                    1450815602, 3165620655, 3734664991, 3650291728, 3012275730,
                    3704569646, 1427272223, 778793252, 1343938022, 2676280711,
                    2052605720, 1946737175, 3164576444, 3914038668, 3967478842,
                    3682934266, 1661551462, 3294938066, 4011595847, 840292616,
                    3712170807, 616741398, 312560963, 711312465, 1351876610,
                    322626781, 1910503582, 271666773, 2175563734, 1594956187,
                    70604529, 3617834859, 1007753275, 1495573769, 4069517037,
                    2549218298, 2663038764, 504708206, 2263041392, 3941167025,
                    2249088522, 1514023603, 1998579484, 1312622330, 694541497,
                    2582060303, 2151582166, 1382467621, 776784248, 2618340202,
                    3323268794, 2497899128, 2784771155, 503983604, 4076293799,
                    907881277, 423175695, 432175456, 1378068232, 4145222326,
                    3954048622, 3938656102, 3820766613, 2793130115, 2977904593,
                    26017576, 3274890735, 3194772133, 1700274565, 1756076034,
                    4006520079, 3677328699, 720338349, 1533947780, 354530856,
                    688349552, 3973924725, 1637815568, 332179504, 3949051286,
                    53804574, 2852348879, 3044236432, 1282449977, 3583942155,
                    3416972820, 4006381244, 1617046695, 2628476075, 3002303598,
                    1686838959, 431878346, 2686675385, 1700445008, 1080580658,
                    1009431731, 832498133, 3223435511, 2605976345, 2271191193,
                    2516031870, 1648197032, 4164389018, 2548247927, 300782431,
                    375919233, 238389289, 3353747414, 2531188641, 2019080857,
                    1475708069, 455242339, 2609103871, 448939670, 3451063019,
                    1395535956, 2413381860, 1841049896, 1491858159, 885456874,
                    4264095073, 4001119347, 1565136089, 3898914787, 1108368660,
                    540939232, 1173283510, 2745871338, 3681308437, 4207628240,
                    3343053890, 4016749493, 1699691293, 1103962373, 3625875870,
                    2256883143, 3830138730, 1031889488, 3479347698, 1535977030,
                    4236805024, 3251091107, 2132092099, 1774941330, 1199868427,
                    1452454533, 157007616, 2904115357, 342012276, 595725824,
                    1480756522, 206960106, 497939518, 591360097, 863170706,
                    2375253569, 3596610801, 1814182875, 2094937945, 3421402208,
                    1082520231, 3463918190, 2785509508, 435703966, 3908032597,
                    1641649973, 2842273706, 3305899714, 1510255612, 2148256476,
                    2655287854, 3276092548, 4258621189, 236887753, 3681803219,
                    274041037, 1734335097, 3815195456, 3317970021, 1899903192,
                    1026095262, 4050517792, 356393447, 2410691914, 3873677099,
                    3682840055,
                  ],
                  [
                    3913112168, 2491498743, 4132185628, 2489919796, 1091903735,
                    1979897079, 3170134830, 3567386728, 3557303409, 857797738,
                    1136121015, 1342202287, 507115054, 2535736646, 337727348,
                    3213592640, 1301675037, 2528481711, 1895095763, 1721773893,
                    3216771564, 62756741, 2142006736, 835421444, 2531993523,
                    1442658625, 3659876326, 2882144922, 676362277, 1392781812,
                    170690266, 3921047035, 1759253602, 3611846912, 1745797284,
                    664899054, 1329594018, 3901205900, 3045908486, 2062866102,
                    2865634940, 3543621612, 3464012697, 1080764994, 553557557,
                    3656615353, 3996768171, 991055499, 499776247, 1265440854,
                    648242737, 3940784050, 980351604, 3713745714, 1749149687,
                    3396870395, 4211799374, 3640570775, 1161844396, 3125318951,
                    1431517754, 545492359, 4268468663, 3499529547, 1437099964,
                    2702547544, 3433638243, 2581715763, 2787789398, 1060185593,
                    1593081372, 2418618748, 4260947970, 69676912, 2159744348,
                    86519011, 2512459080, 3838209314, 1220612927, 3339683548,
                    133810670, 1090789135, 1078426020, 1569222167, 845107691,
                    3583754449, 4072456591, 1091646820, 628848692, 1613405280,
                    3757631651, 526609435, 236106946, 48312990, 2942717905,
                    3402727701, 1797494240, 859738849, 992217954, 4005476642,
                    2243076622, 3870952857, 3732016268, 765654824, 3490871365,
                    2511836413, 1685915746, 3888969200, 1414112111, 2273134842,
                    3281911079, 4080962846, 172450625, 2569994100, 980381355,
                    4109958455, 2819808352, 2716589560, 2568741196, 3681446669,
                    3329971472, 1835478071, 660984891, 3704678404, 4045999559,
                    3422617507, 3040415634, 1762651403, 1719377915, 3470491036,
                    2693910283, 3642056355, 3138596744, 1364962596, 2073328063,
                    1983633131, 926494387, 3423689081, 2150032023, 4096667949,
                    1749200295, 3328846651, 309677260, 2016342300, 1779581495,
                    3079819751, 111262694, 1274766160, 443224088, 298511866,
                    1025883608, 3806446537, 1145181785, 168956806, 3641502830,
                    3584813610, 1689216846, 3666258015, 3200248200, 1692713982,
                    2646376535, 4042768518, 1618508792, 1610833997, 3523052358,
                    4130873264, 2001055236, 3610705100, 2202168115, 4028541809,
                    2961195399, 1006657119, 2006996926, 3186142756, 1430667929,
                    3210227297, 1314452623, 4074634658, 4101304120, 2273951170,
                    1399257539, 3367210612, 3027628629, 1190975929, 2062231137,
                    2333990788, 2221543033, 2438960610, 1181637006, 548689776,
                    2362791313, 3372408396, 3104550113, 3145860560, 296247880,
                    1970579870, 3078560182, 3769228297, 1714227617, 3291629107,
                    3898220290, 166772364, 1251581989, 493813264, 448347421,
                    195405023, 2709975567, 677966185, 3703036547, 1463355134,
                    2715995803, 1338867538, 1343315457, 2802222074, 2684532164,
                    233230375, 2599980071, 2000651841, 3277868038, 1638401717,
                    4028070440, 3237316320, 6314154, 819756386, 300326615,
                    590932579, 1405279636, 3267499572, 3150704214, 2428286686,
                    3959192993, 3461946742, 1862657033, 1266418056, 963775037,
                    2089974820, 2263052895, 1917689273, 448879540, 3550394620,
                    3981727096, 150775221, 3627908307, 1303187396, 508620638,
                    2975983352, 2726630617, 1817252668, 1876281319, 1457606340,
                    908771278, 3720792119, 3617206836, 2455994898, 1729034894,
                    1080033504,
                  ],
                  [
                    976866871, 3556439503, 2881648439, 1522871579, 1555064734,
                    1336096578, 3548522304, 2579274686, 3574697629, 3205460757,
                    3593280638, 3338716283, 3079412587, 564236357, 2993598910,
                    1781952180, 1464380207, 3163844217, 3332601554, 1699332808,
                    1393555694, 1183702653, 3581086237, 1288719814, 691649499,
                    2847557200, 2895455976, 3193889540, 2717570544, 1781354906,
                    1676643554, 2592534050, 3230253752, 1126444790, 2770207658,
                    2633158820, 2210423226, 2615765581, 2414155088, 3127139286,
                    673620729, 2805611233, 1269405062, 4015350505, 3341807571,
                    4149409754, 1057255273, 2012875353, 2162469141, 2276492801,
                    2601117357, 993977747, 3918593370, 2654263191, 753973209,
                    36408145, 2530585658, 25011837, 3520020182, 2088578344,
                    530523599, 2918365339, 1524020338, 1518925132, 3760827505,
                    3759777254, 1202760957, 3985898139, 3906192525, 674977740,
                    4174734889, 2031300136, 2019492241, 3983892565, 4153806404,
                    3822280332, 352677332, 2297720250, 60907813, 90501309,
                    3286998549, 1016092578, 2535922412, 2839152426, 457141659,
                    509813237, 4120667899, 652014361, 1966332200, 2975202805,
                    55981186, 2327461051, 676427537, 3255491064, 2882294119,
                    3433927263, 1307055953, 942726286, 933058658, 2468411793,
                    3933900994, 4215176142, 1361170020, 2001714738, 2830558078,
                    3274259782, 1222529897, 1679025792, 2729314320, 3714953764,
                    1770335741, 151462246, 3013232138, 1682292957, 1483529935,
                    471910574, 1539241949, 458788160, 3436315007, 1807016891,
                    3718408830, 978976581, 1043663428, 3165965781, 1927990952,
                    4200891579, 2372276910, 3208408903, 3533431907, 1412390302,
                    2931980059, 4132332400, 1947078029, 3881505623, 4168226417,
                    2941484381, 1077988104, 1320477388, 886195818, 18198404,
                    3786409e3, 2509781533, 112762804, 3463356488, 1866414978,
                    891333506, 18488651, 661792760, 1628790961, 3885187036,
                    3141171499, 876946877, 2693282273, 1372485963, 791857591,
                    2686433993, 3759982718, 3167212022, 3472953795, 2716379847,
                    445679433, 3561995674, 3504004811, 3574258232, 54117162,
                    3331405415, 2381918588, 3769707343, 4154350007, 1140177722,
                    4074052095, 668550556, 3214352940, 367459370, 261225585,
                    2610173221, 4209349473, 3468074219, 3265815641, 314222801,
                    3066103646, 3808782860, 282218597, 3406013506, 3773591054,
                    379116347, 1285071038, 846784868, 2669647154, 3771962079,
                    3550491691, 2305946142, 453669953, 1268987020, 3317592352,
                    3279303384, 3744833421, 2610507566, 3859509063, 266596637,
                    3847019092, 517658769, 3462560207, 3443424879, 370717030,
                    4247526661, 2224018117, 4143653529, 4112773975, 2788324899,
                    2477274417, 1456262402, 2901442914, 1517677493, 1846949527,
                    2295493580, 3734397586, 2176403920, 1280348187, 1908823572,
                    3871786941, 846861322, 1172426758, 3287448474, 3383383037,
                    1655181056, 3139813346, 901632758, 1897031941, 2986607138,
                    3066810236, 3447102507, 1393639104, 373351379, 950779232,
                    625454576, 3124240540, 4148612726, 2007998917, 544563296,
                    2244738638, 2330496472, 2058025392, 1291430526, 424198748,
                    50039436, 29584100, 3605783033, 2429876329, 2791104160,
                    1057563949, 3255363231, 3075367218, 3463963227, 1469046755,
                    985887462,
                  ],
                ];
              var a = { pbox: [], sbox: [] };
              function B(f, E) {
                let i = (E >> 24) & 255,
                  c = (E >> 16) & 255,
                  u = (E >> 8) & 255,
                  A = E & 255,
                  m = f.sbox[0][i] + f.sbox[1][c];
                return (m = m ^ f.sbox[2][u]), (m = m + f.sbox[3][A]), m;
              }
              function s(f, E, i) {
                let c = E,
                  u = i,
                  A;
                for (let m = 0; m < l; ++m)
                  (c = c ^ f.pbox[m]),
                    (u = B(f, c) ^ u),
                    (A = c),
                    (c = u),
                    (u = A);
                return (
                  (A = c),
                  (c = u),
                  (u = A),
                  (u = u ^ f.pbox[l]),
                  (c = c ^ f.pbox[l + 1]),
                  { left: c, right: u }
                );
              }
              function h(f, E, i) {
                let c = E,
                  u = i,
                  A;
                for (let m = l + 1; m > 1; --m)
                  (c = c ^ f.pbox[m]),
                    (u = B(f, c) ^ u),
                    (A = c),
                    (c = u),
                    (u = A);
                return (
                  (A = c),
                  (c = u),
                  (u = A),
                  (u = u ^ f.pbox[1]),
                  (c = c ^ f.pbox[0]),
                  { left: c, right: u }
                );
              }
              function d(f, E, i) {
                for (let F = 0; F < 4; F++) {
                  f.sbox[F] = [];
                  for (let _ = 0; _ < 256; _++) f.sbox[F][_] = r[F][_];
                }
                let c = 0;
                for (let F = 0; F < l + 2; F++)
                  (f.pbox[F] = C[F] ^ E[c]), c++, c >= i && (c = 0);
                let u = 0,
                  A = 0,
                  m = 0;
                for (let F = 0; F < l + 2; F += 2)
                  (m = s(f, u, A)),
                    (u = m.left),
                    (A = m.right),
                    (f.pbox[F] = u),
                    (f.pbox[F + 1] = A);
                for (let F = 0; F < 4; F++)
                  for (let _ = 0; _ < 256; _ += 2)
                    (m = s(f, u, A)),
                      (u = m.left),
                      (A = m.right),
                      (f.sbox[F][_] = u),
                      (f.sbox[F][_ + 1] = A);
                return !0;
              }
              var p = (b.Blowfish = x.extend({
                _doReset: function () {
                  if (this._keyPriorReset !== this._key) {
                    var f = (this._keyPriorReset = this._key),
                      E = f.words,
                      i = f.sigBytes / 4;
                    d(a, E, i);
                  }
                },
                encryptBlock: function (f, E) {
                  var i = s(a, f[E], f[E + 1]);
                  (f[E] = i.left), (f[E + 1] = i.right);
                },
                decryptBlock: function (f, E) {
                  var i = h(a, f[E], f[E + 1]);
                  (f[E] = i.left), (f[E + 1] = i.right);
                },
                blockSize: 64 / 32,
                keySize: 128 / 32,
                ivSize: 64 / 32,
              }));
              e.Blowfish = x._createHelper(p);
            })(),
            t.Blowfish
          );
        });
      })(ue)),
    ue.exports
  );
}
var an = H0.exports,
  kt;
function xn() {
  return (
    kt ||
      ((kt = 1),
      (function (n, o) {
        (function (t, e, v) {
          n.exports = e(
            N(),
            Ee(),
            ro(),
            no(),
            f0(),
            io(),
            d0(),
            Mt(),
            Re(),
            uo(),
            Ot(),
            po(),
            Eo(),
            go(),
            He(),
            mo(),
            i0(),
            Q(),
            _o(),
            So(),
            Ro(),
            To(),
            Io(),
            Wo(),
            qo(),
            Mo(),
            $o(),
            Go(),
            Ko(),
            Xo(),
            jo(),
            Jo(),
            tn(),
            on(),
            sn()
          );
        })(an, function (t) {
          return t;
        });
      })(H0)),
    H0.exports
  );
}
var cn = xn();
const ve = Ht(cn),
  ln = "r8PJqx2IchPDvRA9V6",
  fn = "r8PJqx2IchPDvRA9V6o",
  dn = "oXIYLyedyTooh5BrXj",
  un = "XIYLyedyTooh5BrXjBAUIpmmoq",
  hn = "BAUIpmmoqJyPrHz555LY5s3",
  vn = "JyPrHz555LY5s3EAPeE",
  pn = (n, o) => {
    console.log(
      "[Crypto] 🔐 pn: Generating signature for data:",
      n,
      "with key:",
      o
    );
    const t = o,
      v = `${`${ln}${dn}${hn}`}${t}`;
    console.log("[Crypto] 🔑 pn: Constructed full secret key");
    const result = ve.HmacSHA256(n, v).toString(ve.enc.Hex);
    console.log("[Crypto] ✅ pn: Generated signature:", result);
    return result;
  },
  yn = (n) => {
    console.log("[Crypto] 🔐 yn: Generating HMAC signature for data:", n);
    const o = `${fn}${un}${vn}`;
    console.log("[Crypto] 🔑 yn: Using secret key for HMAC generation");
    const result = ve.HmacSHA256(n, o).toString(ve.enc.Hex);
    console.log("[Crypto] ✅ yn: Generated HMAC signature:", result);
    return result;
  },
  c0 = class c0 {
    constructor() {
      console.log(
        "[YTEventReport] 🔧 Constructor: Initializing YouTube Event Report system"
      );
      I(this, "reportTimer", null);
      I(this, "isActive", !1);
      I(this, "reportInterval", 1e4);
      I(this, "videoId", null);
      I(this, "customerId", null);
      I(this, "sessionId", null);
      I(this, "events", []);
      I(this, "clientIp", "");
      I(this, "videoElement", null);
      I(this, "lastTime", -1);
      I(this, "observer", null);
      I(this, "tabActive", !0);
      I(this, "windowFocus", !0);
      I(this, "throttleTimer", null);
      I(this, "batchEvents", []);
      I(this, "lastReportTime", 0);
      I(this, "minReportInterval", 3e3);
      I(this, "maxBatchSize", 10);
      I(this, "isShort", !1);
      I(this, "reportKey", "");
      console.log(
        "[YTEventReport] ✅ Constructor: Event report system initialized with config:",
        {
          reportInterval: this.reportInterval,
          minReportInterval: this.minReportInterval,
          maxBatchSize: this.maxBatchSize,
        }
      );
      I(this, "eventReportData", () => {
        console.log(
          "[YTEventReport] 📊 eventReportData: Starting event report process",
          {
            sessionId: this.sessionId,
            customerId: this.customerId,
            reportKey: this.reportKey,
            eventsCount: this.events.length,
          }
        );
        if (!this.sessionId) {
          console.log(
            "[YTEventReport] ❌ eventReportData: sessionId is null, aborting report"
          );
          return;
        }
        if (!this.customerId) {
          console.log(
            "[YTEventReport] ❌ eventReportData: customerId is null, aborting report"
          );
          return;
        }
        if (!this.reportKey) {
          console.log(
            "[YTEventReport] ❌ eventReportData: reportKey is null, aborting report"
          );
          return;
        }
        const o = this.events;
        if (this.events.length === 0) {
          console.log(
            "[YTEventReport] 📝 eventReportData: No events found, creating default event"
          );
          const C = this.defaultEventConfig();
          if (!C) {
            console.log(
              "[YTEventReport] ❌ eventReportData: Failed to create default event config"
            );
            return;
          }
          o.push(C),
            console.log(
              "[YTEventReport] ✅ eventReportData: Added default event to report"
            );
        }
        const t = Kr(),
          e = Date.now(),
          v = `${e}|${this.sessionId}|${this.customerId}`,
          x = pn(v, this.reportKey);
        console.log(
          "[YTEventReport] 🔐 eventReportData: Generated signature data:",
          {
            timestamp: e,
            signatureInput: v,
            signature: x,
            deviceFinger: t,
          }
        );
        const b = {
          sessionId: this.sessionId || "",
          customerId: this.customerId,
          signature: x,
          socialPlatform: "YouTube",
          socialEvent: "watch",
          events: o,
          deviceFinger: t,
          clientIp: this.clientIp,
        };
        console.log(
          "[YTEventReport] 📤 eventReportData: Prepared event data for sending:",
          b
        );
        const l = { messageType: Se.EVREP, timestamp: e, eventData: b };
        console.log(
          "[YTEventReport] 📨 eventReportData: Final message structure:",
          l
        );
        if ((Ae.notifyVideoActivity(), he.canSend()))
          try {
            console.log(
              "[YTEventReport] 🚀 eventReportData: Sending event report via WebSocket"
            );
            he.send(l), (this.lastReportTime = Date.now());
            console.log(
              "[YTEventReport] ✅ eventReportData: Event report sent successfully"
            );
          } catch (C) {
            console.log(
              "[YTEventReport] ❌ eventReportData: Failed to send event report:",
              C
            ),
              this.handleSendError(C);
          }
        else
          console.log(
            "[YTEventReport] ⚠️ eventReportData: WebSocket not connected, attempting reconnect"
          ),
            this.attemptReconnect();
        console.log(
          "[YTEventReport] 🔄 eventReportData: Clearing events array"
        );
        this.events = [];
      });
      I(this, "setEventDetail", (o, t) => {
        console.log("[YTEventReport] 📝 setEventDetail: Adding event detail", {
          eventType: o,
          details: t,
          currentEventsCount: this.events.length,
          maxBatchSize: this.maxBatchSize,
        });
        const e = { eventType: o, timestamp: Date.now(), details: t };
        console.log(
          "[YTEventReport] 📊 setEventDetail: Created event object:",
          e
        );
        this.events.push(e),
          console.log(
            "[YTEventReport] ✅ setEventDetail: Event added to queue, new count:",
            this.events.length
          ),
          this.events.length > this.maxBatchSize &&
            (console.log(
              "[YTEventReport] ⚠️ setEventDetail: Max batch size exceeded, trimming events"
            ),
            (this.events = this.events.slice(-this.maxBatchSize)),
            console.log(
              "[YTEventReport] ✂️ setEventDetail: Events trimmed to max size:",
              this.events.length
            ));
      });
      I(this, "defaultEventConfig", () => {
        const o = this.getVideoConfig();
        return o || null;
      });
      I(this, "createDefaultEvent", (o, t) => {
        let e = Y.PLAYING,
          v = "playingData";
        o === Y.PAUSED
          ? ((e = Y.PAUSED), (v = "pausedData"))
          : o === Y.END && ((e = Y.END), (v = "endData"));
        const x = {
            newState: e,
            currentTime: t.currentTime,
            playbackRate: t.playbackRate,
          },
          b = { [v]: x };
        return { eventType: e, timestamp: Date.now(), details: b };
      });
      I(this, "getVideoConfig", () => {
        const o = this.findVideoElement();
        return o
          ? o.paused
            ? this.createDefaultEvent(Y.PAUSED, o)
            : this.createDefaultEvent(Y.PLAYING, o)
          : null;
      });
      I(this, "initVideoListener", () => {
        if (
          ((this.videoElement = this.findVideoElement()), !this.videoElement)
        ) {
          setTimeout(() => this.initVideoListener(), 500);
          return;
        }
        try {
          this.videoElement.addEventListener("play", () => {
            this.handleVideoPlay();
          }),
            this.videoElement.addEventListener("pause", () => {
              this.handleVideoPause();
            }),
            this.videoElement.addEventListener("ended", () => {
              this.handleVideoEnd();
            }),
            this.videoElement.addEventListener("timeupdate", () => {
              this.handleTimeUpdate();
            }),
            console.log("[YTEventReport] 视频监听器设置成功"),
            this.setupMutationObserver();
        } catch (o) {
          console.error("[YTEventReport] 设置视频监听器失败:", o),
            (this.videoElement = null),
            setTimeout(() => this.initVideoListener(), 1e3);
        }
      });
      if (typeof document > "u" || typeof window > "u") {
        console.log(
          "[YouTube SocketHeartReport] Not in browser environment, skipping initialization"
        );
        return;
      }
      document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", () => {
            this.initialize();
          })
        : this.initialize();
    }
    initialize() {
      "requestIdleCallback" in window
        ? requestIdleCallback(
            () => {
              this.setupEventListeners(), this.initVideoListener();
            },
            { timeout: 3e3 }
          )
        : setTimeout(() => {
            this.setupEventListeners(), this.initVideoListener();
          }, 500);
    }
    static getInstance() {
      return c0.instance || (c0.instance = new c0()), c0.instance;
    }
    async init() {
      (this.videoId = this.extractVideoId()),
        Qr()
          .then((o) => {
            this.clientIp = o;
          })
          .catch((o) => {
            console.warn("[YTEventReport] 获取客户端IP失败:", o),
              (this.clientIp = "");
          }),
        await this.start();
    }
    extractVideoId() {
      const o = window.location.href,
        e = new URLSearchParams(window.location.search).get("v");
      if (e) return e;
      const v = o.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
      if (v && v[1]) return (this.isShort = !0), v[1];
      const x = o.match(/youtube\.com\/(?:watch\?v=|shorts\/)([a-zA-Z0-9_-]+)/);
      return x && x[1]
        ? x[1]
        : (console.warn("[YTEventReport] 无法从URL中提取videoId:", o), "");
    }
    async start() {
      var o, t, e;
      if (
        !this.isActive &&
        ((this.isActive = !0),
        console.log("[YouTube SocketHeartReport] 启动数据上报"),
        this.videoId)
      )
        try {
          const [v, x] = await Promise.all([
            Gr(),
            Ur(this == null ? void 0 : this.videoId),
          ]);
          if (!(v != null && v.success)) {
            console.log("passportInfo failed:", v);
            return;
          }
          if (!(x != null && x.success)) {
            console.log("sessionInit failed:", x);
            return;
          }
          const b = (o = x == null ? void 0 : x.data) == null ? void 0 : o.obj;
          (this.customerId =
            (e = (t = v == null ? void 0 : v.data) == null ? void 0 : t.obj) ==
            null
              ? void 0
              : e.passportId),
            (this.sessionId = b == null ? void 0 : b.sessionId),
            (this.reportKey = b == null ? void 0 : b.reportKey);
          const l = (this.reportInterval = this.isShort ? 3e3 : 1e4);
          console.log(
            `[YouTube SocketHeartReport] 视频类型: ${
              this.isShort ? "短视频" : "普通视频"
            }, 上报间隔: ${this.reportInterval}ms`
          ),
            this.scheduleEventReport(),
            (this.reportTimer = setInterval(() => {
              this.scheduleEventReport();
            }, this.reportInterval));
        } catch (v) {
          console.error("初始化失败:", v), this.stop();
        }
    }
    stop() {
      this.isActive &&
        ((this.isActive = !1),
        console.log("[YouTube SocketHeartReport] 停止数据上报"),
        this.reportTimer &&
          (clearInterval(this.reportTimer), (this.reportTimer = null)),
        this.throttleTimer &&
          (clearTimeout(this.throttleTimer), (this.throttleTimer = null)),
        Ae.notifyVideoActivityStopped(),
        this.cleanupVideoListener());
    }
    scheduleEventReport() {
      Date.now() - this.lastReportTime < this.minReportInterval ||
        ("requestIdleCallback" in window
          ? requestIdleCallback(
              () => {
                this.eventReportData();
              },
              { timeout: 2e3 }
            )
          : setTimeout(() => {
              this.eventReportData();
            }, 100));
    }
    findVideoElement() {
      const o = document == null ? void 0 : document.querySelector("video");
      return o &&
        o instanceof HTMLVideoElement &&
        typeof o.addEventListener == "function"
        ? o
        : null;
    }
    setupMutationObserver() {
      this.observer && this.observer.disconnect(),
        (this.observer = new MutationObserver((o) => {
          const t = this.findVideoElement();
          t &&
            t !== this.videoElement &&
            ((this.videoElement = t), this.initVideoListener());
        })),
        this.observer.observe(document == null ? void 0 : document.body, {
          childList: !0,
          subtree: !0,
        });
    }
    cleanupVideoListener() {
      this.videoElement &&
        (this.videoElement.removeEventListener(
          "play",
          this.handleVideoPlay.bind(this)
        ),
        this.videoElement.removeEventListener(
          "pause",
          this.handleVideoPause.bind(this)
        ),
        this.videoElement.removeEventListener(
          "ended",
          this.handleVideoEnd.bind(this)
        ),
        this.videoElement.removeEventListener(
          "timeupdate",
          this.handleTimeUpdate.bind(this)
        ),
        (this.videoElement = null)),
        this.observer && (this.observer.disconnect(), (this.observer = null)),
        (this.lastTime = -1);
    }
    handleTimeUpdate() {
      if (!this.videoElement) {
        console.log(
          "[YTEventReport] ⚠️ handleTimeUpdate: No video element available"
        );
        return;
      }
      const o = this.videoElement.currentTime;
      console.log(
        "[YTEventReport] ⏱️ handleTimeUpdate: Current time:",
        o,
        "Last time:",
        this.lastTime
      );
      if (this.lastTime !== -1) {
        const t = o - this.lastTime;
        console.log("[YTEventReport] 🔄 handleTimeUpdate: Time difference:", t);
        Math.abs(t) > 1 &&
          (console.log(
            "[YTEventReport] ⏭️ handleTimeUpdate: Large time jump detected, handling seek"
          ),
          this.handleSeek(t));
      }
      this.lastTime = o;
    }
    getBrowserState() {
      return { tabActive: this.tabActive, windowFocus: this.windowFocus };
    }
    destroy() {
      console.log("[YTEventReport] 🧹 destroy: Starting cleanup process", {
        isActive: this.isActive,
        hasVideoElement: !!this.videoElement,
        hasObserver: !!this.observer,
      });
      this.stop(),
        Ae.notifyVideoActivityStopped(),
        console.log(
          "[YTEventReport] 🔄 destroy: Stopped reporting and notified video activity stopped"
        ),
        document &&
          (console.log(
            "[YTEventReport] 📱 destroy: Removing document event listeners"
          ),
          document.removeEventListener(
            "visibilitychange",
            this.handleVisibilityChange.bind(this)
          ),
          window.removeEventListener(
            "focus",
            this.handleWindowFocus.bind(this)
          ),
          window.removeEventListener("blur", this.handleWindowBlur.bind(this)));
      console.log("[YTEventReport] ✅ destroy: Cleanup completed");
    }
    setupEventListeners() {
      console.log(
        "[YTEventReport] 🔧 setupEventListeners: Setting up document and window event listeners"
      );
      document &&
        (console.log(
          "[YTEventReport] 📱 setupEventListeners: Adding visibilitychange listener"
        ),
        document.addEventListener(
          "visibilitychange",
          this.handleVisibilityChange.bind(this)
        ),
        console.log(
          "[YTEventReport] 🪟 setupEventListeners: Adding window focus/blur listeners"
        ),
        window.addEventListener("focus", this.handleWindowFocus.bind(this)),
        window.addEventListener("blur", this.handleWindowBlur.bind(this)));
      console.log(
        "[YTEventReport] ✅ setupEventListeners: Event listeners setup completed"
      );
    }
    handleVisibilityChange() {
      const o = this.tabActive;
      console.log(
        "[YTEventReport] 👁️ handleVisibilityChange: Visibility change detected",
        {
          previousTabActive: o,
          documentHidden: document != null && document.hidden,
        }
      );
      (this.tabActive = !(document != null && document.hidden)),
        console.log(
          "[YTEventReport] 📊 handleVisibilityChange: New tab active state:",
          this.tabActive
        ),
        o && !this.tabActive
          ? (console.log(
              "[YTEventReport] 🌙 handleVisibilityChange: Tab became inactive, handling focus lost"
            ),
            this.handleFocusLost())
          : !o &&
            this.tabActive &&
            (console.log(
              "[YTEventReport] 🌅 handleVisibilityChange: Tab became active, handling focus gained"
            ),
            this.handleFocusGained());
    }
    handleWindowFocus() {
      const o = this.windowFocus;
      (this.windowFocus = !0),
        !o && this.windowFocus && this.handleFocusGained();
    }
    handleWindowBlur() {
      const o = this.windowFocus;
      (this.windowFocus = !1), o && !this.windowFocus && this.handleFocusLost();
    }
    handleFocusLost() {
      const o = { tabActive: this.tabActive, windowFocused: this.windowFocus };
      console.log(
        "[YTEventReport] 🌙 handleFocusLost: Focus lost event detected",
        o
      );
      this.setEventDetail(Y.FOCUS_LOST, { focusLostData: o });
    }
    handleFocusGained() {
      const o = { tabActive: this.tabActive, windowFocused: this.windowFocus };
      console.log(
        "[YTEventReport] 🌅 handleFocusGained: Focus gained event detected",
        o
      );
      this.setEventDetail(Y.FOCUS_GAINED, { focusGainedData: o });
    }
    handleVideoPlay() {
      var o, t;
      console.log(
        "[YTEventReport] ▶️ handleVideoPlay: Video play event detected"
      );
      const playingData = {
        newState: "PLAYING",
        currentTime:
          ((o = this.videoElement) == null ? void 0 : o.currentTime) || 0,
        playbackRate:
          ((t = this.videoElement) == null ? void 0 : t.playbackRate) || 0,
      };
      console.log(
        "[YTEventReport] 📊 handleVideoPlay: Play event data:",
        playingData
      );
      this.setEventDetail(Y.PLAYING, {
        playingData: playingData,
      });
    }
    handleVideoPause() {
      var o;
      console.log(
        "[YTEventReport] ⏸️ handleVideoPause: Video pause event detected"
      );
      const pausedData = {
        newState: "PAUSED",
        currentTime:
          ((o = this.videoElement) == null ? void 0 : o.currentTime) || 0,
      };
      console.log(
        "[YTEventReport] 📊 handleVideoPause: Pause event data:",
        pausedData
      );
      this.setEventDetail(Y.PAUSED, {
        pausedData: pausedData,
      });
    }
    handleVideoEnd() {
      var o;
      console.log(
        "[YTEventReport] 🏁 handleVideoEnd: Video end event detected"
      );
      const endData = {
        newState: "END",
        currentTime:
          ((o = this.videoElement) == null ? void 0 : o.currentTime) || 0,
      };
      console.log(
        "[YTEventReport] 📊 handleVideoEnd: End event data:",
        endData
      );
      this.setEventDetail(Y.END, {
        endData: endData,
      });
    }
    handleSeek(o) {
      var t;
      console.log(
        "[YTEventReport] ⏭️ handleSeek: Video seek event detected, time difference:",
        o
      );
      const seekData = {
        currentTime:
          ((t = this.videoElement) == null ? void 0 : t.currentTime) || 0,
        previousTime: this.lastTime,
      };
      console.log("[YTEventReport] 📊 handleSeek: Seek event data:", seekData);
      this.setEventDetail(Y.SEEK, {
        seekData: seekData,
      });
    }
    handleSendError(o) {
      console.log(
        "[YTEventReport] ❌ handleSendError: Processing send error:",
        o
      );
      ((o && o.message && o.message.includes("CLOSING")) ||
        o.message.includes("CLOSED")) &&
        (console.log(
          "[YTEventReport] 🔌 handleSendError: WebSocket connection closed, attempting reconnect"
        ),
        this.attemptReconnect());
    }
    attemptReconnect() {
      console.log(
        "[YTEventReport] 🔄 attemptReconnect: Attempting to reconnect WebSocket"
      );
    }
  };
I(c0, "instance");
let we = c0;
const Rt = we.getInstance();
console.log(
  "[YTEventReport] 🚀 Module: YTEventReport singleton instance created"
);
typeof document < "u" &&
  typeof window < "u" &&
  (console.log(
    "[YTEventReport] 🌍 Module: Document and window available, setting up cleanup"
  ),
  document.readyState === "loading"
    ? (console.log(
        "[YTEventReport] ⏳ Module: Document still loading, waiting for DOMContentLoaded"
      ),
      document.addEventListener("DOMContentLoaded", () => {
        console.log(
          "[YTEventReport] ✅ Module: DOM content loaded, setting up beforeunload handler"
        );
        window.addEventListener("beforeunload", () => {
          console.log(
            "[YTEventReport] 🧹 Module: Before unload - destroying YTEventReport instance"
          );
          Rt.destroy();
        });
      }))
    : (console.log(
        "[YTEventReport] ✅ Module: Document ready, setting up beforeunload handler immediately"
      ),
      window.addEventListener("beforeunload", () => {
        console.log(
          "[YTEventReport] 🧹 Module: Before unload - destroying YTEventReport instance"
        );
        Rt.destroy();
      })));
export {
  Fn as a,
  An as b,
  gn as c,
  Dn as d,
  Ae as e,
  Kr as f,
  mn as g,
  yn as h,
  bn as s,
  he as w,
  Rt as y,
};
