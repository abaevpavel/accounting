import url from 'url';
import axios from 'axios';



const createVendorData = (loginData, {name, email}) => {
    const obj = {
          "entity" : "Vendor",
          "isActive" : "1",
          "name" : name,
          "shortName" : name,
          "nameOnCheck" : name,
          "email" : email,
          "paymentEmail" : email,
          "accountType" : "1",
          "addressCountry" : "USA"
        }

    return new url.URLSearchParams({
        devKey: process.env.DEV_KEY,
        sessionId: loginData.sessionId,
        data: JSON.stringify({
            "obj" : obj
            })
        });
}

export const createVendor = async (loginData, vendorData) => {
    const formData = createVendorData(loginData, vendorData)

    const result = await axios.post(`${process.env.ROOT_URL}/Crud/Create/Vendor.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    return result.data.response_data
}

const createVendorBankingData = (loginData, {accountNumber, routingNumber, vendorId}) => {
    const obj =  {
            "entity" : "VendorBankAccount",
            "isActive" : "1",
            "vendorId" : vendorId,
            "accountNumber" : accountNumber,
            "routingNumber" : routingNumber,
            "usersId" : process.env.USER_ID,
        }

    return new url.URLSearchParams({
        devKey: process.env.DEV_KEY,
        sessionId: loginData.sessionId,
        data: JSON.stringify({
            "obj" : obj
            })
        });
}

export const createVendorBanking = async (loginData, bankData) => {
    const formData = createVendorBankingData(loginData, bankData)

    const result = await axios.post(`${process.env.ROOT_URL}/Crud/Create/VendorBankAccount.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    return result.data.response_data
}

export const readVendor = async (loginData, vendorId) => {
    const formData = new url.URLSearchParams({
            devKey: process.env.DEV_KEY,
            sessionId: loginData.sessionId,
            data: JSON.stringify({
                "id" : vendorId
                })
            });

    const result = await axios.post(`${process.env.ROOT_URL}/Crud/Read/Vendor.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    return result.data.response_data
}

export const inviteVendor = async (loginData, {vendorId, email}) => {
    const formData = new url.URLSearchParams({
            devKey: process.env.DEV_KEY,
            sessionId: loginData.sessionId,
            data: JSON.stringify({
                "vendorId" : vendorId,
                "email" : email
                })
            });

    const result = await axios.post(`${process.env.ROOT_URL}/SendVendorInvite.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    return result.data.response_data
}

export const undeleteVendor = async (loginData, vendorId) => {
    const formData = new url.URLSearchParams({
            devKey: process.env.DEV_KEY,
            sessionId: loginData.sessionId,
            data: JSON.stringify({
                "id" : vendorId
                })
            });

    const result = await axios.post(`${process.env.ROOT_URL}/Crud/Undelete/Vendor.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    return result.data.response_data
}