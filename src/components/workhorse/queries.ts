import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

type ResponseStatus = 
        | 'Authorized'
        | 'Failure'
        | 'Redirect'
        | 'Success'
type RFC3339 = string;
type ProductType = 
        | 'REGULAR'
        | 'GIFT_CARD'
        | 'APPOINTMENTS_SERVICE'
        | 'FOOD_AND_BEV'
        | 'EVENT'
        | 'DIGITAL'
        | 'DONATION'
        | 'LEGAZY_SQUARE_ONLINE_SERVICE'
        | 'LEGACY_SQUARE_ONLINE_MEMBERSHIP';
type ItemType = 
        | 'ITEM'
        | 'IMAGE'
        | 'CATEGORY'
        | 'ITEM_VARIATION'
        | 'TAX'
        | 'DISCOUNT'
        | 'MODIFIER_LIST'
        | 'MODIFIER'
        | 'PRICING_RULE'
        | 'PRODUCT_SET'
        | 'TIME_PERIOD'
        | 'MEASUREMENT_UNIT'
        | 'SUBSCRIPTION_PLAN_VARIATION'
        | 'ITEM_OPTION'
        | 'ITEM_OPTION_VAL'
        | 'CUSTOM_ATTRIBUTE_DEFINITION'
        | 'QUICK_AMOUNTS_SETTINGS'
        | 'SUBSCRIPTION_PLAN'
        | 'AVAILABILITY_PERIOD';
type ErrorCategory =
        | 'API_ERROR'
        | 'AUTHENTICATION_ERROR'
        | 'INVALID_REQUEST_ERROR'
        | 'RATE_LIMIT_ERROR'
        | 'PAYMENT_METHOD_ERROR'
        | 'REFUND_ERROR'
        | 'MERCHANT_SUBSCRIPTION_ERROR'
        | 'EXTERNAL_VENDOR_ERROR'
