import url from 'url';
import axios from 'axios';
const chartsConfig = {
    'Back charge' : process.env.CHART_OF_ACCOUNT_BACKCHARGE,
    'Invoice' : process.env.CHART_OF_ACCOUNT,
    'W-9' : process.env.CHART_OF_W_9
}

const billData = (loginData, {vendorId, invoiceNumber, invoiceDate, description, billingItems}) => {
    const billLineItems = billingItems.map(item => {
        const chartId = chartsConfig[item.recordType];
        return {
            "entity" : "BillLineItem",
            "amount" : item.amount,
            "chartOfAccountId" : chartId,
            "description" : item.description,
            "quantity" : 1,
            "unitPrice" : item.amount,
          }
    })
    const obj = {
          "entity" : "Bill",
          "isActive" : "1",
          "vendorId" : vendorId,
          "invoiceNumber" : invoiceNumber,
          "invoiceDate" : invoiceDate,
          "dueDate" : invoiceDate,
          "description" : description,
          "billLineItems" : billLineItems
      }
    return new url.URLSearchParams({
        devKey: process.env.DEV_KEY,
        sessionId: loginData.sessionId,
        data: JSON.stringify({
            "obj" : obj
            })
        });
}

export const createBill = async (loginData, billInfo) => {
    const formData = billData(loginData, billInfo)

    const result = await axios.post(`${process.env.ROOT_URL}/Crud/Create/Bill.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    return result.data.response_data
}

const billPayment = (loginData, {vendorId, billId, amount, processDate}) => {
    const obj = {
        "vendorId" : vendorId,
        //"processDate" : processDate,
        "billPays" : [ {
          "billId" : billId,
          "amount" : amount
        }]
       }

    return new url.URLSearchParams({
        devKey: process.env.DEV_KEY,
        sessionId: loginData.sessionId,
        data: JSON.stringify(obj)
        });
}

export const payBill = async (loginData, billInfo) => {
    const formData = billPayment(loginData, billInfo)

    const result = await axios.post(`${process.env.ROOT_URL}/PayBills.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    return result.data.response_data
}