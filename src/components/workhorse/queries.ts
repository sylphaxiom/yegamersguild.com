import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
      },
    },
  });

export async function knockKnock(
    state:string,
    clientId:string,
): Promise<{
    status:'Authorized' | 'Failure';
    message:string;
    state:string;
    error?:string;
}> {
    const response = await axios
    .get(`https://api.sylphaxiom.com/gateway.php?state=${state}&clientId=${clientId}&environment=sand`)
    .catch((error)=>{
        console.log("An error occurred in the gateway: %s", error);
        throw error
    })
    return response.data;
}

export async function checker(): Promise<{
    isValid:boolean;
}> {
    const response = await axios
    .get(`https://api.sylphaxiom.com/checker.php`)
    .catch((error)=>{
        console.log("An error occurred in the checker: %s", error);
        throw error
    })
    return response.data;
}