type ErrorCode =
        | 'INTERNAL_SERVER_ERROR'
        | 'UNAUTHORIZED'
        | 'ACCESS_TOKEN_EXPIRED'
        | 'ACCESS_TOKEN_REVOKED'
        | 'CLIENT_DISABLED'
        | 'FORBIDDEN'
        | 'INSUFFICIENT_SCOPES'
        | 'APPLICATION_DISABLED'
        | 'V1_APPLICATION'
        | 'V1_ACCESS_TOKEN'
        | 'CARD_PROCESSING_NOT_ENABLED'
        | 'MERCHANT_SUBSCRIPTION_NOT_FOUND'
        | 'BAD_REQUEST'
        | 'MISSING_REQUIRED_PARAMETER'
        | 'INCORRECT_TYPE'
        | 'INVALID_TIME'
        | 'INVALID_TIME_RANGE'
        | 'INVALID_VALUE'
        | 'INVALID_CURSOR'
        | 'UNKNOWN_QUERY_PARAMETER'
        | 'CONFLICTING_PARAMETERS'
        | 'EXPECTED_JSON_BODY'
        | 'INVALID_SORT_ORDER'
        | 'VALUE_REGEX_MISMATCH'
        | 'VALUE_TOO_SHORT'
        | 'VALUE_TOO_LONG'
        | 'VALUE_TOO_LOW'
        | 'VALUE_TOO_HIGH'
        | 'VALUE_EMPTY'
        | 'ARRAY_LENGTH_TOO_LONG'
        | 'ARRAY_LENGTH_TOO_SHORT'
        | 'ARRAY_EMPTY'
        | 'EXPECTED_BOOLEAN'
        | 'EXPECTED_INTEGER'
        | 'EXPECTED_FLOAT'
        | 'EXPECTED_STRING'
        | 'EXPECTED_OBJECT'
        | 'EXPECTED_ARRAY'
        | 'EXPECTED_MAP'
        | 'EXPECTED_BASE64_ENCODED_BYTE_ARRAY'
        | 'INVALID_ARRAY_VALUE'
        | 'INVALID_ENUM_VALUE'
        | 'INVALID_CONTENT_TYPE'
        | 'INVALID_FORM_VALUE'
        | 'CUSTOMER_NOT_FOUND'
        | 'ONE_INSTRUMENT_EXPECTED'
        | 'NO_FIELDS_SET'
        | 'TOO_MANY_MAP_ENTRIES'
        | 'MAP_KEY_LENGTH_TOO_SHORT'
        | 'MAP_KEY_LENGTH_TOO_LONG'
        | 'CUSTOMER_MISSING_NAME'
        | 'CUSTOMER_MISSING_EMAIL'
        | 'INVALID_PAUSE_LENGTH'
        | 'INVALID_DATE'
        | 'UNSUPPORTED_COUNTRY'
        | 'UNSUPPORTED_CURRENCY'
        | 'APPLE_TTP_PIN_TOKEN'
        | 'CARD_EXPIRED'
        | 'INVALID_EXPIRATION'
        | 'INVALID_EXPIRATION_YEAR'
        | 'INVALID_EXPIRATION_DATE'
        | 'UNSUPPORTED_CARD_BRAND'
        | 'UNSUPPORTED_ENTRY_METHOD'
        | 'INVALID_ENCRYPTED_CARD'
        | 'INVALID_CARD'
        | 'PAYMENT_AMOUNT_MISMATCH'
        | 'GENERIC_DECLINE'
        | 'CVV_FAILURE'
        | 'ADDRESS_VERIFICATION_FAILURE'
        | 'INVALID_ACCOUNT'
        | 'CURRENCY_MISMATCH'
        | 'INSUFFICIENT_FUNDS'
        | 'INSUFFICIENT_PERMISSIONS'
        | 'CARDHOLDER_INSUFFICIENT_PERMISSIONS'
        | 'INVALID_LOCATION'
        | 'TRANSACTION_LIMIT'
        | 'VOICE_FAILURE'
        | 'PAN_FAILURE'
        | 'EXPIRATION_FAILURE'
        | 'CARD_NOT_SUPPORTED'
        | 'READER_DECLINED'
        | 'INVALID_PIN'
        | 'MISSING_PIN'
        | 'MISSING_ACCOUNT_TYPE'
        | 'INVALID_POSTAL_CODE'
        | 'INVALID_FEES'
        | 'MANUALLY_ENTERED_PAYMENT_NOT_SUPPORTED'
        | 'PAYMENT_LIMIT_EXCEEDED'
        | 'GIFT_CARD_AVAILABLE_AMOUNT'
        | 'ACCOUNT_UNUSABLE'
        | 'BUYER_REFUSED_PAYMENT'
        | 'DELAYED_TRANSACTION_EXPIRED'
        | 'DELAYED_TRANSACTION_CANCELED'
        | 'DELAYED_TRANSACTION_CAPTURED'
        | 'DELAYED_TRANSACTION_FAILED'
        | 'CARD_TOKEN_EXPIRED'
        | 'CARD_TOKEN_USED'
        | 'AMOUNT_TOO_HIGH'
        | 'UNSUPPORTED_INSTRUMENT_TYPE'
        | 'REFUND_AMOUNT_INVALID'
        | 'REFUND_ALREADY_PENDING'
        | 'PAYMENT_NOT_REFUNDABLE'
        | 'PAYMENT_NOT_REFUNDABLE_DUE_TO_DISPUTE'
        | 'REFUND_ERROR_PAYMENT_NEEDS_COMPLETION'
        | 'REFUND_DECLINED'
        | 'INSUFFICIENT_PERMISSIONS_FOR_REFUND'
        | 'INVALID_CARD_DATA'
        | 'SOURCE_USED'
        | 'SOURCE_EXPIRED'
        | 'UNSUPPORTED_LOYALTY_REWARD_TIER'
        | 'LOCATION_MISMATCH'
        | 'ORDER_UNPAID_NOT_RETURNABLE'
        | 'PARTIAL_PAYMENT_DELAY_CAPTURE_NOT_SUPPORTED'
        | 'IDEMPOTENCY_KEY_REUSED'
        | 'UNEXPECTED_VALUE'
        | 'SANDBOX_NOT_SUPPORTED'
        | 'INVALID_EMAIL_ADDRESS'
        | 'INVALID_PHONE_NUMBER'
        | 'CHECKOUT_EXPIRED'
        | 'BAD_CERTIFICATE'
        | 'INVALID_SQUARE_VERSION_FORMAT'
        | 'API_VERSION_INCOMPATIBLE'
        | 'CARD_PRESENCE_REQUIRED'
        | 'UNSUPPORTED_SOURCE_TYPE'
        | 'CARD_MISMATCH'
        | 'PLAID_ERROR'
        | 'PLAID_ERROR_ITEM_LOGIN_REQUIRED'
        | 'PLAID_ERROR_RATE_LIMIT'
        | 'PAYMENT_SOURCE_NOT_ENABLED_FOR_TARGET'
        | 'CARD_DECLINED'
        | 'VERIFY_CVV_FAILURE'
        | 'VERIFY_AVS_FAILURE'
        | 'CARD_DECLINED_CALL_ISSUER'
        | 'CARD_DECLINED_VERIFICATION_REQUIRED'
        | 'BAD_EXPIRATION'
        | 'CHIP_INSERTION_REQUIRED'
        | 'ALLOWABLE_PIN_TRIES_EXCEEDED'
        | 'RESERVATION_DECLINED'
        | 'UNKNOWN_BODY_PARAMETER'
        | 'NOT_FOUND'
        | 'APPLE_PAYMENT_PROCESSING_CERTIFICATE_HASH_NOT_FOUND'
        | 'METHOD_NOT_ALLOWED'
        | 'NOT_ACCEPTABLE'
        | 'REQUEST_TIMEOUT'
        | 'CONFLICT'
        | 'GONE'
        | 'REQUEST_ENTITY_TOO_LARGE'
        | 'UNSUPPORTED_MEDIA_TYPE'
        | 'UNPROCESSABLE_ENTITY'
        | 'RATE_LIMITED'
        | 'NOT_IMPLEMENTED'
        | 'BAD_GATEWAY'
        | 'SERVICE_UNAVAILABLE'
        | 'TEMPORARY_ERROR'
        | 'GATEWAY_TIMEOUT'

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

