import './App.css'
// import {Users} from "./components/atoms/Users.tsx";
// import {UserForm} from "./components/atoms/UserForm.tsx";
import {Roulette} from "./components/atoms/Roulette.tsx";
// import {useState} from "react";
// import {useSocket} from "./contexts/socket.tsx";
//
// function ChatForm() {
//   const [draftMessage, setDraftMessage] = useState<string | null>(null);
//
//   const { sendComment } = useSocket();
//
//   return (
//     <div className="ChatForm">
//       <h4>
//         Chat
//       </h4>
//       <input
//         type="text"
//         onChange={(event) => {
//             setDraftMessage(event.target.value);
//           }
//         }
//         value={draftMessage || ''}
//       />
//       <button
//         onClick={() => {
//           console.log(draftMessage)
//           setDraftMessage(null)
//           if (draftMessage !== '' && draftMessage !== null) {
//             sendComment(draftMessage)
//           }
//         }}
//       >
//         Envoyer
//       </button>
//     </div>
//   )
// }
//
// function Comments() {
//   const { comments } = useSocket();
//   return (
//     <div className="Comments">
//       {comments.map(({author, comment}, index) => {
//         return (
//           <p key={index}>
//             <strong>{author}</strong> : {comment}
//           </p>
//         )
//       })}
//     </div>
//   )
// }
function App() {


  return (
    <div className="App">
      <div>
        <h4>OUI</h4>
        <div>
          {/*<Users/>*/}
          {/*<UserForm/>*/}
        </div>
        <div className="App__chat">
          {/*<Comments/>*/}
          {/*<ChatForm/>*/}
        </div>
      </div>
      <div className="App__body">
        <Roulette/>
      </div>
    </div>
  )
}

export default App