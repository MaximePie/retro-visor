import {createContext, useContext, useState} from "react";
type User = {
  connectionId: string;
  username?: string;
}

type Comment = {
  author: string;
  comment: string;
}
type Context = {
  connectedUsers: User[];
  comments: Comment[];
  closeConnection: () => void;
  onUsernameChange: (name: string) => void;
  onRouletteStart: () => void;
  currentSpinner: string | null;
  receivedDuration: number | null;
  sendComment: (comment: string) => void;
}
const socketContext = createContext<Context | null>(null);

if (!import.meta.env.VITE_WS_URL) {
  throw new Error('Missing required VITE_WS_URL env var. See .env.example file.');
}
const websocket = new WebSocket(import.meta.env.VITE_WS_URL);

export function SocketContextProvider(props: {children: React.ReactNode}) {
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // The one who is currently spinning the roulette
  const [currentSpinner, setCurrentSpinner] = useState<string | null>(null);
  const [receivedDuration, setReceivedDuration] = useState<number | null>(null);
  websocket.onopen = function () {
    console.log("Connection established!");

    websocket.send(JSON.stringify({
      action: "onConnect",
      payload: {}
    }));
  }

  websocket.onmessage = onMessage;
  websocket.onclose = function () {
    console.log("Connection closed!");
  }
  websocket.onerror = function () {
    console.log("Error occurred!");
  }

  const value = {
    connectedUsers,
    currentSpinner,
    comments,
    closeConnection,
    onUsernameChange,
    onRouletteStart,
    sendComment,
    receivedDuration,
  }
  return (
    <socketContext.Provider value={value}>
      {props.children}
    </socketContext.Provider>
  )

  function onUsernameChange(name: string) {
    websocket.send(JSON.stringify({
      action: "message",
      payload: {
        username: name,
        type: "usernameChanged"
      }
    }));
  }


  function onMessage (event: MessageEvent) {
    if (!event.data) {
      return;
    }
    const data = JSON.parse(event.data);
    switch(data.type) {
      case "afterConnect":
        setConnectedUsers(data.messages.connectedUsers);
        console.log(data.messages.message);
        break;
      case "rouletteStarted":
        // X has started the roulette for a duration of ...
        // Block the button if the user is not the one who started the roulette
        console.log(data.messages)
        setCurrentSpinner(data.messages.initiator);
        setReceivedDuration(data.messages.duration);
        break;
      case "commentSent":
        // X has sent a comment
        setComments([...comments, {
          author: data.messages.authorName,
          comment: data.messages.comment,
        } as Comment]);
        break;
      default:
        break;
    }
  }

  function sendComment(comment: string) {
    websocket.send(JSON.stringify({
      action: "message",
      payload: {
        type: "sendComment",
        comment: comment,
      }
    }));
  }

  function onRouletteStart() {
    // Broadcast to all users "X started the roulette
    websocket.send(JSON.stringify({
      action: "message",
      payload: {
        type: "rouletteStart",
      }
    }));
  }

  function closeConnection() {
    websocket.close();
  }
}

export function useSocket() {
  const socket = useContext(socketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketContextProvider');
  }

  return socket;
}