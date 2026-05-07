import axios from "axios";

export async function knockKnock(
    state:string,
    clientId:string,
): Promise<{
    status:'Authorized' | 'Failure';
    message:string;
    state?:string;
    trace?:string;
    token?:string;
}> {
    const response = await axios
    .get(`https://api.sylphaxiom.com/gateway.php?state=${state}&clientId=${clientId}&environment=sand`)
    .catch((error)=>{
        console.log("An error occurred in the gateway: %s", error);
        throw error
    })
    return response.data;
}