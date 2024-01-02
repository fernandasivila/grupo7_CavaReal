async function getUsers(){
    try{
    const response = await fetch('http://localhost:3030/api/users');
    const data = await response.json();
    
    if(response.status !== 200) throw new Error('Error al conectarse con la DB');
    
    return data;

    }catch(error){
        console.log(error);
    }
}

export default getUsers;