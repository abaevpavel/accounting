import * as fs from 'fs';
import axios from 'axios';
import url from 'url';

export const ensureLogin = async () => {
    if (fs.existsSync('./login_data')) {
        const loginData = JSON.parse(fs.readFileSync('./login_data'));
        if (loginData?.expiresOn && new Date(loginData?.expiresOn) > new Date()) {
            return loginData;
        }
    }
    const formData = new url.URLSearchParams({ 
        userName: process.env.USERNAME, 
        password: process.env.PASSWORD, 
        orgId: process.env.ORG_ID, 
        devKey: process.env.DEV_KEY 
    });
    let result = await axios.post(`${process.env.ROOT_URL}/Login.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    const now = new Date();
    const fifteenMinutes = new Date(now.getTime() + 5 * 60000);
    const newLoginData = { sessionId: result.data.response_data.sessionId, expiresOn: fifteenMinutes.toISOString(), userId: result.data.response_data.userId }
    fs.writeFileSync('./login_data', JSON.stringify(newLoginData));
    return newLoginData;
}

export const checkIfMFAValid = async (loginData) => {
    if (!fs.existsSync('./mfa_data')) { 
        console.log("NO MFA FILE");
        return false;
    }
    
    let mfaData = JSON.parse(fs.readFileSync('./mfa_data'));
    if (!mfaData?.mfaId) {
        console.log("Yes to file but not to id. File ", mfaData);
        return false
    }
    
    const formData = new url.URLSearchParams({
        devKey: process.env.DEV_KEY,
        sessionId: loginData.sessionId,
        data: JSON.stringify({
            mfaId: mfaData.mfaId,
            deviceId: "phone",
        })
    });

    const checkResult = await axios.post(`${process.env.ROOT_URL}/MFAStatus.json`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    if (checkResult.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + checkResult.data.response_data.error_message)
    }
    return checkResult.data?.response_data.isTrusted || false
}

export const triggerMFAMessage = async (loginData) => {
    console.log("Trigger mfa message");
    const challengeFormData = new url.URLSearchParams({
        devKey: process.env.DEV_KEY,
        sessionId: loginData.sessionId,
        data: JSON.stringify({
            useBackup: false
        })
    });
    const challengeResult = await axios.post(`${process.env.ROOT_URL}/MFAChallenge.json`, challengeFormData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    if (challengeResult.data.response_status != 0) {
        throw new Error("Challenge response status is non 0. Message: " + challengeResult.data.response_data.error_message)
    }
    fs.writeFileSync('./mfa_data', JSON.stringify({ challengeId: challengeResult.data.response_data.challengeId }));
    console.log("Saved challenge id",  challengeResult.data.response_data);
    return true;
}


export const confirmToken = async (loginData, token) => {
    console.log("Confirm token");
    if (!fs.existsSync('./mfa_data')) { 
        throw new Error("No MFA data");
    }
    const mfaData = JSON.parse(fs.readFileSync('./mfa_data'));
    console.log("MFA ", mfaData);
    if (!mfaData?.challengeId) {
        throw new Error("No existing MFA data")
    }
    if (!token || token.length != 6) {
        throw new Error("Token does not seem correct: " + token)
    }
 
    const mfaFormData = new url.URLSearchParams({
        devKey: process.env.DEV_KEY,
        sessionId: loginData.sessionId,
        data: JSON.stringify({
            challengeId: mfaData.challengeId,
            token: token,
            deviceId: "phone",
            machineName: "phone",
            rememberMe: true
        })
    })

    let result = await axios.post(`${process.env.ROOT_URL}/MFAAuthenticate.json`, mfaFormData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    if (result.data.response_status != 0) {
        throw new Error("Response status is non 0. Message: " + result.data.response_data.error_message)
    }
    const now = new Date();
    const twentyFiveDaysLater = new Date(now.getTime() + 25 * 24 * 60 * 60000);
    fs.writeFileSync('./mfa_data', JSON.stringify({ mfaId: result.data.response_data.mfaId, expiresOn: twentyFiveDaysLater.toISOString() }));
    console.log("Saved mfa ",  result.data.response_data);
} 