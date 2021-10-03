const express=require('express');
const http=require('http');
const path=require('path');
const socketio=require('socket.io');
const Filter=require('bad-words');
const{generatingMessage, generatingLocationMessage}=require('./utils/messages');
const{ addUser, removeUser, getUser, getUsersInRoom}=require('./utils/users');
const app=new express();
const server=http.createServer(app);
const io=socketio(server);
const port=process.env.PORT || 3000;
const publicDirectoryPath=path.join(__dirname,'../public');
app.use(express.static(publicDirectoryPath));


io.on('connection',(socket)=>{

    console.log('New WebSocket connection!');

     socket.on('room',(options,callback)=>{
       
         const {error,user}=addUser({id:socket.id,...options})
         if(error)
         {
             return callback(error);
         }
         socket.join(user.room);
         socket.emit('message',generatingMessage('Admin','welcome!'));
         socket.broadcast.to(user.room).emit('message',generatingMessage('Admin',`${user.username} has joined !`));
         io.to(user.room).emit('roomData',{
             room:user.room,
             users:getUsersInRoom(user.room),
         })
         callback();
     })

    socket.on('sendMessage',(message,callback)=>{
        const filter=new Filter();
        if(filter.isProfane(message))
        {
            return callback('Profinity is not allowed!');
        }
        const user=getUser(socket.id);

    
        io.to(user.room).emit('message',generatingMessage(user.username,message));
       callback();
    })

    socket.on('sendLocation',({latitude,longitude},callback)=>{
        const user=getUser(socket.id);
        io.to(user.room).emit('sendLocation',generatingLocationMessage(user.username,`https://www.google.com/maps?@${latitude},${longitude}`));
        callback();
    })

    socket.on('disconnect',()=>{
       const user= removeUser(socket.id);
       if(user)
       {
        io.to(user.room).emit('message',generatingMessage('Admin',`${user.username} has left!`));
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room),
        })
       }
       
});




});




server.listen(port,()=>{
    console.log(`server is set up on port ${port}!`);
})