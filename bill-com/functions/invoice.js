import axios from 'axios';
import url from 'url';


export const createInvoice = async (loginData, { customerId, invoiceNumber, date, dueDate, amount, description }) => {

    const formData = new url.URLSearchParams({
        devKey: process.env.DEV_KEY,
        sessionId: loginData.sessionId,
        data: JSON.stringify({
            obj : {
                entity: "Invoice",
                customerId: customerId,
                invoiceNumber : invoiceNumber,
                invoiceDate: date,
                dueDate : dueDate,
                description: description,
                invoiceLineItems: [ {
                  entity: "InvoiceLineItem",
                  itemId : process.env.ITEM_ID,
                  quantity: 1,
                  amount: parseFloat(amount),
                }]
              }
        })
    });

    const result = await axios.post(`${process.env.ROOT_URL}/Crud/Create/Invoice.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    return result.data.response_data
}


export const sendInvoice = async (loginData, invoiceId) => {

    const formData = new url.URLSearchParams({
        devKey: process.env.DEV_KEY,
        sessionId: loginData.sessionId,
        data: JSON.stringify({
            "invoiceId" : invoiceId,
            "headers" : {},
            "content" : {}
          })
    });
    const result = await axios.post(`${process.env.ROOT_URL}/SendInvoice.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    return result.data.response_data
}

export const getInvoice = async (loginData, invoiceId) => {

    const formData = new url.URLSearchParams({
        devKey: process.env.DEV_KEY,
        sessionId: loginData.sessionId,
        data: JSON.stringify({
            "id" : invoiceId,
          })
    });
    const result = await axios.post(`${process.env.ROOT_URL}/Crud/Read/Invoice.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    return result.data.response_data
}