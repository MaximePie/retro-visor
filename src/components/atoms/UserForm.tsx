import {useState} from "react";
import {useSocket} from "../../contexts/socket.tsx";

export function UserForm() {
  const [draftName, setDraftName] = useState<string | null>(null);
  const {onUsernameChange} = useSocket();
  function handleUsernameSubmit() {
    if (!draftName) {
      return;
    }
    onUsernameChange(draftName);
    setDraftName(null)
  }

  return (
    <div>
      <h4>
        Votre prénom
      </h4>
      <input type="text" onChange={
        (event) => {
          setDraftName(event.target.value);
        }
      }
             value={draftName || ''}
      />
      <button onClick={handleUsernameSubmit}>
        Sauvegarder
      </button>
    </div>
  )
}