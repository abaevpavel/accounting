import * as schedule from 'node-schedule';
import * as dotenv from 'dotenv';
dotenv.config();
import { ensureLogin, triggerMFAMessage, checkIfMFAValid, confirmToken } from './functions/login.js'
import {createInvoice, sendInvoice, getInvoice } from './functions/invoice.js'
import { createCustomer, updateCustomer } from './functions/customer.js'
import { createBill, payBill } from './functions/bills.js'
import { readVendor, createVendor, createVendorBanking, inviteVendor, undeleteVendor } from './functions/vendor.js'
import twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twillioClient = twilio(accountSid, authToken);

import express from "express";
const api = express()
api.use(express.json())
api.post('/api/*', async (req,res,next) => {
  if (req.headers?.authorization != process.env.AUTH_HEADER){
    return res.status(400).send("Not Authorized")
  }
  const loginData = await ensureLogin();
  await checkIfMFAValid(loginData);
  res.locals.loginData = loginData;
  next()
})


//VENDOR
api.post('/api/make-vendor', async (req, res) => {
  const { name, email } = req.body
  if (!(name && email)){
    return res.status("400").send("Some parameter is missing")
  }
    const vendor = await createVendor(res.locals.loginData, req.body)
    res.send(vendor)
})

api.post('/api/add-bank-data', async (req, res) => {
  const { accountNumber, routingNumber, vendorId } = req.body
  if (!(accountNumber && routingNumber && vendorId)){
    return res.status("400").send("Some parameter is missing")
  }
    const vendor = await createVendorBanking(res.locals.loginData, req.body)
    res.send(vendor)
})

api.post('/api/read-vendor', async (req, res) => {
  const { vendorId } = req.body
  if (!(vendorId)){
    return res.status("400").send("Some parameter is missing")
  }
    const result = await readVendor(res.locals.loginData, vendorId)
    res.send(result)
})

api.post('/api/invite-vendor', async (req, res) => {
  const { vendorId, email } = req.body
  if (!(vendorId && email)){
    return res.status("400").send("Some parameter is missing")
  }
  const vendor = await readVendor(res.locals.loginData, vendorId)
  if (vendor.isActive == "2") {
      await undeleteVendor(res.locals.loginData, vendorId)
  }
  const result = await inviteVendor(res.locals.loginData, req.body)
  res.send(result)
})


// BILL
api.post('/api/make-bill', async (req, res) => {
  const { vendorId, invoiceNumber, invoiceDate, description, billingItems } = req.body
  if (!(vendorId && invoiceNumber && invoiceDate && description && billingItems )){
    return res.status("400").send("Some parameter is missing")
  }
  const vendor = await readVendor(res.locals.loginData, vendorId)
  if (vendor.vendorBankAccountStatus && vendor.vendorBankAccountStatus == -1){
    res.status(400).send("Vendor Bank Account Not Setup")
    return;
  }
  const bill = await createBill(res.locals.loginData, req.body)
  res.send(bill)
})

api.post('/api/pay-bill', async (req, res) => {
  const { vendorId, billId, amount, processDate} = req.body
  if (!(vendorId && billId && amount )){
    return res.status("400").send("Some parameter is missing")
  }
  const vendor = await readVendor(res.locals.loginData, vendorId)
  if (vendor.vendorBankAccountStatus && vendor.vendorBankAccountStatus == -1){
    res.status(400).send("Vendor Bank Account Not Setup")
    return;
  }
  const bill = await payBill(res.locals.loginData, req.body)
  res.send(bill)
})



// CUSTOMER
api.post('/api/make-customer', async (req, res) => {
  const { name, street, city, state, zip, email, phone, description } = req.body
  if (!(name && street && city && state && zip && email && phone && description)){
    return res.status("400").send("Some parameter is missing")
  }
    const customer = await createCustomer(res.locals.loginData, req.body)
    res.send(customer)
})

api.post('/api/update-customer', async (req, res) => {
  const { customerId, name, street, city, state, zip, email, phone, description } = req.body
  if (!(customerId && name && street && city && state && zip && email && phone && description)){
    return res.status("400").send("Some parameter is missing")
  }
    const customer = await updateCustomer(res.locals.loginData, req.body)
    res.send(customer)
})


// INVOICES
api.post('/api/send-invoice', async (req, res) => {
  const { customerId, invoiceNumber, date, dueDate, amount, description } = req.body
  if (!(customerId && invoiceNumber && date && dueDate && amount && description)){
    return res.status("400").send("Some parameter is missing")
  }

  let invoice = await createInvoice(res.locals.loginData, req.body)
  let sendStatus = await sendInvoice(res.locals.loginData, invoice.data.response_data.id)
  res.send(sendStatus)
})

api.post('/api/check-invoice', async (req, res) => {
  const { invoiceId } = req.body
  if (!invoiceId){
    return res.status("400").send("Some parameter is missing")
  }
  const invoice = await getInvoice(res.locals.loginData, invoiceId)
  res.send(invoice)
})


// MFA STUFF
api.post('/api/mfa-check', async (req, res) => {
  const isTrusted = await checkIfMFAValid(res.locals.loginData);
  if (isTrusted){
    return res.send("TRUSTED")
    
  }
  return res.send("NOT TRUSTED")
})

api.post('/api/mfa-request', async (req, res) => {
  await triggerMFAMessage(res.locals.loginData)
  res.send("Message triggered")
})

api.post('/api/mfa-confirm', async (req, res) => {
  const {token} = req.body;
  if (!token){
    res.sendStatus("400")
  }
  try {
    await confirmToken(res.locals.loginData, token)
  } catch(e) {
    res.send("Wrong token");
  }
  
  res.send("Confirmed!")
})

api.listen(80)