import fetch from 'node-fetch';
import { NativeModules } from 'react-native';

/**
 * For more complex nonce you can pass additional string to server
 */
interface NonceRequestArgs {
  endPointUrl: string;
  additionalData?: string;
}

interface VerifyAttestationArgs {
  endPointUrl: string;
  attestationJws: string;
}

interface VerifyReCaptchaArgs {
  endPointUrl: string;
  token: string;
}

interface NonceRequestResult {
  nonce: string | null;
  error?: string;
}

interface AttestationResult {
  jws: string | null;
  error?: string;
}

interface ReCaptchaResult {
  token: string | null;
  error?: string;
}

type RequestNonce = (args: NonceRequestArgs) => Promise<NonceRequestResult>;
type AttestationRequest = (
  nonce: string,
  apiKey: string
) => Promise<AttestationResult>;
type VerifyAttestation = (args: VerifyAttestationArgs) => Promise<any>;
type ReCaptchaRequest = (apiKey: string) => Promise<ReCaptchaResult>;
type VerifyReCaptcha = (args: VerifyReCaptchaArgs) => Promise<any>;

const { RNSafetyNet } = NativeModules;

const requestNonce: RequestNonce = async args =>
  fetch(args.endPointUrl, {
    body: JSON.stringify({ data: args.additionalData || '' }),
    compress: false,
    method: 'POST',
  }).then(response => {
    if (response.status !== 200) {
      return { error: response.statusText };
    }

    return response.json();
  });

const sendAttestationRequest: AttestationRequest = async (nonce, apiKey) => {
  const attestationResult: AttestationResult = { jws: null };

  const isPlayServicesAvailable: boolean = await RNSafetyNet.isPlayServicesAvailable();
  if (!isPlayServicesAvailable) {
    attestationResult.error = 'Google Play Service is not available!';
  }

  const atteResponse = await RNSafetyNet.sendAttestationRequest(
    nonce,
    apiKey
  ).then((result: any) => result);

  if (atteResponse) {
    attestationResult.jws = atteResponse;
  } else {
    attestationResult.error = 'Attestation request failed!';
  }

  return attestationResult;
};

const verifyAttestationResult: VerifyAttestation = async args =>
  fetch(args.endPointUrl, {
    body: JSON.stringify({ data: args.attestationJws || '' }),
    compress: false,
    method: 'POST',
  }).then(response => {
    if (response.status !== 200) {
      return { error: response.statusText };
    }

    return response.json();
  });

const sendRecaptchaRequest: ReCaptchaRequest = async apiKey => {
  const recaptchaResult: ReCaptchaResult = { token: null };

  const isPlayServicesAvailable: boolean = await RNSafetyNet.isPlayServicesAvailable();
  if (!isPlayServicesAvailable) {
    recaptchaResult.error = 'Google Play Service is not available!';
  }

  const recaptchaResponse = await RNSafetyNet.verifyWithRecaptcha(apiKey).then(
    (result: any) => result
  );

  if (recaptchaResponse) {
    recaptchaResult.token = recaptchaResponse;
  } else {
    recaptchaResult.error = 'reCaptcha request failed!';
  }

  return recaptchaResult;
};

const verifyReCaptchaResult: VerifyReCaptcha = async args =>
  fetch(args.endPointUrl, {
    body: JSON.stringify({ data: args.token || '' }),
    compress: false,
    method: 'POST',
  }).then(response => {
    if (response.status !== 200) {
      return { error: response.statusText };
    }

    return response.json();
  });

export default {
  requestNonce,
  sendAttestationRequest,
  verifyAttestationResult,
  sendRecaptchaRequest,
  verifyReCaptchaResult,
};
