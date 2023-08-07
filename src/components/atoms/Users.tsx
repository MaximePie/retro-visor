import {useSocket} from "../../contexts/socket.tsx";

export function Users() {
  const {connectedUsers, currentSpinner} = useSocket();
  const nextSpinnerIndex = connectedUsers.findIndex(({username}) => username === currentSpinner) + 1;
  const nextSpinner = nextSpinnerIndex === connectedUsers.length ? connectedUsers[0] : connectedUsers[nextSpinnerIndex];
  return (
    <div>
      <h4>
        Utilisateurs connectés
      </h4>
      {connectedUsers.filter(({username}) => !!username).map((user, index) => {
        return <p key={index}>
          {(currentSpinner === user.username) && '🎲'}
          {nextSpinner.username === user.username && '➡' }
          {user.username}
        </p>
      })}
    </div>
  )
}