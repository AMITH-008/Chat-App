const socket = io()

//Elements
const $msgForm = document.querySelector('#message-form');
const $msgFormInput = $msgForm.querySelector('input');
const $msgFormButton = $msgForm.querySelector('button');
const $geoLocationButton = document.querySelector('#location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector("#sidebar");

//Templates

const msgTemplate = document.querySelector('#message-template').innerHTML;
const msgTemplateLocation = document.querySelector('#message-template-location').innerHTML;
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})


const autoScroll = ()=>{
    //New Message Element 
    const $newMessage = $messages.lastElementChild;

    //Height of new Message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //Visible Height
    const visibleHeight = $messages.offsetHeight;

    //Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How Far Scroller Gone
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight-newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}



socket.on('locationMessage', (position)=>{
    console.log(position);
    const html = Mustache.render(msgTemplateLocation, {
        Someone:position.username,
        url:position.url, 
        createdAt:moment(position.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});


socket.on('greeting', (msg)=>{
    console.log(msg);
    console.log(moment(msg.createdAt).format('h:mm a'))
});

socket.on('message', (msg)=>{
    console.log(msg);

    const html = Mustache.render(msgTemplate,{
        Someone:msg.username,
        message:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a') 
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});


socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sideBarTemplate, {
        room:room,
        users:users
    });
    $sidebar.innerHTML = html;
});

//Deals With Sending Messages Between Users

$msgForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    $msgFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;
    
    socket.emit('sendMessage', message, (error)=>{
       if(error){
           return console.log(error);
       }
       console.log('Message Delivered');
       $msgFormButton.removeAttribute('disabled');
       $msgFormInput.value = "";
       
    });
});

//Deals With Geo-Location

document.querySelector('#location').addEventListener("click", ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation Not Supported by your browser');
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position);

        $geoLocationButton.setAttribute('disabled', 'disabled');

        socket.emit('geolocation', {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }, (error)=>{
            $geoLocationButton.removeAttribute('disabled');
            if(error){
                return console.log(error);
            }
            console.log('Message Delivered');
        });
    })
});

socket.emit("join", {username, room}, (error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
});