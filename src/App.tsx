import {useCallback, useEffect, useState} from 'react'
import './App.css'

import useWebSocket from 'react-use-websocket';

function App() {
  const { sendJsonMessage, lastJsonMessage, lastMessage } = useWebSocket(wsUrl);
  const [messageHistory, setMessageHistory] = useState([]);

  useEffect(() => {
    console.log(lastJsonMessage)
    console.log(lastMessage)

    if (lastJsonMessage !== null) {
      setMessageHistory(prev => prev.concat(lastJsonMessage));
    }
  }, [lastJsonMessage, setMessageHistory, lastMessage]);
      const handleClickSendMessage = useCallback(() => sendJsonMessage({
        action: "haha"
      }), [sendJsonMessage]);

  return (
    <>
      <button onClick={handleClickSendMessage}>
        send Message
      </button>

      {JSON.stringify(messageHistory)}
    </>
  )

}

export default App