export interface Error {
    category: ErrorCategory;
    code: ErrorCode;
    detail: string;
    field: string;
}

export interface Money {
    amount: number;
    currency: string;
}

export interface Categories {
    id: string;
    ordinal:number;
}

export interface ReportingCategory {
    id: string;
    ordinal: number;
}

export interface ItemVariants {
    item_id: string;
    name: string;
    sku: string;
    ordinal: number;
    pricing_type: 'FIXED_PRICING' | 'VARIABLE_PRICING';
    price_money: Money;
}

export interface Variants {
    type: 
        | 'ITEM'
        | 'IMAGE'
        | 'CATEGORY'
        | 'ITEM_VARIATION'
        | 'TAX'
        | 'DISCOUNT';
    id: string;
    updated_at: RFC3339;
    created_at: RFC3339;
    version: number;
    is_deleted: boolean;
    present_at_all_locations: boolean;
    present_at_location_ids: string[];
    item_variation_data: ItemVariants;
}

export interface ItemData {
    name: string;
    description: string;
    is_taxable: boolean,
    variations: Variants[];
    product_type: ProductType;
    skip_modifier_screen: boolean;
    image_ids: string[];
    categories: Categories;
    description_html: string;
    description_plaintext: string;
    is_archived: boolean;
    reporting_category: ReportingCategory;
    is_alcoholic: boolean;
}

export interface Item {
    type:ItemType;
    id:string;
    updated_at: RFC3339;
    created_at: RFC3339;
    version: number;
    is_deleted: boolean;
    present_at_all_locations: boolean;
    present_at_location_ids: string[];
    item_data: ItemData;
}

export async function fetchCatalog(
    types?:ItemType[],
    limit?:number,
    cursor?:string,
): Promise<{
    status: ResponseStatus;
    message: string;
    objects: Item[];
    errors?: Error[];
    cursor?: string;
}> {
    const response = await api
    .get(`https://api.sylphaxiom.com/square/gateway.php`, {
        headers: {
            'Content-Type': "application/json",
        },
        params: {
            types: types,
            limit: limit,
            cursor: cursor
        }
    })
    .catch((error)=>{
        console.log("An error occurred in the gateway: %s", error);
        throw error
    })
    console.log("Response count: ", (response.data).length)
    return response.data;
}