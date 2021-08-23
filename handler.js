'use strict';
const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');

module.exports.sign = async (event) => {
    const manifest = event.body;
    const regex = /https:\/\/passbook-doctoranytime(?:-(?:\d|.){6}\.netlify\.live|\.netlify\.app)/;
    let corsDomain = 'https://passbook-doctoranytime.netlify.app/';
    let aliasDomains = ['https://covidpass.doctoranytime.gr','https://covidpass.doctoranytime.be'];
    if (regex.test(event.headers.origin) || aliasDomains.includes(event.headers.origin)) {
        corsDomain = event.headers.origin;
    }
    const headers = {
        'Access-Control-Allow-Origin': corsDomain,
        'Access-Control-Allow-Credentials': true
    };

    try {
        const parsedManifest = JSON.parse(manifest);

        // validate manifest
        if (typeof parsedManifest !== 'object') {
            return {
                statusCode: 400,
                headers: headers,
                body: 'manifest is malformed',
            };
        }
        const keys = Object.keys(parsedManifest).sort()
        const refKeys = ["icon.png", "icon@2x.png", "logo.png", "pass.json", "thumbnail.png"]

        if (JSON.stringify(keys) !== JSON.stringify(refKeys)) {
            return {
                statusCode: 400,
                headers: headers,
                body: 'manifest missing mandatory keys. Got ' + JSON.stringify(keys) + ' but waiting ' + JSON.stringify(refKeys),
            };
        }
        keys.forEach(e => {
            if ((typeof e !== "string") || e.length !== 0) {
                return {
                    statusCode: 400,
                    headers: headers,
                    body: 'manifest keys missing values',
                };
            }
        });
    } catch (e) {
        return {
            statusCode: 400,
            headers: headers,
            body: 'manifest is malformed',
        };
    }

    const wwdr = `-----BEGIN CERTIFICATE-----
MIIEIjCCAwqgAwIBAgIIAd68xDltoBAwDQYJKoZIhvcNAQEFBQAwYjELMAkGA1UE
BhMCVVMxEzARBgNVBAoTCkFwcGxlIEluYy4xJjAkBgNVBAsTHUFwcGxlIENlcnRp
ZmljYXRpb24gQXV0aG9yaXR5MRYwFAYDVQQDEw1BcHBsZSBSb290IENBMB4XDTEz
MDIwNzIxNDg0N1oXDTIzMDIwNzIxNDg0N1owgZYxCzAJBgNVBAYTAlVTMRMwEQYD
VQQKDApBcHBsZSBJbmMuMSwwKgYDVQQLDCNBcHBsZSBXb3JsZHdpZGUgRGV2ZWxv
cGVyIFJlbGF0aW9uczFEMEIGA1UEAww7QXBwbGUgV29ybGR3aWRlIERldmVsb3Bl
ciBSZWxhdGlvbnMgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwggEiMA0GCSqGSIb3
DQEBAQUAA4IBDwAwggEKAoIBAQDKOFSmy1aqyCQ5SOmM7uxfuH8mkbw0U3rOfGOA
YXdkXqUHI7Y5/lAtFVZYcC1+xG7BSoU+L/DehBqhV8mvexj/avoVEkkVCBmsqtsq
Mu2WY2hSFT2Miuy/axiV4AOsAX2XBWfODoWVN2rtCbauZ81RZJ/GXNG8V25nNYB2
NqSHgW44j9grFU57Jdhav06DwY3Sk9UacbVgnJ0zTlX5ElgMhrgWDcHld0WNUEi6
Ky3klIXh6MSdxmilsKP8Z35wugJZS3dCkTm59c3hTO/AO0iMpuUhXf1qarunFjVg
0uat80YpyejDi+l5wGphZxWy8P3laLxiX27Pmd3vG2P+kmWrAgMBAAGjgaYwgaMw
HQYDVR0OBBYEFIgnFwmpthhgi+zruvZHWcVSVKO3MA8GA1UdEwEB/wQFMAMBAf8w
HwYDVR0jBBgwFoAUK9BpR5R2Cf70a40uQKb3R01/CF4wLgYDVR0fBCcwJTAjoCGg
H4YdaHR0cDovL2NybC5hcHBsZS5jb20vcm9vdC5jcmwwDgYDVR0PAQH/BAQDAgGG
MBAGCiqGSIb3Y2QGAgEEAgUAMA0GCSqGSIb3DQEBBQUAA4IBAQBPz+9Zviz1smwv
j+4ThzLoBTWobot9yWkMudkXvHcs1Gfi/ZptOllc34MBvbKuKmFysa/Nw0Uwj6OD
Dc4dR7Txk4qjdJukw5hyhzs+r0ULklS5MruQGFNrCk4QttkdUGwhgAqJTleMa1s8
Pab93vcNIx0LSiaHP7qRkkykGRIZbVf1eliHe2iK5IaMSuviSRSqpd1VAKmuu0sw
ruGgsbwpgOYJd+W+NKIByn/c4grmO7i77LpilfMFY0GCzQ87HUyVpNur+cmV6U/k
TecmmYHpvPm0KdIBembhLoz2IYrF+Hjhga6/05Cdqa3zr/04GpZnMBxRpVzscYqC
tGwPDBUf
-----END CERTIFICATE-----`;

    const certificate = `-----BEGIN CERTIFICATE-----
MIIF/DCCBOSgAwIBAgIIbEY5XfuoJGMwDQYJKoZIhvcNAQEFBQAwgZYxCzAJBgNV
BAYTAlVTMRMwEQYDVQQKDApBcHBsZSBJbmMuMSwwKgYDVQQLDCNBcHBsZSBXb3Js
ZHdpZGUgRGV2ZWxvcGVyIFJlbGF0aW9uczFEMEIGA1UEAww7QXBwbGUgV29ybGR3
aWRlIERldmVsb3BlciBSZWxhdGlvbnMgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkw
HhcNMjEwODE5MTQzNDM4WhcNMjIwODE5MTQzNDM3WjCBojEqMCgGCgmSJomT8ixk
AQEMGnBhc3MuY29tLmRvY3RvcmFueXRpbWUuYXBwMTEwLwYDVQQDDChQYXNzIFR5
cGUgSUQ6IHBhc3MuY29tLmRvY3RvcmFueXRpbWUuYXBwMRMwEQYDVQQLDAo4RlI0
OFBaMkhCMR8wHQYDVQQKDBZEb2N0b3IgQW55dGltZSBCZWxnaXVtMQswCQYDVQQG
EwJVUzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAPaEFC58qFNYUCWw
oezARAixvjyx0LDRHK9K6aL9+Zy5m97FaUND5BuicSjfJ9x3Twlo0447h0Yrhm5w
qat4iRBvz/m3kd4/KJxxBgx46dr6NoDYju8WqZr5lruHyPaUEOIV8dn1VEv/y7xw
CSt4BNrbARsaI/K2mF01AFtE2h2LqdjrXkAAsXjbgI+BsSpZxYyVjgKrJRX/61a/
JgE7BC8t6XSmZki3pGPeffAMCE+syii7EfdKXZMrN+D/FUI/thGF3L3/9X1INkm1
3EHuqyYAsDWlKFmmerAuHbwMgveTQ3fEosIr8vnSoqJ1yIHpWOG5a6LdRxBQhxRo
NxSfgIUCAwEAAaOCAj4wggI6MAkGA1UdEwQCMAAwHwYDVR0jBBgwFoAUiCcXCam2
GGCL7Ou69kdZxVJUo7cwPQYIKwYBBQUHAQEEMTAvMC0GCCsGAQUFBzABhiFodHRw
Oi8vb2NzcC5hcHBsZS5jb20vb2NzcC13d2RyMDMwggEPBgNVHSAEggEGMIIBAjCB
/wYJKoZIhvdjZAUBMIHxMCkGCCsGAQUFBwIBFh1odHRwOi8vd3d3LmFwcGxlLmNv
bS9hcHBsZWNhLzCBwwYIKwYBBQUHAgIwgbYMgbNSZWxpYW5jZSBvbiB0aGlzIGNl
cnRpZmljYXRlIGJ5IGFueSBwYXJ0eSBhc3N1bWVzIGFjY2VwdGFuY2Ugb2YgdGhl
IHRoZW4gYXBwbGljYWJsZSBzdGFuZGFyZCB0ZXJtcyBhbmQgY29uZGl0aW9ucyBv
ZiB1c2UsIGNlcnRpZmljYXRlIHBvbGljeSBhbmQgY2VydGlmaWNhdGlvbiBwcmFj
dGljZSBzdGF0ZW1lbnRzLjAeBgNVHSUEFzAVBggrBgEFBQcDAgYJKoZIhvdjZAQO
MDAGA1UdHwQpMCcwJaAjoCGGH2h0dHA6Ly9jcmwuYXBwbGUuY29tL3d3ZHJjYS5j
cmwwHQYDVR0OBBYEFCpIPvC4LuHfTKXk3CG+xNrjezmnMAsGA1UdDwQEAwIHgDAQ
BgoqhkiG92NkBgMCBAIFADAqBgoqhkiG92NkBgEQBBwMGnBhc3MuY29tLmRvY3Rv
cmFueXRpbWUuYXBwMA0GCSqGSIb3DQEBBQUAA4IBAQCoWO0eyMFhvmxUWgFSPsR3
CF0CO+h+qZim/AvwaXbt8karBt/AMIa750hoLCdKXbvAS1J5jfxj3rXw0h0IOCa2
VZ9KtjEK6thZ7kfOtOEs0frNvzuC0AeNQX9gF3dOKwhiu8KYwV/qoEj3yqLYiqst
VV5WWpcJokYLbThRqh3oS/ok4oOABJ47IteHIbjOdyUdyH+OdO4LjxqxPRT/Rb+Z
KX82sAAsUMdbH11yMAM8wWij3illQnU48XiZPd3oN6KXdzcXCpk4kjA4NObXY0+d
iGlibqMmvruDXVaAbKu/4Pm+suK5VJaZ43OrQk2XYb6wFyKazapuds98R5VGAda2
-----END CERTIFICATE-----`;
    const passphrase = process.env.KEY_PASSPHRASE;
    const key = process.env.KEY;

    // /tmp acts as a cache when the lambda is "hot"
    // It's automatically flushed when the lambda is cold (±30min w/o access)
    if (!fs.existsSync('/tmp/certificate.pem')) {
        fs.writeFileSync('/tmp/certificate.pem', certificate);
        fs.writeFileSync('/tmp/wwdr.pem', wwdr);
        fs.writeFileSync('/tmp/key.pem', key.replace(/\\n/g, "\n"));
    }

    const hash = crypto.createHash('sha1').update(manifest).digest('hex');
    const manifestFile = `/tmp/manifest.${hash}.json`;
    if (!fs.existsSync(manifestFile)) {
        fs.writeFileSync(manifestFile, manifest)
    }
    const command = `openssl smime -binary -sign -md SHA1 -certfile /tmp/wwdr.pem -signer /tmp/certificate.pem -inkey /tmp/key.pem -in ${manifestFile} -outform DER -passin pass:${passphrase}`
    try {
        const stdout = execSync(command);
        const base64data = stdout.toString('base64');

        return {
            statusCode: 200,
            headers: headers,
            body: base64data,
        };

    } catch (error) {
        console.log(`Status Code: ${error.status} with '${error.message}'`);
        return {
            statusCode: 500,
            headers: headers,
            body: error.status + error.message,
        };
    }
}
