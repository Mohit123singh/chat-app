const socket = io();

//elements::

const $messageForm=document.querySelector('#message-form');
const $messageFormInput=$messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button');
const $sendLocationButton=document.querySelector('#send-location');
const $messages=document.querySelector('#messages');

//templates:

const $templateMessage=document.querySelector('#template-message').innerHTML;
const $templateLocation=document.querySelector('#template-location').innerHTML;
const $sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;

//options

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoScroll=()=>{

const element=$messages.lastElementChild
element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})




}

socket.on("message", (message) => {
  console.log(message);
  const timeStamp=moment(message.createdAt).format('h:mm a');
  const html=Mustache.render($templateMessage,{
    username:message.username,
    message:message.text,
    createdAt:timeStamp,
  });
  $messages.insertAdjacentHTML('beforeend',html);
  autoScroll();

});

socket.on('sendLocation',(location)=>{
  console.log(location);

  const timeStamp=moment(location.createdAt).format('h:mm a');
 
  
  const html=Mustache.render($templateLocation,{
    username:location.username,
    url:location.url,
    createdAt:timeStamp,
  
  })
  $messages.insertAdjacentHTML('beforeend',html);


});

socket.on('roomData',({users,room})=>{
   const html=Mustache.render($sidebarTemplate,{
     room,
     users,
   })
   document.querySelector('#sidebar').innerHTML=html;
})



$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = e.target.message.value;

  //disable-the button:

  $messageFormButton.setAttribute('disabled','disabled');

  if (message) {
    socket.emit("sendMessage", message,(error)=>{
      //enable-the button
      $messageFormButton.removeAttribute('disabled');
      $messageFormInput.value='';
      $messageFormInput.focus();
        if(error)
        {
         return console.log(error);
        }
        console.log(`The message was deleivered successfully !`);
    });
  }
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  
  $sendLocationButton.setAttribute('disabled','disabled');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      socket.emit("sendLocation", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },()=>{
        $sendLocationButton.removeAttribute('disabled');
          console.log('Location-shared');
         
      });
    },undefined, {enableHighAccuracy: true,});
    
});

socket.emit('room',{username,room},(error)=>{

  if(error)
  {
    alert(error);
    location.href='/';
  }

});
