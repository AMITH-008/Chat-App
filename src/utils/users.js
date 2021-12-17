const users=[];

// addUser, removeUser, getUser, getUserInRoom

const addUser = ({id, username, room})=>{
    username = username.trim();
    room = room.trim();

    // Validate
    if(!username || !room){
        return {
            error:"Username and Room are Required"
        }
    }

    //Check For existing User
    const existingUser = users.find(user =>{
        return user.room === room && user.username === username;
    });

    //Validate Username
    if(existingUser){
        return {
            error:'Username in use'
        }
    }

    // Store User
    const user = {id, username, room}
    users.push(user);
    return {user}

}

const removeUser = (id)=>{
    const index = users.findIndex(user =>{
        return user.id === id;
    });
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id)=>{
    const index = users.findIndex(user => user.id==id);
    if(index !== -1){
        return users[index];
    }else{
        return undefined;
    }
}

const getUsersInRoom = (roomName)=>{
    const li = users.filter(user =>{
        return user.room === roomName;
    });
    return li;
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};
