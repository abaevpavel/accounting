import axios from 'axios';
import url from 'url';

const customerInput = (loginData, {customerId, name, street, city, state, zip, email, phone, description}) => {
    const obj = {
        "entity" : "Customer",
        "isActive" : "1",
        "name" : name,
        "shortName" : name,
        "billAddress1" : street,
        "billAddressCity" : city,
        "billAddressState" : state,
        "billAddressCountry" : "USA",
        "billAddressZip" : zip,
        "email" : email,
        "phone" : phone,
        "description" : description,
        "accountType" : "2"
      }
    if (customerId){
        obj['id'] = customerId
    }
    return new url.URLSearchParams({
    devKey: process.env.DEV_KEY,
    sessionId: loginData.sessionId,
    data: JSON.stringify({
        "obj" : obj
        })
    });
}

export const createCustomer = async (loginData, customer) => {

    const formData = customerInput(loginData, customer)

    const result = await axios.post(`${process.env.ROOT_URL}/Crud/Create/Customer.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    return result.data.response_data
}


export const updateCustomer = async (loginData, customer) => {

    const formData = customerInput(loginData, customer)

    const result = await axios.post(`${process.env.ROOT_URL}/Crud/Update/Customer.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    return result.data.response_data
}