// {
//   "users": {
//     "userId": {
//       "name": "string",
//       "email": "string",
//       "profilePictureUrl": "string",
//       "joinedAt": "timestamp",
//       "channels": ["Array of channelIds"],
//       "chats": ["Array of chatIds"]
//     }
//   },
//   "channels": {
//     "channelId": {
//       "name": "string",
//       "description (optional)": "string",
//       "createdAt": "timestamp",
//       "members": ["Array of userIds"],
//       "messages": {
//         "msgId": {
//           "senderId": "userId",
//           "text": "string",
//           "createdAt": "timestamp",
//           "editedAt": "timestamp",
//           "threadCount": "integer",
//           "threads": {
//             "threadId": {
//               "senderId": "userId",
//               "text": "string",
//               "createdAt": "timestamp",
//               "editedAt": "timestamp",
//               "reactions": {
//                 "👍": ["userId"],
//                 "🎉": ["userId"]
//               }
//             }
//           }
//         }
//       }
//     }
//   },
//   "chats": {
//     "chatId": {
//       "createdAt": "timestamp",
//       "members": ["Array of userIds"],
//       "messages": {
//         "msgId": {
//           "senderId": "userId",
//           "text": "string",
//           "createdAt": "timestamp",
//           "editedAt": "timestamp",
//           "reactions": {
//             "👀": ["userId"]
//           }
//         }
//       }
//     }
//   }
// }