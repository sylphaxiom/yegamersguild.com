import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

type ResponseStatus = 
        | 'Authorized'
        | 'Failure'
        | 'Redirect'
        | 'Success'

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
    status:ResponseStatus;
    message:string;
    state:string;
    token?:string;
    error?:string;
    url?:string;
}> {
    const response = await api
    .get(`/square/gateway.php`, {
        params:{
            state:state,
            clientId:clientId,
            environment:'sand',
        }
    })
    .catch((error)=>{
        console.log("An error occurred in the gateway: %s", error);
        throw error
    })
    return response.data;
}

export async function checker(state:string): Promise<{
    isValid:boolean;
}> {
    const response = await api
    .get(`/square/checker.php`, {
        params: {
            state:state
        }
    })
    .catch((error)=>{
        console.log("An error occurred in the checker: %s", error);
        throw error
    })
    return response.data;
}

export interface Price {
    amount:number;
    currency:string;
}

export interface CatalogVariation {
    id: string;
    name: string; // nullable, ?? check
    sku: string; // nullable, ?? check
    price: Price | 'VARIABLE_PRICE';
}

export interface CatalogItem {
    id: string;
    name: string;
    images: string[];
    description: string; // nullable, ?? check
    categories: string[];
    variations:CatalogVariation[];
}

export interface CatalogResponse {
    status: string;
    state: string;
    count?: number;
    objects?: CatalogItem[]
    error?: string;
}

export interface InventoryResponse {
    status: string;
    state: string;
    count?: number;
    objects: Record<string,number>
    error?: string;
}

export async function fetchCatalog(
    state:string,
    token:string,
    itemId?:string,
): Promise<CatalogResponse> {
    const response = await api
    .get(`/square/catalog.php`, {
        headers:{
            Authorization: `Bearer ${token}`
        },
        params: {
            state:state,
            ...(itemId && {itemId}),
        }
    })
    .catch((error)=>{
        console.log("An error occurred fetching the catalog: %s", error);
        throw error
    })
    return response.data;
}

export async function fetchInventory(
    state:string,
    token:string,
    variationIds:string[]
): Promise<InventoryResponse> {
    const response = await api
    .get(`/square/inventory.php`, {
        headers:{
            Authorization: `Bearer ${token}`
        },
        params:{
            state:state,
            variationIds: variationIds.join(','),
        }
    })
    .catch((error)=>{
        console.log("An error occurred fetching the inventory: %s", error);
        throw error
    })
    return response.data;
}