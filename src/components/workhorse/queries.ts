import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
      },
    },
  });

const api = axios.create({
    baseURL: "https://api.sylphaxiom.com",
    withCredentials:true
})

export async function knockKnock(
    state:string,
    clientId:string,
): Promise<{
    status:'Authorized' | 'Failure' | 'Redirect';
    message:string;
    state:string;
    token?:string;
    error?:string;
    url?:string;
}> {
    const response = await api
    .get(`https://api.sylphaxiom.com/square/gateway.php?state=${state}&clientId=${clientId}&environment=sand`, {
        headers: {
            'Content-Type': "application/json",
        },
    })
    .catch((error)=>{
        console.log("An error occurred in the gateway: %s", error);
        throw error
    })
    console.log("Response info is: %o", response.data)
    return response.data;
}

export async function checker(): Promise<{
    isValid:boolean;
}> {
    const response = await api
    .post(`https://api.sylphaxiom.com/square/checker.php`)
    .catch((error)=>{
        console.log("An error occurred in the checker: %s", error);
        throw error
    })
    return response.data;
}